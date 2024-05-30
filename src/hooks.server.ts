import { discordClient } from '$lib/discord';
import { chatClient } from '$lib/supabaseChat';

export { handle } from './auth';

discordClient.once('ready', () => {
	console.log('Discord Bot Connected');
});
