import { beforeEach, describe, expect, it, vi } from 'vitest';

const bulkWrite = vi.fn();
const deleteMany = vi.fn();
const endSession = vi.fn();
const withTransaction = vi.fn();
const session = { withTransaction, endSession };

vi.mock('$lib/db/mongo', () => ({
	db: { collection: () => ({ bulkWrite, deleteMany }) },
	getMongoClient: () => ({ startSession: () => session })
}));

const { assertUniqueUids, saveTables, withOrder } = await import('./persist');

describe('withOrder', () => {
	it('stores the array position as item_order', () => {
		expect(withOrder([{ uid: 7 }, { uid: 3 }])).toEqual([
			{ uid: 7, item_order: 0 },
			{ uid: 3, item_order: 1 }
		]);
	});
});

describe('assertUniqueUids', () => {
	it('throws on a repeated uid and names the table', () => {
		expect(() => assertUniqueUids([{ uid: 1 }, { uid: 1 }], 'links')).toThrow(
			'Duplicate entry in links'
		);
		expect(() => assertUniqueUids([{ uid: 1 }, { uid: 2 }], 'links')).not.toThrow();
	});
});

describe('saveTables', () => {
	beforeEach(() => {
		for (const fn of [bulkWrite, deleteMany, endSession, withTransaction]) fn.mockReset();
	});

	it('upserts by uid and deletes the rest inside one transaction', async () => {
		withTransaction.mockImplementation(async (run: () => Promise<void>) => run());
		await saveTables([{ collection: 'links', docs: [{ uid: 1, label: 'a' }] }]);
		expect(bulkWrite).toHaveBeenCalledWith(
			[
				{
					replaceOne: {
						filter: { uid: 1 },
						replacement: { uid: 1, label: 'a' },
						upsert: true
					}
				}
			],
			{ session }
		);
		expect(deleteMany).toHaveBeenCalledWith({ uid: { $nin: [1] } }, { session });
		expect(endSession).toHaveBeenCalledOnce();
	});

	it('falls back to plain writes where transactions are not available', async () => {
		withTransaction.mockRejectedValue(
			new Error('Transaction numbers are only allowed on a replica set')
		);
		await saveTables([{ collection: 'projects', docs: [] }]);
		expect(bulkWrite).not.toHaveBeenCalled();
		expect(deleteMany).toHaveBeenCalledWith({ uid: { $nin: [] } }, {});
		expect(endSession).toHaveBeenCalledOnce();
	});
});
