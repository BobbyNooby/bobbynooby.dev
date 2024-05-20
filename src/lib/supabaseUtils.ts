export async function getSpotifyLastPlayedData(): Promise<SpotifyLastPlayedData> {
	const spotifyLastPlayedData: SpotifyLastPlayedData[] = await fetch(
		'http://localhost:5173/api/spotify_last_played_time',
		// console.log(requestData, 'RequestData');
		{
			method: 'GET'
		}
	).then((res) => res.json());

	return spotifyLastPlayedData[0];
}

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
	const response = await fetch('https://bobbynooby-dev.vercel.app/api/spotify_last_played_time', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
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
