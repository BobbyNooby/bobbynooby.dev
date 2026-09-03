import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import type { Link, Project } from '$lib/db/mongoTypes.js';
export const load = async () => {
	const [links, projects] = await Promise.all([getLinks(), getProjects()]);
	return { links, projects };
};
