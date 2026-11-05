import { db, getMongoClient } from '$lib/db/mongo';
import type { ClientSession } from 'mongodb';

// Writing the customize tables. Saving replaces each table whole: every row is
// upserted by uid, then rows that are no longer in the list are deleted.

export type TableUpdate = { collection: string; docs: Record<string, unknown>[] };

export function assertUniqueUids(docs: { uid: number }[], name: string) {
	const seen = new Set<number>();
	for (const doc of docs) {
		if (seen.has(doc.uid)) {
			throw new Error(`Duplicate entry in ${name}`);
		}
		seen.add(doc.uid);
	}
}

// The array position is the order — item_order is derived from it so the
// public site (which sorts by item_order) keeps seeing the same sequence.
export function withOrder<T extends object>(docs: T[]): (T & { item_order: number })[] {
	return docs.map((doc, index) => ({ ...doc, item_order: index }));
}

async function replaceTable(
	collectionName: string,
	docs: Record<string, unknown>[],
	session?: ClientSession
) {
	const collection = db.collection(collectionName);
	const options = session ? { session } : {};
	if (docs.length > 0) {
		await collection.bulkWrite(
			docs.map((doc) => ({
				replaceOne: { filter: { uid: doc.uid }, replacement: doc, upsert: true }
			})),
			options
		);
	}
	await collection.deleteMany({ uid: { $nin: docs.map((doc) => doc.uid) } }, options);
}

/** Writes every table in one transaction, or one after another where there are none. */
export async function saveTables(updates: TableUpdate[]): Promise<void> {
	const mongoSession = getMongoClient().startSession();
	try {
		await mongoSession.withTransaction(async () => {
			for (const update of updates) {
				await replaceTable(update.collection, update.docs, mongoSession);
			}
		});
	} catch {
		// Some deployments (e.g. standalone mongod) have no transactions.
		// The writes are idempotent (upsert by uid, then delete stale), so
		// a plain sequential pass reaches the same end state.
		for (const update of updates) {
			await replaceTable(update.collection, update.docs);
		}
	} finally {
		await mongoSession.endSession();
	}
}
