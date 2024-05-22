export type SpotifyLastPlayedData = {
	time: number;
	title: string;
	artist: string;
	album: string;
	albumImageUrl: string;
	songUrl: string;
};

export async function updateSpotifyLastPlayedData(): Promise<void> {
	const response = await fetch('https://bobbynooby.dev/api/spotify/update_last_played', {
		method: 'GET'
	});
}
