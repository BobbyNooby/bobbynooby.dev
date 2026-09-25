import { getSteamGames, steamConfigured } from '$lib/steam/steamCache';
import { json } from '@sveltejs/kit';

export async function GET(): Promise<Response> {
	const configured = steamConfigured();
	if (!configured) {
		return json({ success: true, configured, games: [] });
	}
	try {
		return json(
			{ success: true, configured, games: await getSteamGames() },
			{ headers: { 'Cache-Control': 'no-store' } }
		);
	} catch (err) {
		console.error('[steam] games route failed:', err);
		return json({ success: false, configured, error: 'internal' }, { status: 500 });
	}
}
