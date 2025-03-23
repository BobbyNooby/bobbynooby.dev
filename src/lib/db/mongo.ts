import { MONGO_ADMIN_URL } from '$env/static/private';
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(MONGO_ADMIN_URL);

export function startMongoDB() {
	console.log('Connecting to MongoDB...');
	return mongoClient.connect();
}

export const db = mongoClient.db();
