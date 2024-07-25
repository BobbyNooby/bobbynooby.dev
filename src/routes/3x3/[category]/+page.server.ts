import { parseMedia } from '$lib/3x3/parseMedia.js';
import { supabaseClient } from '$lib/supabase';
import type { threeByThreeEntry } from '$lib/types/3x3/aniListMedia.js';
import type { GeneralMedia } from '$lib/types/3x3/GeneralMedia';

export const load = async ({ params }) => {
	let category = params.category;
	let databaseTable = category + '3x3';

	let mediaList: GeneralMedia[] = [];

	// Get manga
	let { data, error } = await supabaseClient
		.from(databaseTable)
		.select('*')
		.order('item_order', { ascending: true });

	if (error) {
		console.log('Error in retrieving media list');
		return { mediaList: null, category: category };
	} else {
		for (const entry of data?.splice(0, 9) as threeByThreeEntry[]) {
			let generalMedia = await parseMedia(entry, category);
			if (generalMedia === null) {
				return { mediaList: null };
			} else {
				mediaList.push(generalMedia);
			}
		}
	}

	return { mediaList: mediaList, category: category };
};
