export type SpotifyLastPlayedData = {
	time: number;
	title: string;
	artist: string;
	album: string;
	albumImageUrl: string;
	songUrl: string;
};

export async function setSpotifyLastPlayedData(
	lastPlayedData: SpotifyLastPlayedData
): Promise<void> {
	const response = await fetch('https://bobbynooby.dev/api/spotify/last_played', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authKey: import.meta.env.VITE_GENERAL_AUTH_KEY
		},
		body: JSON.stringify(lastPlayedData)
	});

	const result = await response.json();
	if (result.error) {
		// console.log('Error setting spotify last played data: ', result.error);
	} else {
		// console.log('Success setting spotify last played data: ', lastPlayedData);
	}
}
