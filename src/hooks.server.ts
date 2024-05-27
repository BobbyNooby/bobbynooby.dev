import { discordClient } from '$lib/discord';

export { handle } from './auth';

discordClient.once('ready', () => {
	console.log('Discord Bot Connected');
});
