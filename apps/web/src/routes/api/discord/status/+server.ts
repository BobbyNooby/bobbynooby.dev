import { env } from '$env/dynamic/private';
import { discord } from '$lib/discord/discord';
import { corsHeaders } from '$lib/utils/corsHeaders';
import { json } from '@sveltejs/kit';
import type { GuildMember } from 'discord.js';

export async function GET() {
	try {
		const server = await discord.guilds.fetch(env.DISCORD_GUILD_ID ?? '');
		const user: GuildMember = await server.members.fetch(env.DISCORD_USER_ID ?? '');
		// console.log('Discord Status Retrieved: ', user.presence?.status);
		return json(
			{ data: user.presence?.status, success: true },
			{ status: 200, headers: corsHeaders }
		);
	} catch (error) {
		console.log('Error: ', error);
		return json({ error: error, success: false }, { status: 500, headers: corsHeaders });
	}
}
