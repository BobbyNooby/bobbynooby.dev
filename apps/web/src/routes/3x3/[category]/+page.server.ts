import { db } from '$lib/db/mongo';
import { getKnown3x3Routes } from '$lib/db/mongoUtils';
import { error } from '@sveltejs/kit';
import type { GeneralMedia } from '$lib/media/mediaTypes';
import { parseMedia } from '$lib/media/parseMedia';
import type { threeByThreeEntry } from '$lib/types';
import type { RouteParams } from './$types';

export const load = async ({ params }: { params: RouteParams }) => {
	const category = params.category.toLowerCase();
	if (!(await getKnown3x3Routes()).has(category)) {
		error(404, 'Unknown 3x3 category');
	}
	const collectionName = '3x3_' + category;

	const mediaList: GeneralMedia[] = [];

	// Get entries
	const data = await db
		.collection<threeByThreeEntry>(collectionName)
		.find({}, { projection: { _id: 0 }, sort: { item_order: 1 } })
		.toArray();

	for (const entry of data.splice(0, 9)) {
		const generalMedia = await parseMedia(entry, category);
		if (generalMedia === null) {
			return { mediaList: null };
		} else {
			mediaList.push(generalMedia);
		}
	}

	return { mediaList: mediaList, category: category };
};
