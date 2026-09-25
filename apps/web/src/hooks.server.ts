import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { startMongoDB } from '$lib/db/mongo';
import { resolvePermissions } from '$lib/utils/permissions';
import { handle as authHandle } from './auth';

// Deferred so builds (SvelteKit's post-build analyse imports this module)
// succeed without a reachable MongoDB; connects on the first request.
let connecting: Promise<unknown> | undefined;
const connectOnce = () =>
	(connecting ??= startMongoDB().then(() => console.log('Connected to MongoDB')));

export const handle = sequence(authHandle, async ({ event, resolve }) => {
	if (dev) {
		// Dev-only bypass: the OAuth round-trip is unreliable on the local dev
		// server (cross-site cookies). `dev` is baked in at build time, so this
		// branch does not exist in production builds.
		event.locals.isAdmin = true;
		event.locals.canShorten = true;
		return resolve(event);
	}

	await connectOnce();
	const permissions = await resolvePermissions(await event.locals.auth());
	event.locals.isAdmin = permissions.isAdmin;
	event.locals.canShorten = permissions.canShorten;
	return resolve(event);
});
