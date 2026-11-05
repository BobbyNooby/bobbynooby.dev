import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import { loadHomeGrid } from '$lib/media/homeGrid';

export const load = async () => {
	const [links, projects, threeByThree] = await Promise.all([
		getLinks(),
		getProjects(),
		loadHomeGrid()
	]);
	return { links, projects, threeByThree };
};
