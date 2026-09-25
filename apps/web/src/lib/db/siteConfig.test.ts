import { describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();

vi.mock('$lib/db/mongo', () => ({
	db: {
		collection: () => ({ findOne, updateOne })
	}
}));

const { getGamesEnabled, setGamesEnabled } = await import('$lib/db/siteConfig');

describe('siteConfig', () => {
	it('defaults to enabled when no config doc exists', async () => {
		findOne.mockResolvedValueOnce(null);
		await expect(getGamesEnabled()).resolves.toBe(true);
	});

	it('returns the stored flag', async () => {
		findOne.mockResolvedValueOnce({ key: 'games', gamesEnabled: false });
		await expect(getGamesEnabled()).resolves.toBe(false);
	});

	it('upserts the flag under the fixed key', async () => {
		await setGamesEnabled(false);
		expect(updateOne).toHaveBeenCalledWith(
			{ key: 'games' },
			{ $set: { key: 'games', gamesEnabled: false } },
			{ upsert: true }
		);
	});
});
