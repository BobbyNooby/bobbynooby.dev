import { parsePayload } from '$lib/admin/parsePayload';
import { linkSchema, listSchema, projectSchema } from '$lib/admin/schemas';
import { db, getMongoClient } from '$lib/db/mongo';
import { getAll3x3Data, getKnown3x3Routes, getLinks, getProjects } from '$lib/db/mongoUtils.js';
import { getHiddenAppids, setHiddenAppids } from '$lib/db/siteConfig';
import { getCachedCovers, warmMediaCache } from '$lib/media/mediaCache';
import { dropSteamCache, getAllSteamGames, getSteamCacheMeta } from '$lib/steam/steamCache';
import type { SteamGameSummary } from '$lib/steam/steamTypes';
import { fail, type Actions } from '@sveltejs/kit';
import type { ClientSession } from 'mongodb';
import { z } from 'zod';

export const load = async ({ locals }) => {
	// Never hand edit data to visitors that cannot use it.
	if (!locals.isAdmin) {
		return {
			links: [],
			projects: [],
			all3x3Data: [],
			steam: { games: [], lastRefresh: null },
			steamHidden: [],
			covers: {},
			isSessionValid: false
		};
	}

	const all3x3Data = await getAll3x3Data();
	const links = await getLinks();
	const projects = await getProjects();
	const steamHidden = await getHiddenAppids().catch(() => new Set<number>());
	const covers = await getCachedCovers(
		all3x3Data.flatMap((list) => list.data.map((entry) => entry.id))
	).catch((err) => {
		console.error('[mediaCache] cover read failed for customize:', err);
		return {};
	});
	let steam: { games: SteamGameSummary[]; lastRefresh: string | null } = {
		games: [],
		lastRefresh: null
	};
	try {
		const [games, meta] = await Promise.all([getAllSteamGames(), getSteamCacheMeta()]);
		steam = { games, lastRefresh: meta.fetchedAt };
	} catch (err) {
		console.error('[steam] cache read failed for customize:', err);
	}
	return {
		links,
		projects,
		isSessionValid: true,
		all3x3Data,
		steam,
		steamHidden: [...steamHidden],
		covers
	};
};

function assertUniqueUids(docs: { uid: number }[], name: string) {
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
function withOrder<T extends object>(docs: T[]): (T & { item_order: number })[] {
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

export const actions = {
	update: async (event) => {
		if (!event.locals.isAdmin) {
			return fail(403, { message: 'You are not authorized to make changes.' });
		}

		let links: z.infer<typeof linkSchema>[];
		let projects: z.infer<typeof projectSchema>[];
		let all3x3: z.infer<typeof listSchema>[];
		try {
			const formData = await event.request.formData();
			links = parsePayload(z.array(linkSchema), formData.get('linksTable'), 'links');
			projects = parsePayload(z.array(projectSchema), formData.get('projectsTable'), 'projects');
			all3x3 = parsePayload(z.array(listSchema), formData.get('all3x3Data'), '3x3 lists');
		} catch (err) {
			return fail(400, { message: err instanceof Error ? err.message : 'Invalid data' });
		}

		assertUniqueUids(links, 'links');
		assertUniqueUids(projects, 'projects');
		for (const list of all3x3) {
			assertUniqueUids(list.data, `3x3 list "${list.label}"`);
		}

		// Only write to 3x3 collections that already exist in the routes doc,
		// so a mangled label can never mint an arbitrary new collection.
		const knownRoutes = await getKnown3x3Routes();
		for (const list of all3x3) {
			if (!knownRoutes.has(list.label.toLowerCase())) {
				return fail(400, { message: `Unknown 3x3 list: ${list.label}` });
			}
		}

		const updates = [
			{ collection: 'links', docs: withOrder(links) },
			{ collection: 'projects', docs: withOrder(projects) },
			...all3x3.map((list) => ({
				collection: '3x3_' + list.label.toLowerCase(),
				docs: withOrder(list.data)
			}))
		];

		try {
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
		} catch (err) {
			console.error('Failed to persist customize data:', err);
			return fail(500, { message: 'Failed to save changes. Please try again.' });
		}

		// Pre-fetch AniList data for every 3x3 id so the public pages are
		// served from the Mongo cache and never hit the rate-limited API.
		// Best-effort: a failed warm self-heals on the next page view.
		try {
			await warmMediaCache(all3x3.flatMap((list) => list.data.map((entry) => entry.id)));
		} catch (err) {
			console.error('[mediaCache] post-save warm failed:', err);
		}

		return { ok: true };
	},

	refreshSteam: async (event) => {
		if (!event.locals.isAdmin) {
			return fail(403, { message: 'You are not authorized to make changes.' });
		}
		try {
			await dropSteamCache();
			await getAllSteamGames();
			return { success: true };
		} catch (err) {
			console.error('[steam] cache refresh failed:', err);
			return fail(500, { message: 'Steam cache refresh failed.' });
		}
	},

	toggleGame: async (event) => {
		if (!event.locals.isAdmin) {
			return fail(403, { message: 'You are not authorized to make changes.' });
		}
		const formData = await event.request.formData();
		const appid = Number(formData.get('appid'));
		if (!Number.isInteger(appid)) {
			return fail(400, { message: 'Invalid game.' });
		}
		try {
			const hidden = await getHiddenAppids();
			if (hidden.has(appid)) {
				hidden.delete(appid);
			} else {
				hidden.add(appid);
			}
			await setHiddenAppids([...hidden]);
			return { success: true };
		} catch (err) {
			console.error('[steam] toggle failed:', err);
			return fail(500, { message: 'Could not update the hidden games.' });
		}
	}
} satisfies Actions;
