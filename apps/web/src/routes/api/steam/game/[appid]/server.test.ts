import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSteamGameDetails, ownsSteamGame } = vi.hoisted(() => ({
	getSteamGameDetails: vi.fn(),
	ownsSteamGame: vi.fn()
}));
vi.mock('$lib/steam/steamCache', () => ({
	steamConfigured: () => true,
	getSteamGameDetails,
	ownsSteamGame
}));

const { GET } = await import('./+server');

const get = (appid: string) => GET({ params: { appid } } as unknown as Parameters<typeof GET>[0]);

beforeEach(() => {
	getSteamGameDetails.mockReset();
	ownsSteamGame.mockReset();
	ownsSteamGame.mockImplementation(async (appid: number) => appid === 570);
	getSteamGameDetails.mockResolvedValue({ appid: 570, name: 'Dota 2' });
});

describe('GET /api/steam/game/[appid]', () => {
	it('serves details for a game in the owned list', async () => {
		const res = await get('570');
		expect(res.status).toBe(200);
		await expect(res.json()).resolves.toMatchObject({ details: { name: 'Dota 2' } });
		expect(getSteamGameDetails).toHaveBeenCalledWith(570);
	});

	it('answers 404 for a game not in the owned list, without asking Steam', async () => {
		const res = await get('123456');
		expect(res.status).toBe(404);
		await expect(res.json()).resolves.toEqual({ message: 'unknown appid' });
		expect(getSteamGameDetails).not.toHaveBeenCalled();
	});

	it('answers 400 for non-digits and for numbers too big to be an appid', async () => {
		for (const appid of ['abc', '1e5', '-5', '9007199254740993', '9'.repeat(30)]) {
			await expect(get(appid), appid).rejects.toMatchObject({ status: 400 });
		}
		expect(ownsSteamGame).not.toHaveBeenCalled();
	});
});
