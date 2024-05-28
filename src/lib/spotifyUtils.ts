import type { SpotifySongData } from './spotify';
import type { SpotifyLastPlayedData } from './supabaseUtils';
export async function getCurrentSongData(): Promise<SpotifySongData> {
	const { data, error }: { data: SpotifySongData; error: any } = await fetch(
		'https://bobbynooby.dev/api/spotify/now_playing',
		{
			method: 'GET'
		}
	).then((res) => res.json());

	if (error) {
		return {
			isPlaying: false,
			title: 'Error',
			artist: 'Error',
			album: 'Error',
			albumImageUrl: 'Error',
			songUrl: 'Error'
		};
	}
	return data;
}

export async function getLastPlayedSongData(): Promise<SpotifyLastPlayedData> {
	const { data, error }: { data: SpotifyLastPlayedData; error: any } = await fetch(
		'https://bobbynooby.dev/api/spotify/last_played',
		{
			method: 'GET'
		}
	).then((res) => res.json());

	if (error) {
		return {
			time: 0,
			title: 'Error',
			artist: 'Error',
			album: 'Error',
			albumImageUrl: 'Error',
			songUrl: 'Error'
		};
	}

	return data;
}
