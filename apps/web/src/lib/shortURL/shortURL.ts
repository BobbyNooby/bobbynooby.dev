import { randomInt } from 'node:crypto';

import { db } from '$lib/db/mongo';

export async function createShortURL(longURL: string) {
	const existing = await db
		.collection<{ shortURL: string; longURL: string }>('shortURLs')
		.findOne({ longURL: longURL });
	if (existing) return { success: true, shortURL: existing.shortURL };

	let shortURL = generateShortURL(5);

	while ((await db.collection('shortURLs').countDocuments({ shortURL: shortURL })) > 0) {
		shortURL = generateShortURL(5);
	}

	const response = await db
		.collection('shortURLs')
		.insertOne({ shortURL: shortURL, longURL: longURL });

	if (response.acknowledged) return { success: true, shortURL: shortURL };

	return { success: false, error: `Failed to create short URL` };
}

export async function getLongURL(shortURL: string) {
	const shortURLData = await db.collection('shortURLs').findOne({ shortURL: shortURL });
	if (shortURLData) return { success: true, longURL: shortURLData.longURL };
	return { success: false, error: 'Short URL not found' };
}

export function generateShortURL(length: number = 5, rng: () => number = () => randomInt(0, 62)) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let shortURL = '';

	for (let i = 0; i < length; i++) {
		shortURL += characters.charAt(rng());
	}

	return shortURL;
}
