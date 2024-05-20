import { corsHeaders } from './corsHeaders';

export async function getDiscordStatus(): Promise<discordStatuses> {
	const discordStatus = await fetch('https://bobbynooby-dev.vercel.app/api/discord_status', {
		method: 'GET'
	}).then((res) => res.json());
	return discordStatus;
}

export type discordStatuses = 'online' | 'idle' | 'dnd' | 'offline';
