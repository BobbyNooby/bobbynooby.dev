import { env } from '$env/dynamic/private';
import { MongoClient, type Db } from 'mongodb';

// $env/dynamic/private is read at runtime instead of being inlined at build
// time, so secrets never land in the bundle. The client is built on first use
// because the env is empty during builds (SvelteKit's post-build analyse
// imports this module).
let client: MongoClient | undefined;

export function getMongoClient(): MongoClient {
	return (client ??= new MongoClient(env.MONGO_ADMIN_URL ?? '', { tls: true, ssl: true }));
}

export function startMongoDB() {
	console.log('Connecting to MongoDB...');
	return getMongoClient().connect();
}

export const db: Db = new Proxy({} as Db, {
	get(_, prop) {
		const real = getMongoClient().db() as unknown as Record<string | symbol, unknown>;
		const value = real[prop];
		return typeof value === 'function'
			? (value as (...args: unknown[]) => unknown).bind(real)
			: value;
	}
});
