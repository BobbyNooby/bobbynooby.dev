export async function getDiscordStatus(): Promise<discordStatuses> {
	const { data, error } = await fetch('https://bobbynooby.dev/api/discord_status', {
		method: 'GET'
	}).then((res) => res.json());

	if (error) {
		return 'unknown';
	}
	return data;
}

export type discordStatuses = 'online' | 'idle' | 'dnd' | 'offline' | 'unknown';
