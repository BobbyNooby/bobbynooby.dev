import { db } from '$lib/db/mongo';
import type { GeneralMedia } from '$lib/media/mediaTypes';
import { parseMedia } from '$lib/media/parseMedia';
import type { threeByThreeEntry } from '$lib/types';
import type { RouteParams } from './$types';

export const load = async ({ params }: { params: RouteParams }) => {
	const category = params.category.toLowerCase();
	const collectionName = '3x3_' + category;

	let mediaList: GeneralMedia[] = [];

	// Get entries
	let data = await db
		.collection<threeByThreeEntry>(collectionName)
		.find({}, { projection: { _id: 0 } })
		.toArray();

	for (const entry of data.splice(0, 9)) {
		let generalMedia = await parseMedia(entry, category);
		if (generalMedia === null) {
			return { mediaList: null };
		} else {
			mediaList.push(generalMedia);
		}
	}

	return { mediaList: mediaList, category: category };
};
