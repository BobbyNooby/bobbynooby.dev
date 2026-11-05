import { describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();

vi.mock('$lib/db/mongo', () => ({
	db: {
		collection: () => ({ findOne, updateOne })
	}
}));

const { getHiddenAppids, setAppidHidden } = await import('$lib/db/siteConfig');

describe('siteConfig', () => {
	it('defaults to an empty hidden set when no config doc exists', async () => {
		findOne.mockResolvedValueOnce(null);
		await expect(getHiddenAppids()).resolves.toEqual(new Set());
	});

	it('returns the stored appids as a set', async () => {
		findOne.mockResolvedValueOnce({ key: 'games', hiddenAppids: [730, 570] });
		await expect(getHiddenAppids()).resolves.toEqual(new Set([730, 570]));
	});

	it('tolerates a legacy doc without hiddenAppids', async () => {
		findOne.mockResolvedValueOnce({ key: 'games' });
		await expect(getHiddenAppids()).resolves.toEqual(new Set());
	});

	// One atomic update per click, so two quick clicks cannot overwrite each other's list.
	it('hides a game with $addToSet under the fixed key', async () => {
		await setAppidHidden(730, true);
		expect(updateOne).toHaveBeenLastCalledWith(
			{ key: 'games' },
			{ $addToSet: { hiddenAppids: 730 } },
			{ upsert: true }
		);
	});

	it('shows a game again with $pull', async () => {
		await setAppidHidden(730, false);
		expect(updateOne).toHaveBeenLastCalledWith(
			{ key: 'games' },
			{ $pull: { hiddenAppids: 730 } },
			{ upsert: true }
		);
	});
});
