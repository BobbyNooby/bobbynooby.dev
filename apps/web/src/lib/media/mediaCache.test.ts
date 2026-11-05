import { beforeEach, describe, expect, it, vi } from 'vitest';

const find = vi.fn();
vi.mock('$lib/db/mongo', () => ({ db: { collection: () => ({ find }) } }));
vi.mock('$lib/anilist/anilist', () => ({ getMedia: vi.fn(), MEDIA_FIELDS: '' }));

const { getCachedCovers } = await import('./mediaCache');

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
