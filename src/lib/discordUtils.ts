import { corsHeaders } from './corsHeaders';

export async function getDiscordStatus(): Promise<discordStatuses> {
	const discordStatus = await fetch('http://localhost:5173/api/discord_status', {
		method: 'GET'
	}).then((res) => res.json());
	return discordStatus;
}

export type discordStatuses = 'online' | 'idle' | 'dnd' | 'offline';
