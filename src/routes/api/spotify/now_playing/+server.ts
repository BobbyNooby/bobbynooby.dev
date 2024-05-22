import { corsHeaders } from '$lib/corsHeaders';
import { getSpotifyToken } from '$lib/spotify';
import { json } from '@sveltejs/kit';
import type { SpotifySongData } from '$lib/spotify';
import { GENERAL_AUTH_KEY } from '$env/static/private';
import { getLastPlayedSongData } from '$lib/spotifyUtils.js';

export async function GET(): Promise<Response> {
	const access_token = await getSpotifyToken();

	const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});

	if (res.status === 204 || res.status > 400) {
		return json({ isPlaying: false }, { status: 429, headers: corsHeaders });
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
	return json(body as SpotifySongData, { status: 200, headers: corsHeaders });
}
