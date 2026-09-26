import { db } from './mongo';

export type SiteConfig = {
	key: 'games';
	hiddenAppids: number[];
};

const DOC_KEY = 'games';

export async function getHiddenAppids(): Promise<Set<number>> {
	const doc = await db
		.collection<SiteConfig>('site_config')
		.findOne({ key: DOC_KEY }, { projection: { _id: 0 } });
	return new Set(doc?.hiddenAppids ?? []);
}

export async function setHiddenAppids(appids: number[]): Promise<void> {
	await db
		.collection<SiteConfig>('site_config')
		.updateOne(
			{ key: DOC_KEY },
			{ $set: { key: DOC_KEY, hiddenAppids: appids } },
			{ upsert: true }
		);
}
