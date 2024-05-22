import type { SpotifySongData } from './spotify';
import type { SpotifyLastPlayedData } from './supabaseUtils';
export async function getCurrentSongData(): Promise<SpotifySongData> {
	const data: SpotifySongData = await fetch('https://bobbynooby.dev/api/spotify/now_playing', {
		method: 'GET'
	}).then((res) => res.json());
	return data;
}

export async function getLastPlayedSongData(): Promise<SpotifyLastPlayedData> {
	const data: SpotifyLastPlayedData[] = await fetch(
		'https://bobbynooby.dev/api/spotify/last_played',
		{
			method: 'GET'
		}
	).then((res) => res.json());
	return data[0];
}
