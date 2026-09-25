import { db } from '$lib/db/mongo';

export async function createShortURL(longURL: string) {
	if ((await db.collection('shortURLs').countDocuments({ longURL: longURL })) > 0)
		return { success: false, error: 'Long URL already exists' };

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

function generateShortURL(length: number = 5) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let shortURL = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		shortURL += characters.charAt(randomIndex);
	}

	return shortURL;
}
