import { db, getMongoClient } from '$lib/db/mongo';
import { getAll3x3Data, getKnown3x3Routes, getLinks, getProjects } from '$lib/db/mongoUtils.js';
import { getGamesEnabled, setGamesEnabled } from '$lib/db/siteConfig';
import { warmMediaCache } from '$lib/media/mediaCache';
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
			steamEnabled: true,
			isSessionValid: false
		};
	}

	const all3x3Data = await getAll3x3Data();
	const links = await getLinks();
	const projects = await getProjects();
	const steamEnabled = await getGamesEnabled().catch(() => true);
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
	return { links, projects, isSessionValid: true, all3x3Data, steam, steamEnabled };
};

const safeHref = /^(https?:\/\/|\/)/i;
const hexOrColorName = /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/;
const safeListLabel = /^[a-zA-Z0-9 _-]+$/;

// visible is deliberately absent: it is client-only UI state and is stripped
// from the payload by zod's default key filtering.
const linkSchema = z.object({
	uid: z.number().int(),
	label: z.string().min(1).max(100),
	href: z.string().min(1).max(2048).regex(safeHref),
	color: z.string().max(64).regex(hexOrColorName)
});

const projectSchema = z.object({
	uid: z.number().int(),
	title: z.string().min(1).max(200),
	description: z.string().max(5000),
	href: z.string().min(1).max(2048).regex(safeHref)
});

// bobscore arrives as a string from the text input, hence the coercion.
// id keeps whatever type the row was created with (legacy rows store numbers).
// review is absent on most legacy rows, so it stays optional.
const entrySchema = z.object({
	uid: z.number().int(),
	id: z.union([z.string().max(200), z.number()]),
	label: z.string().min(1).max(200),
	review: z.string().max(10000).optional(),
	bobscore: z.coerce.number()
});

const listSchema = z.object({
	label: z.string().max(100).regex(safeListLabel),
	data: z.array(entrySchema)
});

function parsePayload<T>(
	schema: z.ZodType<T[]>,
	raw: FormDataEntryValue | null,
	name: string
): T[] {
	if (typeof raw !== 'string' || raw.length === 0) {
		return [];
	}
	let value: unknown;
	try {
		value = JSON.parse(raw);
	} catch {
		throw new Error(`Malformed JSON in ${name}`);
	}
	const parsed = schema.safeParse(value);
	if (!parsed.success) {
		const issue = parsed.error.issues[0];
		throw new Error(`Invalid ${name}: ${issue.path.join('.')} ${issue.message}`);
	}
	return parsed.data;
}

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

	toggleGames: async (event) => {
		if (!event.locals.isAdmin) {
			return fail(403, { message: 'You are not authorized to make changes.' });
		}
		const formData = await event.request.formData();
		const enabled = formData.get('enabled') === 'true';
		try {
			await setGamesEnabled(enabled);
			return { success: true, enabled };
		} catch (err) {
			console.error('[steam] toggle failed:', err);
			return fail(500, { message: 'Could not update the games section.' });
		}
	}
} satisfies Actions;
