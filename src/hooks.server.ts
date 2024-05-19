import { discordReadyPromise } from '$lib/discord';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	await discordReadyPromise;
	return await resolve(event);
};
