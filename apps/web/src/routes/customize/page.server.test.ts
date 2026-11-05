import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveTables = vi.fn();
const warmMediaCache = vi.fn();
const getHiddenAppids = vi.fn();
const setAppidHidden = vi.fn();

vi.mock('$lib/db/mongo', () => ({ db: {}, getMongoClient: () => ({}) }));
vi.mock('$lib/admin/persist', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/admin/persist')>()),
	saveTables
}));
vi.mock('$lib/db/mongoUtils.js', () => ({
	getKnown3x3Routes: async () => new Set(['anime', 'manga'])
}));
vi.mock('$lib/db/siteConfig', () => ({ getHiddenAppids, setAppidHidden }));
vi.mock('$lib/media/mediaCache', () => ({ warmMediaCache }));
vi.mock('$lib/steam/steamCache', () => ({}));

const { actions } = await import('./+page.server');

type Event = Parameters<typeof actions.update>[0];

function post(fields: Record<string, string>): Event {
	const body = new FormData();
	for (const [name, value] of Object.entries(fields)) body.set(name, value);
	const request = new Request('http://localhost/customize', { method: 'POST', body });
	return { locals: { isAdmin: true }, request } as unknown as Event;
}

const link = (uid: number) => ({
	uid,
	label: 'GitHub',
	href: 'https://github.com/b',
	color: 'red'
});
const entry = (uid: number) => ({ uid, id: 245, label: 'GTO', bobscore: 0.9 });

function update(overrides: Partial<Record<'links' | 'projects' | 'lists', unknown[]>> = {}) {
	return actions.update(
		post({
			linksTable: JSON.stringify(overrides.links ?? [link(0)]),
			projectsTable: JSON.stringify(overrides.projects ?? []),
			all3x3Data: JSON.stringify(overrides.lists ?? [{ label: 'Anime', data: [entry(0)] }])
		})
	);
}

describe('customize update action', () => {
	beforeEach(() => {
		saveTables.mockReset();
		warmMediaCache.mockReset();
	});

	it('saves a valid payload', async () => {
		expect(await update()).toEqual({ ok: true });
		expect(saveTables).toHaveBeenCalledOnce();
	});

	it('answers a duplicate uid with a readable 400 instead of a 500', async () => {
		await expect(update({ links: [link(1), link(1)] })).resolves.toMatchObject({
			status: 400,
			data: { message: 'Duplicate entry in links' }
		});
		await expect(
			update({ lists: [{ label: 'Anime', data: [entry(3), entry(3)] }] })
		).resolves.toMatchObject({
			status: 400,
			data: { message: 'Duplicate entry in 3x3 list "Anime"' }
		});
		expect(saveTables).not.toHaveBeenCalled();
	});

	it('rejects two lists that name the same collection once lowercased', async () => {
		const lists = [
			{ label: 'Anime', data: [entry(0)] },
			{ label: 'anime', data: [] }
		];
		await expect(update({ lists })).resolves.toMatchObject({
			status: 400,
			data: { message: 'Duplicate 3x3 list: anime' }
		});
		expect(saveTables).not.toHaveBeenCalled();
	});
});

describe('customize toggleGame action', () => {
	beforeEach(() => {
		getHiddenAppids.mockReset();
		setAppidHidden.mockReset();
	});

	it('hides or shows the game the click asked for, without reading the list first', async () => {
		expect(await actions.toggleGame(post({ appid: '730', hide: 'true' }))).toEqual({
			success: true
		});
		expect(await actions.toggleGame(post({ appid: '570', hide: 'false' }))).toEqual({
			success: true
		});
		expect(setAppidHidden.mock.calls).toEqual([
			[730, true],
			[570, false]
		]);
		expect(getHiddenAppids).not.toHaveBeenCalled();
	});

	it('rejects a click that does not say whether to hide or show', async () => {
		const clicks: Record<string, string>[] = [{ appid: '730' }, { appid: '730', hide: 'yes' }];
		for (const fields of clicks) {
			await expect(actions.toggleGame(post(fields))).resolves.toMatchObject({ status: 400 });
		}
		expect(setAppidHidden).not.toHaveBeenCalled();
	});
});
