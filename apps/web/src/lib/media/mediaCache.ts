import { MEDIA_FIELDS } from '$lib/anilist/anilist';
import { toAnilistId } from '$lib/anilist/anilistId';
import type { Anime, Manga } from '$lib/anilist/anilistTypes';
import { db } from '$lib/db/mongo';

type CachedMedia = Anime & Manga;

type CacheDoc = {
	media_id: number;
	media: CachedMedia;
	cached_at: Date;
};

// Each aliased Media query costs ~31 AniList complexity points and the
// per-query budget is 500, so 12 aliases stay safely under the cap.
const COLLECTION = 'anilist_media';
const BATCH_SIZE = 12;

// Ids AniList answered 404 for. Kept in memory for an hour so a tile with an
// unknown id costs one live call an hour, not one per page view, and the Mongo
// cache only ever holds real media.
const NOT_FOUND_MS = 60 * 60 * 1000;
const notFoundUntil = new Map<number, number>();

const isNotFound = (id: number) => (notFoundUntil.get(id) ?? 0) > Date.now();
const rememberNotFound = (id: number) => notFoundUntil.set(id, Date.now() + NOT_FOUND_MS);

function toMediaIds(ids: (string | number)[]): number[] {
	return [...new Set(ids.map(toAnilistId).filter((id): id is number => id != null))];
}

/** One aliased query for all of `ids`; `failed` when AniList answered with errors or no data. */
async function queryMedia(ids: number[]) {
	const aliases = ids.map((id, j) => `m${j}: Media(id: ${id}) { ${MEDIA_FIELDS} }`).join('\n');
	const response = await fetch('https://graphql.anilist.co', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({ query: `query {\n${aliases}\n}` })
	});
	const body = await response.json().catch(() => null);
	const errors: { status?: number }[] = Array.isArray(body?.errors) ? body.errors : [];
	return {
		media: ids.map((_, j) => (body?.data?.[`m${j}`] ?? null) as CachedMedia | null),
		failed: body?.data == null || errors.length > 0,
		status: errors.some((error) => error?.status === 404) ? 404 : response.status
	};
}

/**
 * Long-term cache for AniList media data, keyed by AniList id. Rows are never
 * evicted, so media that left a 3x3 grid can be re-added later without a new
 * API call. Cache misses fall through to the live API and backfill.
 */
export async function getMediaCached(id: string | number): Promise<CachedMedia | null> {
	const mediaId = toAnilistId(id);
	if (mediaId == null) {
		return null;
	}

	const cached = await db.collection<CacheDoc>(COLLECTION).findOne({ media_id: mediaId });
	if (cached) {
		return cached.media;
	}
	if (isNotFound(mediaId)) {
		return null;
	}

	try {
		const result = await queryMedia([mediaId]);
		const media = result.media[0];
		if (!media && result.status === 404) {
			rememberNotFound(mediaId);
		}
		if (media) {
			console.log(`[mediaCache] cache miss, fetching media ${mediaId}`);
			await db
				.collection<CacheDoc>(COLLECTION)
				.updateOne(
					{ media_id: mediaId },
					{ $set: { media_id: mediaId, media, cached_at: new Date() } },
					{ upsert: true }
				);
		}
		return media;
	} catch (err) {
		// AniList being down should degrade to the error card, not a 500.
		console.error(`[mediaCache] fetch failed for media ${mediaId}:`, err);
		return null;
	}
}

/**
 * Cover and title for each id that is already cached, for the customize editor.
 * Never calls AniList: ids that are not cached yet get their cover after a save
 * warms them.
 */
export async function getCachedCovers(
	ids: (string | number)[]
): Promise<Record<string, { cover: string; title: string }>> {
	const mediaIds = toMediaIds(ids);
	if (mediaIds.length === 0) {
		return {};
	}
	const docs = await db
		.collection<CacheDoc>(COLLECTION)
		.find(
			{ media_id: { $in: mediaIds } },
			{
				projection: {
					_id: 0,
					media_id: 1,
					'media.coverImage.large': 1,
					'media.title.userPreferred': 1
				}
			}
		)
		.toArray();
	return Object.fromEntries(
		docs.map((doc) => [
			String(doc.media_id),
			{ cover: doc.media.coverImage.large, title: doc.media.title.userPreferred }
		])
	);
}

/**
 * Fetches and caches every id that is not cached yet, in batched aliased
 * queries (one HTTP request per BATCH_SIZE ids instead of one per id).
 * Best-effort: failures are logged and self-heal on the next page view.
 * Called after customize saves, since that is the only moment ids change.
 */
export async function warmMediaCache(ids: (string | number)[]): Promise<void> {
	const mediaIds = toMediaIds(ids).filter((id) => !isNotFound(id));
	if (mediaIds.length === 0) {
		return;
	}

	const cachedDocs = await db
		.collection<CacheDoc>(COLLECTION)
		.find({ media_id: { $in: mediaIds } }, { projection: { media_id: 1 } })
		.toArray();
	const cachedIds = new Set(cachedDocs.map((doc) => doc.media_id));
	const missing = mediaIds.filter((id) => !cachedIds.has(id));
	if (missing.length === 0) {
		return;
	}

	console.log(`[mediaCache] warming ${missing.length} media entries`);

	for (let i = 0; i < missing.length; i += BATCH_SIZE) {
		try {
			await warmBatch(missing.slice(i, i + BATCH_SIZE));
		} catch (err) {
			console.error('[mediaCache] batch warm failed:', err);
		}
	}
}

async function warmBatch(ids: number[]): Promise<void> {
	const result = await queryMedia(ids);
	const operations = ids.flatMap((id, j) => {
		const media = result.media[j];
		if (!media) return [];
		const replacement: CacheDoc = { media_id: id, media, cached_at: new Date() };
		return [{ replaceOne: { filter: { media_id: id }, replacement, upsert: true } }];
	});
	if (operations.length > 0) {
		await db.collection<CacheDoc>(COLLECTION).bulkWrite(operations);
	}
	if (!result.failed) return;

	if (ids.length === 1) {
		if (result.status === 404) rememberNotFound(ids[0]);
		else console.error(`[mediaCache] warm failed for media ${ids[0]}: HTTP ${result.status}`);
		return;
	}
	if (result.status === 429) {
		console.error('[mediaCache] batch warm rate limited; the rest warm on a later view');
		return;
	}
	// One unknown id makes AniList fail the whole batch, so ask for the rest one by one.
	for (const [j, id] of ids.entries()) {
		if (!result.media[j]) await warmBatch([id]);
	}
}
