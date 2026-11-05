import { getSteamGameDetails, isShownSteamGame, steamConfigured } from '$lib/steam/steamCache';
import { error, json } from '@sveltejs/kit';

export async function GET({ params }): Promise<Response> {
	const appid = /^\d+$/.test(params.appid) ? Number(params.appid) : NaN;
	if (!Number.isSafeInteger(appid)) {
		error(400, 'invalid appid');
	}
	const configured = steamConfigured();
	if (!configured) {
		return json({ success: true, configured, details: null });
	}
	try {
		// Owned games only, so made-up ids never reach Steam or the details cache.
		if (!(await isShownSteamGame(appid))) {
			return json({ message: 'unknown appid' }, { status: 404 });
		}
		return json(
			{ success: true, configured, details: await getSteamGameDetails(appid) },
			{ headers: { 'Cache-Control': 'no-store' } }
		);
	} catch (err) {
		console.error('[steam] details route failed:', err);
		return json({ success: false, configured, error: 'internal' }, { status: 500 });
	}
}
