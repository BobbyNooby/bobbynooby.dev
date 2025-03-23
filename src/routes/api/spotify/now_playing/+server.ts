import { db } from '$lib/db/mongo';
import { getSpotifyToken } from '$lib/spotify/spotify';
import type { SpotifyLastPlayedData, SpotifySongData } from '$lib/spotify/spotifyTypes';
import { errorSong } from '$lib/spotify/spotifyUtils';
import { corsHeaders } from '$lib/utils/corsHeaders';
import { json } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	// Getting Current Song Logic
	const access_token = await getSpotifyToken();

	const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});

	if (res.status === 204 || res.status > 400) {
		console.log(res.status);
		return json(
			{ data: errorSong },
			{ status: 429, headers: corsHeaders, statusText: res.statusText }
		);
	}

	const song = await res.json();
	const isPlaying = song.is_playing;
	const title = song.item.name;
	const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
	const album = song.item.album.name;
	const albumImageUrl = song.item.album.images[0].url;
	const songUrl = song.item.external_urls.spotify;

	const body: SpotifySongData = {
		isPlaying,
		title,
		artist,
		album,
		albumImageUrl,
		songUrl
	};

	// Setting new recently played.
	const recentlyPlayed = (await db
		.collection('recently_played')
		.findOne({})) as SpotifyLastPlayedData | null;
	const currentDateTime = new Date().toISOString();

	let lastPlayedSong: SpotifyLastPlayedData = {
		...body,
		playedAt: currentDateTime
	};
	lastPlayedSong.isPlaying = false;

	if (!recentlyPlayed) {
		await db.collection('recently_played').deleteMany({});
		await db.collection('recently_played').insertOne(lastPlayedSong);
	} else {
		if (recentlyPlayed.songUrl === body.songUrl)
			return json({ data: body }, { status: 200, headers: corsHeaders });
		await db.collection('recently_played').deleteMany({});
		await db.collection('recently_played').insertOne(lastPlayedSong);
	}

	return json({ data: body }, { status: 200, headers: corsHeaders });
}
