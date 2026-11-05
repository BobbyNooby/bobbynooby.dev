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

// One atomic update per game: rewriting the whole list let two quick clicks
// both start from the same list, so the later write dropped the earlier one.
export async function setAppidHidden(appid: number, hidden: boolean): Promise<void> {
	await db
		.collection<SiteConfig>('site_config')
		.updateOne(
			{ key: DOC_KEY },
			hidden ? { $addToSet: { hiddenAppids: appid } } : { $pull: { hiddenAppids: appid } },
			{ upsert: true }
		);
}
