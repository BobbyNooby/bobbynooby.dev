import { getAnime } from '$lib/anilist';
import { supabaseClient } from '$lib/supabase';
import { errorAnime, type Anime, type threeByThreeEntry } from '$lib/types/aniListMedia';

export const load = async () => {
	let animeData: Anime[] = [];

	// Get anime
	await (async () => {
		let { data, error } = await supabaseClient
			.from('anime3x3')
			.select('*')
			.order('item_order', { ascending: true });

		if (error) {
			for (let i = 0; i < 9; i++) {
				animeData[i] = errorAnime;
			}
			console.log('Error in retrieving anime');
		} else {
			for (const entry of data?.slice(0, 9) as threeByThreeEntry[]) {
				let anime = await getAnime(entry.id);
				anime['bobStats'] = { review: entry.review, bobscore: entry.bobscore };

				animeData.push(anime);
			}
		}
	})();

	return { anime: animeData };
};
