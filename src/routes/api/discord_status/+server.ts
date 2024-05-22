import { discordClient } from '$lib/discord';
import { GuildMember } from 'discord.js';
import { json } from '@sveltejs/kit';
import { DISCORD_GUILD_ID, DISCORD_USER_ID, VITE_GENERAL_AUTH_KEY } from '$env/static/private';
import { corsHeaders } from '$lib/corsHeaders';

export async function GET({ request }): Promise<Response> {
	try {
		const authKey = request.headers.get('authKey');

		if (authKey !== VITE_GENERAL_AUTH_KEY) {
			throw new Error('Brodie you really tryna do sumn with no auth!?!??!?! ');
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}

	try {
		const server = await discordClient.guilds.fetch(DISCORD_GUILD_ID);
		const user: GuildMember = await server.members.fetch(DISCORD_USER_ID);
		return json(user.presence?.status || 'unknown', { status: 200, headers: corsHeaders });
	} catch (error) {
		return json({ error: error.message }, { status: 500, headers: corsHeaders });
	}
}
