// This feature has been deprecated due do implementation of a websocket server
// The code is left here as a backup for one day if the websocket server is down

import { env } from '$env/dynamic/private';

const redirect_uri = 'https://bobbynooby.dev/';
const token_endpoint = 'https://accounts.spotify.com/api/token';

export async function getSpotifyToken(): Promise<string> {
	const access_token_response: {
		access_token: string;
		token_type: string;
		expires_in: number;
		scope: string;
	} = await fetch(token_endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'refresh_token',
			refresh_token: env.SPOTIFY_CLIENT_REFRESH_TOKEN ?? '',
			client_id: env.SPOTIFY_CLIENT_ID ?? '',
			client_secret: env.SPOTIFY_CLIENT_SECRET ?? '',
			redirect_uri: redirect_uri
		})
	}).then((res) => res.json());

	return access_token_response.access_token;
}
