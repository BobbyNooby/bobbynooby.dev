import { describe, expect, it, vi } from 'vitest';

const findOne = vi.fn();
const updateOne = vi.fn();

vi.mock('$lib/db/mongo', () => ({
	db: {
		collection: () => ({ findOne, updateOne })
	}
}));

const { getHiddenAppids, setHiddenAppids } = await import('$lib/db/siteConfig');

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

	it('upserts the hidden list under the fixed key', async () => {
		await setHiddenAppids([730]);
		expect(updateOne).toHaveBeenCalledWith(
			{ key: 'games' },
			{ $set: { key: 'games', hiddenAppids: [730] } },
			{ upsert: true }
		);
	});
});
