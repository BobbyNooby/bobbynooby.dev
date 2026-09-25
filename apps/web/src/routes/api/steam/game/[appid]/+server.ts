import { getSteamGameDetails, steamConfigured } from '$lib/steam/steamCache';
import { error, json } from '@sveltejs/kit';

export async function GET({ params }): Promise<Response> {
	if (!/^\d+$/.test(params.appid)) {
		error(400, 'invalid appid');
	}
	const configured = steamConfigured();
	if (!configured) {
		return json({ success: true, configured, details: null });
	}
	try {
		return json(
			{ success: true, configured, details: await getSteamGameDetails(Number(params.appid)) },
			{ headers: { 'Cache-Control': 'no-store' } }
		);
	} catch (err) {
		console.error('[steam] details route failed:', err);
		return json({ success: false, configured, error: 'internal' }, { status: 500 });
	}
}
