import type { discordStatuses } from './discordTypes';

export async function getDiscordStatus(
	fetch: typeof globalThis.fetch = globalThis.fetch
): Promise<discordStatuses> {
	const { data, error } = await fetch('/api/discord/status')
		.then((res) => res.json())
		.catch(() => ({ error: 'error' }));

	if (error) return 'unknown';

	return data as discordStatuses;
}
