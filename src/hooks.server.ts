import { discordReadyPromise } from '$lib/discord';
import type { Handle } from '@sveltejs/kit';
import { handle as authHandle } from './auth';

export { handle } from './auth';
