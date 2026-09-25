import { env } from '$env/dynamic/private';
import { db } from '$lib/db/mongo';
import { mapAchievements, mapAppDetails, mapOwnedGames } from './steamTransforms';
import type { OwnedGameRaw, SteamGameDetails, SteamGameSummary } from './steamTypes';

export const LIST_TTL_MS = 6 * 60 * 60 * 1000;
export const DETAILS_TTL_MS = 24 * 60 * 60 * 1000;

const LIST_COLLECTION = 'steam_games_cache';
const DETAILS_COLLECTION = 'steam_game_details';
const STEAM_API = 'https://api.steampowered.com';
const STEAM_STORE = 'https://store.steampowered.com/api/appdetails';

type GamesCacheDoc = { key: string; fetchedAt: Date; games: OwnedGameRaw[] };
type DetailsCacheDoc = { appid: number; fetchedAt: Date; details: SteamGameDetails };

export function steamConfigured(): boolean {
	return Boolean(env.STEAM_API_KEY && env.STEAM_USER_ID);
}

export function isStale(fetchedAt: Date | undefined, ttlMs: number, now = Date.now()): boolean {
	if (!fetchedAt) return true;
	return now - fetchedAt.getTime() > ttlMs;
}

async function fetchOwnedGames(): Promise<OwnedGameRaw[]> {
	const url = `${STEAM_API}/IPlayerService/GetOwnedGames/v1/?key=${env.STEAM_API_KEY}&steamid=${env.STEAM_USER_ID}&include_appinfo=true&include_played_free=true&include_last_played=true`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`GetOwnedGames responded ${res.status}`);
	const body = (await res.json()) as { response?: { games?: OwnedGameRaw[] } };
	return body.response?.games ?? [];
}

export async function getSteamGames(topN = 16): Promise<SteamGameSummary[]> {
	const cached =
		(await db.collection<GamesCacheDoc>(LIST_COLLECTION).findOne({ key: 'games' })) ?? undefined;
	if (cached && !isStale(cached.fetchedAt, LIST_TTL_MS)) {
		return mapOwnedGames(cached.games, topN);
	}
	try {
		const games = await fetchOwnedGames();
		await db
			.collection(LIST_COLLECTION)
			.updateOne(
				{ key: 'games' },
				{ $set: { key: 'games', fetchedAt: new Date(), games } },
				{ upsert: true }
			);
		return mapOwnedGames(games, topN);
	} catch (err) {
		console.error('[steam] owned games fetch failed:', err);
		return mapOwnedGames(cached?.games, topN);
	}
}

export async function getAllSteamGames(): Promise<SteamGameSummary[]> {
	return getSteamGames(Number.MAX_SAFE_INTEGER);
}

async function fetchAppDetails(appid: number): Promise<unknown> {
	const res = await fetch(`${STEAM_STORE}?appids=${appid}&l=english`);
	if (!res.ok) throw new Error(`appdetails responded ${res.status}`);
	return res.json();
}

async function fetchAchievements(appid: number): Promise<unknown> {
	const url = `${STEAM_API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${env.STEAM_API_KEY}&steamid=${env.STEAM_USER_ID}&appid=${appid}`;
	const res = await fetch(url);
	if (!res.ok) return null; // games without achievements answer non-200
	return res.json();
}

export async function getSteamGameDetails(appid: number): Promise<SteamGameDetails | null> {
	const cached =
		(await db.collection<DetailsCacheDoc>(DETAILS_COLLECTION).findOne({ appid })) ?? undefined;
	if (cached && !isStale(cached.fetchedAt, DETAILS_TTL_MS)) {
		return cached.details;
	}
	try {
		const [rawDetails, rawAchievements] = await Promise.all([
			fetchAppDetails(appid),
			fetchAchievements(appid)
		]);
		const details = {
			...mapAppDetails(appid, rawDetails),
			achievements: mapAchievements(rawAchievements)
		};
		await db
			.collection(DETAILS_COLLECTION)
			.updateOne({ appid }, { $set: { appid, fetchedAt: new Date(), details } }, { upsert: true });
		return details;
	} catch (err) {
		console.error(`[steam] details fetch failed for ${appid}:`, err);
		return cached?.details ?? null;
	}
}

export async function dropSteamCache(): Promise<void> {
	await db.collection(LIST_COLLECTION).deleteMany({});
	await db.collection(DETAILS_COLLECTION).deleteMany({});
}

export async function getSteamCacheMeta(): Promise<{ fetchedAt: string | null }> {
	if (!steamConfigured()) return { fetchedAt: null };
	const cached = await db
		.collection<{ fetchedAt: Date }>(LIST_COLLECTION)
		.findOne({ key: 'games' });
	return { fetchedAt: cached?.fetchedAt?.toISOString() ?? null };
}
