import { corsHeaders } from './corsHeaders';

export async function getDiscordStatus(): Promise<discordStatuses> {
	const discordStatus = await fetch('https://bobbynooby.dev/api/discord_status', {
		method: 'GET',
		headers: {
			authKey: import.meta.env.VITE_GENERAL_AUTH_KEY
		}
	}).then((res) => res.json());
	return discordStatus;
}

export type discordStatuses = 'online' | 'idle' | 'dnd' | 'offline';
