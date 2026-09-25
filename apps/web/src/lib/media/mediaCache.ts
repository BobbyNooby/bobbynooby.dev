import { getMedia, MEDIA_FIELDS } from '$lib/anilist/anilist';
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

function toMediaId(id: string | number): number | null {
	const parsed = Number(id);
	return Number.isInteger(parsed) ? parsed : null;
}

/**
 * Long-term cache for AniList media data, keyed by AniList id. Rows are never
 * evicted, so media that left a 3x3 grid can be re-added later without a new
 * API call. Cache misses fall through to the live API and backfill.
 */
export async function getMediaCached(id: string | number): Promise<CachedMedia | null> {
	const mediaId = toMediaId(id);
	if (mediaId == null) {
		return null;
	}

	const cached = await db.collection<CacheDoc>(COLLECTION).findOne({ media_id: mediaId });
	if (cached) {
		return cached.media;
	}

	try {
		const media = (await getMedia(mediaId)) as CachedMedia | null;
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
 * Fetches and caches every id that is not cached yet, in batched aliased
 * queries (one HTTP request per BATCH_SIZE ids instead of one per id).
 * Best-effort: failures are logged and self-heal on the next page view.
 * Called after customize saves, since that is the only moment ids change.
 */
export async function warmMediaCache(ids: (string | number)[]): Promise<void> {
	const mediaIds = [...new Set(ids.map(toMediaId).filter((id): id is number => id != null))];
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
		const chunk = missing.slice(i, i + BATCH_SIZE);
		try {
			const aliases = chunk
				.map((id, j) => `m${j}: Media(id: ${id}) { ${MEDIA_FIELDS} }`)
				.join('\n');
			const response = await fetch('https://graphql.anilist.co', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ query: `query {\n${aliases}\n}` })
			});
			const body = await response.json();
			if (body?.data == null) {
				throw new Error(JSON.stringify(body?.errors ?? body).slice(0, 300));
			}
			const operations = chunk
				.map((id, j) => ({ id, media: body.data[`m${j}`] as CachedMedia | null }))
				.filter((entry): entry is { id: number; media: CachedMedia } => entry.media != null)
				.map((entry) => ({
					replaceOne: {
						filter: { media_id: entry.id },
						replacement: {
							media_id: entry.id,
							media: entry.media,
							cached_at: new Date()
						} satisfies CacheDoc,
						upsert: true
					}
				}));
			if (operations.length > 0) {
				await db.collection<CacheDoc>(COLLECTION).bulkWrite(operations);
			}
		} catch (err) {
			console.error('[mediaCache] batch warm failed:', err);
		}
	}
}
