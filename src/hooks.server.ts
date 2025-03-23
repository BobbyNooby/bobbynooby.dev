import { startMongoDB } from '$lib/db/mongo';
import { discord, startDiscord } from '$lib/discord/discord';

export { handle } from './auth';

startMongoDB().then(() => console.log('Connected to MongoDB'));
startDiscord().then(() => console.log('Connected to Discord'));
