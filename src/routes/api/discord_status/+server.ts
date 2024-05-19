import { discordClient } from '$lib/discord';
import { GuildMember } from 'discord.js';
import { json } from '@sveltejs/kit';
import { DISCORD_GUILD_ID, DISCORD_USER_ID } from '$env/static/private';

export async function GET(): Promise<Response> {
	try {
		const server = await discordClient.guilds.fetch(DISCORD_GUILD_ID);
		const user: GuildMember = await server.members.fetch(DISCORD_USER_ID);
		return json(user.presence?.status || 'unknown', { status: 200 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
