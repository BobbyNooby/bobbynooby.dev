import type { SpotifyLastPlayedData, SpotifySongData } from './spotifyTypes';

export const errorSong: SpotifySongData = {
	isPlaying: false,
	title: 'Error, song not found. Data shown below is a plug for my song!',
	artist: 'BobbyNooby',
	album: 'Credits Song For My Breakdown',
	albumImageUrl:
		'https://via.placeholder.com/150https://i.scdn.co/image/ab67616d0000b2730e4888261e7b8c069eff0eb7',
	songUrl: 'https://open.spotify.com/album/1Wd1mI2VMP9YHf3Zcp1qhG'
};

export const errorLastPlayedSong: SpotifyLastPlayedData = {
	...errorSong,
	playedAt: new Date('December 7, 2005 00:00:00').toISOString()
};

export async function getCurrentSongData(
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<SpotifySongData> {
	const { data, error }: { data: SpotifySongData; error: any } = await fetch(
		'/api/spotify/now_playing',
		{
			method: 'GET'
		}
	).then((res) => res.json());

	if (error) {
		return errorSong;
	}
	return data;
}

export async function getLastPlayedSongData(
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<SpotifyLastPlayedData> {
	const { data, error }: { data: SpotifyLastPlayedData; error: any } = await fetch(
		'/api/spotify/last_played',
		{
			method: 'GET'
		}
	).then((res) => res.json());

	if (error) {
		return {
			...errorSong,
			playedAt: new Date().toISOString()
		};
	}

	return data;
}
