import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const find = vi.fn();
const findOne = vi.fn();
const bulkWrite = vi.fn();
const updateOne = vi.fn();
vi.mock('$lib/db/mongo', () => ({
	db: { collection: () => ({ find, findOne, bulkWrite, updateOne }) }
}));
vi.mock('$lib/anilist/anilist', () => ({ getMedia: vi.fn(), MEDIA_FIELDS: '' }));

const { getCachedCovers, getMediaCached, warmMediaCache } = await import('./mediaCache');

describe('getCachedCovers', () => {
	beforeEach(() => find.mockReset());

	it('returns cover and title keyed by id, from the cache only', async () => {
		find.mockReturnValue({
			toArray: async () => [
				{
					media_id: 245,
					media: {
						coverImage: { large: 'https://s4.anilist.co/245.jpg' },
						title: { userPreferred: 'GTO' }
					}
				}
			]
		});
		const covers = await getCachedCovers([245, '245', 'not-a-number', 30336]);
		expect(find).toHaveBeenCalledWith(
			{ media_id: { $in: [245, 30336] } },
			expect.objectContaining({ projection: expect.any(Object) })
		);
		expect(covers).toEqual({ '245': { cover: 'https://s4.anilist.co/245.jpg', title: 'GTO' } });
	});

	it('skips the query when there is nothing to look up', async () => {
		expect(await getCachedCovers(['', 'abc'])).toEqual({});
		expect(find).not.toHaveBeenCalled();
	});
});

// A stand-in for AniList: like the real one, an unknown id fails the whole
// aliased query with a 404 and no media.
const media = (id: number) => ({ id, title: { userPreferred: `media ${id}` } });
let known: Set<number>;
let fail: number | null;
const fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
	const { query } = JSON.parse(init.body);
	const ids = [...query.matchAll(/Media\(id: (\d+)\)/g)].map((m: string[]) => Number(m[1]));
	const alias = (fill: (id: number) => unknown) =>
		Object.fromEntries(ids.map((id, j) => [`m${j}`, fill(id)]));
	if (fail != null && ids.length > 1) {
		return Response.json({ data: null, errors: [{ status: fail }] }, { status: fail });
	}
	if (ids.some((id) => !known.has(id))) {
		return Response.json(
			{ data: alias(() => null), errors: [{ message: 'Not Found.', status: 404 }] },
			{ status: 404 }
		);
	}
	return Response.json({ data: alias(media) });
});

const queriedIds = () =>
	fetchMock.mock.calls.map(([, init]) =>
		[...JSON.parse(init.body).query.matchAll(/Media\(id: (\d+)\)/g)].map((m: string[]) =>
			Number(m[1])
		)
	);
const writtenIds = () =>
	bulkWrite.mock.calls.flatMap(([ops]) =>
		ops.map((op: { replaceOne: { filter: { media_id: number } } }) => op.replaceOne.filter.media_id)
	);

describe('warmMediaCache', () => {
	beforeEach(() => {
		for (const fn of [find, findOne, bulkWrite, updateOne, fetchMock]) fn.mockClear();
		find.mockReturnValue({ toArray: async () => [] });
		known = new Set([101, 102, 104, 105]);
		fail = null;
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	it('never asks AniList about ids that cannot exist', async () => {
		await warmMediaCache(['abc', '-5', '1.5', '1e5', '0x10', ' 7', '0', 0, '99999999999', 2 ** 31]);
		expect(find).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('caches the known ids when one unknown id spoils the batch', async () => {
		await warmMediaCache([101, '102', 103, 104]);
		expect(queriedIds()).toEqual([[101, 102, 103, 104], [101], [102], [103], [104]]);
		expect(writtenIds()).toEqual([101, 102, 104]);
	});

	it('retries one at a time when the batch comes back with data: null', async () => {
		fail = 400;
		await warmMediaCache([104, 105]);
		expect(queriedIds()).toEqual([[104, 105], [104], [105]]);
		expect(writtenIds()).toEqual([104, 105]);
	});

	it('does not retry one by one when AniList is rate limiting', async () => {
		fail = 429;
		await warmMediaCache([101, 102]);
		expect(queriedIds()).toEqual([[101, 102]]);
		expect(bulkWrite).not.toHaveBeenCalled();
	});

	it('remembers an id AniList does not know, so later warms and page views skip it', async () => {
		await warmMediaCache([106]);
		expect(queriedIds()).toEqual([[106]]);
		fetchMock.mockClear();
		findOne.mockResolvedValue(null);
		await warmMediaCache([106]);
		expect(await getMediaCached(106)).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe('getMediaCached', () => {
	beforeEach(() => {
		for (const fn of [findOne, updateOne, fetchMock]) fn.mockClear();
		findOne.mockResolvedValue(null);
		known = new Set([201]);
		fail = null;
		vi.stubGlobal('fetch', fetchMock);
	});
	afterEach(() => vi.unstubAllGlobals());

	it('serves from the cache without calling AniList', async () => {
		findOne.mockResolvedValue({ media_id: 201, media: media(201) });
		expect(await getMediaCached('201')).toEqual(media(201));
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('fetches and caches a miss', async () => {
		expect(await getMediaCached(201)).toEqual(media(201));
		expect(updateOne).toHaveBeenCalledOnce();
	});

	it('skips AniList for ids that cannot exist', async () => {
		for (const id of ['', '1e5', '-1', 99999999999]) {
			expect(await getMediaCached(id)).toBeNull();
		}
		expect(findOne).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('asks about an unknown id once, not on every page view', async () => {
		expect(await getMediaCached(202)).toBeNull();
		expect(await getMediaCached(202)).toBeNull();
		expect(await getMediaCached('202')).toBeNull();
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(updateOne).not.toHaveBeenCalled();
	});
});
