import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
export const load = async () => {
	const [links, projects] = await Promise.all([getLinks(), getProjects()]);
	return { links, projects };
};
