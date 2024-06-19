import { corsHeaders } from '$lib/corsHeaders';
import { getSpotifyToken } from '$lib/spotify';
import { json } from '@sveltejs/kit';
import type { SpotifySongData } from '$lib/spotify';

export async function GET(): Promise<Response> {
	const access_token = await getSpotifyToken();

	const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});

	if (res.status === 204 || res.status > 400) {
		console.log(res.status);
		return json(
			{ data: { isPlaying: false } },
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
	return json({ data: body }, { status: 200, headers: corsHeaders });
}
