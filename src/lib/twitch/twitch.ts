import { env } from '$env/dynamic/private';

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const HELIX_STREAMS_URL = 'https://api.twitch.tv/helix/streams';
// Override with TWITCH_CHANNEL in .env to test against another channel.
const CHANNEL = env.TWITCH_CHANNEL || 'bobbynooby';
const LIVE_CACHE_MS = 30_000;

export type TwitchLiveResponse = {
	configured: boolean;
	live: boolean;
	title?: string;
	game?: string;
	viewers?: number;
	startedAt?: string;
	thumbnail?: string;
};

let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedLive: { data: TwitchLiveResponse; checkedAt: number } | null = null;

function isConfigured(): boolean {
	return Boolean(env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET);
}

// App access token: no user login needed, Twitch issues one for ~60 days and
// we cache it until shortly before expiry.
async function getAppAccessToken(): Promise<string> {
	if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
		return cachedToken.token;
	}
	const clientId = env.TWITCH_CLIENT_ID;
	const clientSecret = env.TWITCH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error('TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET are not set');
	}

	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'client_credentials'
		})
	});
	if (!response.ok) {
		throw new Error(`Twitch token request failed: ${response.status}`);
	}
	const body = await response.json();
	cachedToken = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
	return cachedToken.token;
}

/**
 * Returns the channel's live status via the Helix API. Results are cached
 * server-side for 30s so any number of visitors share one API call.
 */
export async function getTwitchLive(): Promise<TwitchLiveResponse> {
	if (!isConfigured()) {
		return { configured: false, live: false };
	}
	if (cachedLive && Date.now() - cachedLive.checkedAt < LIVE_CACHE_MS) {
		return cachedLive.data;
	}

	const token = await getAppAccessToken();
	const clientId = env.TWITCH_CLIENT_ID;
	if (!clientId) {
		return { configured: false, live: false };
	}
	const response = await fetch(`${HELIX_STREAMS_URL}?user_login=${CHANNEL}`, {
		headers: {
			'Client-Id': clientId,
			Authorization: `Bearer ${token}`
		}
	});
	if (!response.ok) {
		throw new Error(`Twitch streams request failed: ${response.status}`);
	}

	const body = await response.json();
	const stream = body.data?.[0] ?? null;
	const data: TwitchLiveResponse = stream
		? {
				configured: true,
				live: true,
				title: stream.title,
				game: stream.game_name,
				viewers: stream.viewer_count,
				startedAt: stream.started_at,
				thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')
			}
		: { configured: true, live: false };
	cachedLive = { data, checkedAt: Date.now() };
	return data;
}
