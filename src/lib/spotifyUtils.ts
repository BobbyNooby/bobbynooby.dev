import type { SpotifySongData } from './spotify';

export async function getSongData(): Promise<SpotifySongData> {
	const data: SpotifySongData = await fetch('http://localhost:5173/api/spotify_now_playing', {
		method: 'GET'
	}).then((res) => res.json());
	return data;
}
