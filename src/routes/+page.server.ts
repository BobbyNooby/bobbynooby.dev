import { getLinks, getProjects } from '$lib/db/mongoUtils.js';
import type { Link, Project } from '$lib/db/mongoTypes.js';
export const load = async ({ locals, fetch }) => {
	let returnObject: {
		links: Link[];
		projects: Project[];
	} = {
		links: [],
		projects: []
	};

	returnObject.links = await getLinks(fetch);
	returnObject.projects = await getProjects(fetch);

	return returnObject;
};
