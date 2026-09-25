import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { startMongoDB } from '$lib/db/mongo';
import { resolvePermissions } from '$lib/utils/permissions';
import { createTokenBucket } from '@bobbynooby/shared';
import { pickClientIp } from '$lib/utils/clientIp';
import { handle as authHandle } from './auth';

// Deferred so builds (SvelteKit's post-build analyse imports this module)
// succeed without a reachable MongoDB; connects on the first request.
let connecting: Promise<unknown> | undefined;
const connectOnce = () =>
	(connecting ??= startMongoDB().then(() => console.log('Connected to MongoDB')));

// Per-IP limiter for public GET /api/* reads: 30 requests instantly, then
// one every 2s. Keyed on x-forwarded-for (Coolify's proxy is the direct peer)
// and bounded by evicting entries idle over 10 minutes.
const apiBuckets = new Map<
	string,
	{ bucket: ReturnType<typeof createTokenBucket>; seen: number }
>();

// Baseline CSP: allows inline scripts/styles (SvelteKit hydration), remote
// images/media, websocket connections, and Spotify embeds only.
const csp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' https:",
	"media-src 'self' https:",
	"connect-src 'self' wss:",
	'frame-src https://open.spotify.com'
].join('; ');

export const handle = sequence(authHandle, async ({ event, resolve }) => {
	event.setHeaders({ 'Content-Security-Policy': csp });

	if (dev) {
		// Dev-only bypass: the OAuth round-trip is unreliable on the local dev
		// server (cross-site cookies). `dev` is baked in at build time, so this
		// branch does not exist in production builds.
		event.locals.isAdmin = true;
		event.locals.canShorten = true;
		return resolve(event);
	}

	if (event.request.method === 'GET' && event.url.pathname.startsWith('/api/')) {
		const ip = pickClientIp(event.request.headers, event.getClientAddress());
		const now = Date.now();
		for (const [key, entry] of apiBuckets) {
			if (now - entry.seen > 10 * 60_000) apiBuckets.delete(key);
		}
		let entry = apiBuckets.get(ip);
		if (!entry) {
			entry = { bucket: createTokenBucket({ capacity: 30, refillPerSecond: 0.5 }), seen: now };
			apiBuckets.set(ip, entry);
		}
		entry.seen = now;
		if (!entry.bucket.tryTake()) {
			return json({ success: false, error: 'rate_limited' }, { status: 429 });
		}
	}

	await connectOnce();
	const permissions = await resolvePermissions(await event.locals.auth());
	event.locals.isAdmin = permissions.isAdmin;
	event.locals.canShorten = permissions.canShorten;
	return resolve(event);
});
