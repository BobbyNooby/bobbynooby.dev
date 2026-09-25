import type { SteamGameSummary } from './steamTypes';

let games = $state<SteamGameSummary[] | null>(null);

export function getSteamGamesState(): SteamGameSummary[] | null {
	return games;
}

export async function refreshSteamGames(): Promise<void> {
	try {
		const res = await fetch('/api/steam/games');
		const body = (await res.json()) as { configured: boolean; games: SteamGameSummary[] };
		games = body.configured ? body.games : [];
	} catch {
		games = games ?? [];
	}
}

export function startSteamGames(): () => void {
	refreshSteamGames();
	return () => {};
}
