import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import { getGamesEnabled } from '$lib/db/siteConfig.js';
export const load = async () => {
	const [links, projects, gamesEnabled] = await Promise.all([
		getLinks(),
		getProjects(),
		getGamesEnabled().catch(() => true)
	]);
	return { links, projects, gamesEnabled };
};
