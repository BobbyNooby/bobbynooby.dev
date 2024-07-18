import { getManga } from '$lib/anilist';
import { supabaseClient } from '$lib/supabase';
import { errorManga, type Manga, type threeByThreeEntry } from '$lib/types/aniListMedia';

export const load = async () => {
	let mangaData: Manga[] = [];

	// Get manga
	await (async () => {
		let { data, error } = await supabaseClient
			.from('manga3x3')
			.select('*')
			.order('item_order', { ascending: true });

		console.log(data);

		if (error) {
			for (let i = 0; i < 9; i++) {
				mangaData[i] = errorManga;
			}
			console.log('Error in retrieving manga');
		} else {
			for (const entry of data?.slice(0, 9) as threeByThreeEntry[]) {
				let manga = await getManga(entry.id);
				manga['bobStats'] = { review: entry.review, bobscore: entry.bobscore };
				mangaData.push(manga);
			}
		}
	})();

	// Get anime

	return { manga: mangaData };
};
