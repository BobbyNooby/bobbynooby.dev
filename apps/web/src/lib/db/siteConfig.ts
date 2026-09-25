import { db } from './mongo';

export type SiteConfig = {
	key: 'games';
	gamesEnabled: boolean;
};

const DOC_KEY = 'games';

export async function getGamesEnabled(): Promise<boolean> {
	const doc = await db
		.collection<SiteConfig>('site_config')
		.findOne({ key: DOC_KEY }, { projection: { _id: 0 } });
	return doc?.gamesEnabled ?? true;
}

export async function setGamesEnabled(enabled: boolean): Promise<void> {
	await db
		.collection<SiteConfig>('site_config')
		.updateOne(
			{ key: DOC_KEY },
			{ $set: { key: DOC_KEY, gamesEnabled: enabled } },
			{ upsert: true }
		);
}
