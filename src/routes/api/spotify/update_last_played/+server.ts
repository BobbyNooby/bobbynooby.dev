import { GENERAL_AUTH_KEY } from '$env/static/private';
import { corsHeaders } from '$lib/corsHeaders';
import { getCurrentSongData } from '$lib/spotifyUtils';
import { type SpotifyLastPlayedData } from '$lib/supabaseUtils';
import { json } from '@sveltejs/kit';

async function setSpotifyLastPlayedData(lastPlayedData: SpotifyLastPlayedData): Promise<void> {
	const response = await fetch('http://localhost:5173/api/spotify/last_played', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authKey: GENERAL_AUTH_KEY
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

export async function GET() {
	const newSongData = await getCurrentSongData();
	const currentTime = new Date().getTime();

	const dataForFunction: SpotifyLastPlayedData = {
		title: newSongData.title,
		artist: newSongData.artist,
		album: newSongData.album,
		albumImageUrl: newSongData.albumImageUrl,
		songUrl: newSongData.songUrl,
		time: currentTime
	};

	setSpotifyLastPlayedData(dataForFunction);

	return json({ data: { ayo: 'this shit worked' } }, { status: 200, headers: corsHeaders });
}
