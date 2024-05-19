export async function getSpotifyLastPlayedTime(): Promise<number> {
	const spotifyLastPlayedTime: number = await fetch(
		'http://localhost:5173/api/spotify_last_played_time',
		{
			method: 'GET'
		}
	).then((res) => res.json());

	return spotifyLastPlayedTime;
}

export async function setSpotifyLastPlayedTime(time: number): Promise<void> {
	const response = await fetch('http://localhost:5173/api/spotify_last_played_time', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ time: time })
	});

	const result = await response.json();
	if (result.error) {
		console.log('Error setting spotify last played time: ', result.error);
	} else {
		console.log('Success setting spotify last played time: ', time);
	}
}
