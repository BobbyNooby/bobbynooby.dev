import { DISCORD_BOT_TOKEN } from '$env/static/private';
import { Client, IntentsBitField } from 'discord.js';

const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildPresences]
});

const discordReadyPromise = new Promise<void>((resolve, reject) => {
	client.once('ready', () => {
		console.log('Discord Bot Connected');
		resolve();
	});

	client.once('error', (error) => {
		console.error('Discord Bot Login Error', error);
		reject(error);
	});
});

client.login(DISCORD_BOT_TOKEN);

export const discordClient = client;
export { discordReadyPromise };
