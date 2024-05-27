import { discordClient } from '$lib/discord';
import { GuildMember } from 'discord.js';
import { json } from '@sveltejs/kit';
import { DISCORD_GUILD_ID, DISCORD_USER_ID } from '$env/static/private';
import { corsHeaders } from '$lib/corsHeaders';

export async function GET(): Promise<Response> {
	try {
		const server = await discordClient.guilds.fetch(DISCORD_GUILD_ID);
		const user: GuildMember = await server.members.fetch(DISCORD_USER_ID);
		return json(
			{ data: user.presence?.status || 'unknown' },
			{ status: 200, headers: corsHeaders }
		);
	} catch (error) {
		return json({ error: error.message }, { status: 500, headers: corsHeaders });
	}
}
