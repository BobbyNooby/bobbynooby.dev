import { getTwitchLive } from '$lib/twitch/twitch';
import { json } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	try {
		return json(await getTwitchLive(), {
			headers: { 'Cache-Control': 'no-store' }
		});
	} catch (err) {
		console.error('[twitch] live check failed:', err);
		return json({ configured: true, live: false });
	}
}
