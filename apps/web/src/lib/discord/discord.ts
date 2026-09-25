// This feature has been deprecated due do implementation of a websocket server
// The code is left here as a backup for one day if the websocket server is down

import { DISCORD_BOT_TOKEN } from '$env/static/private';
import { Client, IntentsBitField } from 'discord.js';

const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildPresences]
});

export async function startDiscord() {
	console.log('Connecting to Discord...');
	try {
		await client.login(DISCORD_BOT_TOKEN);
		console.log('Discord Bot Connected');
	} catch (error) {
		console.log('Discord Bot Login Error', error);
	}
}

export const discord = client;
