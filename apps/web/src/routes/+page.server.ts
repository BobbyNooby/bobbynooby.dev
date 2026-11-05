import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import { loadHomeGrid } from '$lib/media/homeGrid';

export const load = async () => {
	const [links, projects, threeByThree] = await Promise.all([
		getLinks(),
		getProjects(),
		// The grid is a nice-to-have; an AniList or cache hiccup shouldn't take the page down.
		loadHomeGrid().catch((err) => {
			console.error('[3x3] home grid failed:', err);
			return {};
		})
	]);
	return { links, projects, threeByThree };
};
