import type { SteamGameListItem } from './steamTypes';

let games = $state<SteamGameListItem[] | null>(null);

export function getSteamGamesState(): SteamGameListItem[] | null {
	return games;
}

export async function refreshSteamGames(): Promise<void> {
	try {
		const res = await fetch('/api/steam/games');
		const body = (await res.json()) as { configured: boolean; games: SteamGameListItem[] };
		games = body.configured ? body.games : [];
	} catch {
		games = games ?? [];
	}
}

export function startSteamGames(): () => void {
	refreshSteamGames();
	return () => {};
}
