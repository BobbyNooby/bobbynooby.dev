import { startMongoDB } from '$lib/db/mongo';

export { handle } from './auth';

startMongoDB().then(() => console.log('Connected to MongoDB'));

// This feature has been deprecated due do implementation of a websocket server
// The code is left here as a backup for one day if the websocket server is down
// startDiscord().then(() => console.log('Connected to Discord'));
