import { sanitizeAnilistHtml } from '$lib/media/sanitize';
import type {
	OwnedGameRaw,
	SteamAchievementCount,
	SteamGameDetails,
	SteamGameSummary
} from './steamTypes';

export type { OwnedGameRaw };

const STEAM_CDN = 'https://steamcdn-a.akamaihd.net';

export function capsuleUrl(appid: number): string {
	return `${STEAM_CDN}/steam/apps/${appid}/library_600x900.jpg`;
}

export function iconUrl(appid: number, imgIconUrl: string): string {
	return `${STEAM_CDN}/steamcommunity/public/images/apps/${appid}/${imgIconUrl}.jpg`;
}

export function mapOwnedGames(games: OwnedGameRaw[] | undefined, topN: number): SteamGameSummary[] {
	return (games ?? [])
		.slice()
		.sort((a, b) => b.playtime_forever - a.playtime_forever)
		.slice(0, topN)
		.map((g) => ({
			appid: g.appid,
			name: g.name,
			hours: Math.floor(g.playtime_forever / 60),
			lastPlayed: g.rtime_last_played ?? null,
			capsule: capsuleUrl(g.appid),
			icon: iconUrl(g.appid, g.img_icon_url)
		}));
}

type AppDetailsBody = { data?: Record<string, unknown>; success?: boolean };

export function mapAppDetails(appid: number, body: unknown): SteamGameDetails {
	// Steam may answer under a different key than requested (edition aliasing).
	const entry = Object.values((body ?? {}) as Record<string, AppDetailsBody>)[0];
	const data = entry?.success ? (entry.data ?? {}) : {};
	const genres = Array.isArray(data.genres) ? data.genres : [];
	return {
		appid,
		name: typeof data.name === 'string' ? data.name : 'Game',
		description:
			typeof data.detailed_description === 'string'
				? sanitizeAnilistHtml(data.detailed_description)
				: '',
		short: typeof data.short_description === 'string' ? data.short_description : '',
		headerImage: typeof data.header_image === 'string' ? data.header_image : null,
		releaseDate:
			typeof (data.release_date as { date?: unknown })?.date === 'string'
				? (data.release_date as { date: string }).date
				: null,
		genres: genres
			.map((g) =>
				typeof (g as { description?: unknown })?.description === 'string'
					? (g as { description: string }).description
					: ''
			)
			.filter(Boolean),
		achievements: { unlocked: 0, total: 0 }
	};
}

export function mapAchievements(body: unknown): SteamAchievementCount {
	const stats = (
		body as { playerstats?: { achievements?: { achieved: number }[]; error?: unknown } }
	)?.playerstats;
	if (!stats || stats.error || !Array.isArray(stats.achievements)) {
		return { unlocked: 0, total: 0 };
	}
	return {
		unlocked: stats.achievements.filter((a) => a.achieved === 1).length,
		total: stats.achievements.length
	};
}
