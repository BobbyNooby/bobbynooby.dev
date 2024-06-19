import { corsHeaders } from '$lib/corsHeaders.js';
import { getSpotifyToken } from '$lib/spotify.js';
import type { SpotifyLastPlayedData } from '$lib/supabaseUtils.js';
import { json } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	const access_token = await getSpotifyToken();

	const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
		headers: {
			Authorization: `Bearer ${access_token}`
		}
	});

	if (res.status === 204 || res.status > 400) {
		return json(
			{ data: { isPlaying: false } },
			{ status: res.status, headers: corsHeaders, statusText: res.statusText }
		);
	}

	const recentlyPlayedSongs = await res.json();
	const latestSong = recentlyPlayedSongs.items[0];
	const date = latestSong.played_at;
	const title = latestSong.track.name;
	const artist = latestSong.track.artists.map((_artist) => _artist.name).join(', ');
	const album = latestSong.track.album.name;
	const albumImageUrl = latestSong.track.album.images[0].url;
	const songUrl = latestSong.track.external_urls.spotify;

	const dateClass = new Date(date);
	const time = Math.floor(dateClass.getTime());

	const lastPlayedSong: SpotifyLastPlayedData = {
		time,
		title,
		artist,
		album,
		albumImageUrl,
		songUrl
	};

	return json({ data: lastPlayedSong }, { status: 200, headers: corsHeaders });
}
