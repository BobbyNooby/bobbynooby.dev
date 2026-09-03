import { sequence } from '@sveltejs/kit/hooks';
import { startMongoDB } from '$lib/db/mongo';
import { resolvePermissions } from '$lib/utils/permissions';
import { handle as authHandle } from './auth';

startMongoDB().then(() => console.log('Connected to MongoDB'));

export const handle = sequence(authHandle, async ({ event, resolve }) => {
	const permissions = await resolvePermissions(await event.locals.auth());
	event.locals.isAdmin = permissions.isAdmin;
	event.locals.canShorten = permissions.canShorten;
	return resolve(event);
});
