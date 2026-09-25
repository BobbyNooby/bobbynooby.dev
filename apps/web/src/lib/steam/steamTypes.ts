export type SteamGameSummary = {
	appid: number;
	name: string;
	hours: number;
	lastPlayed: number | null;
	capsule: string;
	icon: string;
};

export type SteamAchievementCount = { unlocked: number; total: number };

export type SteamGameDetails = {
	appid: number;
	name: string;
	description: string;
	short: string;
	headerImage: string | null;
	releaseDate: string | null;
	genres: string[];
	achievements: SteamAchievementCount;
};

export type OwnedGameRaw = {
	appid: number;
	name: string;
	img_icon_url: string;
	playtime_forever: number;
	rtime_last_played?: number;
};
