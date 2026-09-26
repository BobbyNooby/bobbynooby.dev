import { afterEach, describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();
const deleteMany = vi.fn();
const collection = vi.fn(() => ({ findOne, updateOne, deleteMany }));

vi.mock('$lib/db/mongo', () => ({ db: { collection } }));
vi.mock('$env/dynamic/private', () => ({
	env: { STEAM_API_KEY: 'k', STEAM_USER_ID: 's' }
}));

const getHiddenAppids = vi.fn(async () => new Set<number>());
vi.mock('$lib/db/siteConfig', () => ({ getHiddenAppids }));

const { getSteamGames, getAllSteamGames, getSteamGameDetails, isStale, LIST_TTL_MS } = await import(
	'./steamCache'
);

afterEach(() => {
	findOne.mockReset();
	updateOne.mockReset();
	deleteMany.mockReset();
	getHiddenAppids.mockClear();
	vi.unstubAllGlobals();
});

describe('isStale', () => {
	it('is stale when missing or older than the ttl', () => {
		const now = Date.now();
		expect(isStale(undefined, LIST_TTL_MS, now)).toBe(true);
		expect(isStale(new Date(now - LIST_TTL_MS - 1), LIST_TTL_MS, now)).toBe(true);
		expect(isStale(new Date(now - LIST_TTL_MS + 1000), LIST_TTL_MS, now)).toBe(false);
	});
});

describe('getSteamGames', () => {
	it('serves a fresh cache without hitting Steam', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		findOne.mockResolvedValue({
			key: 'games',
			fetchedAt: new Date(),
			games: [{ appid: 1, name: 'G', img_icon_url: 'a', playtime_forever: 120 }]
		});
		await expect(getSteamGames(16)).resolves.toHaveLength(1);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(updateOne).not.toHaveBeenCalled();
	});

	it('fetches and upserts when stale, serving stale on upstream failure', async () => {
		findOne.mockResolvedValueOnce({
			key: 'games',
			fetchedAt: new Date(Date.now() - LIST_TTL_MS - 1000),
			games: [{ appid: 1, name: 'Old', img_icon_url: 'a', playtime_forever: 60 }]
		});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('steam down')));
		await expect(getSteamGames(16)).resolves.toMatchObject([{ name: 'Old' }]);
		expect(updateOne).not.toHaveBeenCalled();
	});

	it('fetches fresh data and upserts on a cold cache', async () => {
		findOne.mockResolvedValueOnce(null);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						response: {
							game_count: 1,
							games: [{ appid: 9, name: 'New', img_icon_url: 'i', playtime_forever: 600 }]
						}
					}),
					{ status: 200 }
				)
			)
		);
		const games = await getSteamGames(16);
		expect(games[0]).toMatchObject({ appid: 9, hours: 10 });
		expect(updateOne).toHaveBeenCalledWith(
			{ key: 'games' },
			expect.objectContaining({ $set: expect.objectContaining({ key: 'games' }) }),
			expect.objectContaining({ upsert: true })
		);
	});

	it('excludes hidden games and zero-hour games before slicing', async () => {
		getHiddenAppids.mockResolvedValue(new Set([2]));
		findOne.mockResolvedValue({
			key: 'games',
			fetchedAt: new Date(),
			games: [
				{ appid: 1, name: 'Visible', img_icon_url: 'a', playtime_forever: 120 },
				{ appid: 2, name: 'Hidden', img_icon_url: 'a', playtime_forever: 999 },
				{ appid: 3, name: 'NeverPlayed', img_icon_url: 'a', playtime_forever: 0 }
			]
		});
		await expect(getSteamGames(16)).resolves.toEqual([
			expect.objectContaining({ appid: 1, name: 'Visible' })
		]);
	});

	it('getAllSteamGames returns everything, including hidden and zero-hour games', async () => {
		getHiddenAppids.mockResolvedValue(new Set([2]));
		findOne.mockResolvedValue({
			key: 'games',
			fetchedAt: new Date(),
			games: [
				{ appid: 1, name: 'Visible', img_icon_url: 'a', playtime_forever: 120 },
				{ appid: 2, name: 'Hidden', img_icon_url: 'a', playtime_forever: 999 },
				{ appid: 3, name: 'NeverPlayed', img_icon_url: 'a', playtime_forever: 0 }
			]
		});
		const all = await getAllSteamGames();
		expect(all.map((g) => g.appid)).toEqual([2, 1, 3]);
	});
});

describe('getSteamGameDetails', () => {
	it('composes details from appdetails + achievements and upserts', async () => {
		findOne.mockResolvedValueOnce(null);
		vi.stubGlobal(
			'fetch',
			vi.fn((url: string | URL | Request) => {
				const u = String(url);
				if (u.includes('appdetails')) {
					return Promise.resolve(
						new Response(
							JSON.stringify({
								'555': {
									success: true,
									data: {
										name: 'D',
										short_description: 's',
										detailed_description: '<b>x</b>',
										header_image: 'h',
										release_date: { date: '1 Jan, 2020' },
										genres: [{ description: 'RPG' }]
									}
								}
							}),
							{ status: 200 }
						)
					);
				}
				return Promise.resolve(
					new Response(
						JSON.stringify({ playerstats: { achievements: [{ achieved: 1 }, { achieved: 1 }] } }),
						{ status: 200 }
					)
				);
			})
		);
		const d = await getSteamGameDetails(555);
		expect(d).toMatchObject({
			appid: 555,
			name: 'D',
			description: '<b>x</b>',
			achievements: { unlocked: 2, total: 2 }
		});
		expect(updateOne).toHaveBeenCalled();
	});

	it('returns the cached doc when upstream fails', async () => {
		findOne.mockResolvedValueOnce({
			appid: 555,
			fetchedAt: new Date(Date.now() - LIST_TTL_MS * 5),
			details: {
				appid: 555,
				name: 'Cached',
				description: '',
				short: '',
				headerImage: null,
				releaseDate: null,
				genres: [],
				achievements: { unlocked: 0, total: 0 }
			}
		});
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
		await expect(getSteamGameDetails(555)).resolves.toMatchObject({ name: 'Cached' });
	});
});
