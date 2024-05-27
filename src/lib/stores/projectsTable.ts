import type { linksSchema } from '$lib/types/linksSchema';
import type { projectsSchema } from '$lib/types/projectsSchema';
import { get, writable } from 'svelte/store';

function sortProjects(projects: projectsSchema[]) {
	return projects.sort((a, b) => a.item_order - b.item_order);
}
export function createProjectsTable(data: projectsSchema[]) {
	const projects = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(projects);

	return {
		subscribe,
		set,
		createNew: () => {
			const latestProject = projects.sort((a, b) => a.item_order - b.item_order)[
				projects.length - 1
			];

			const emptyBlock: projectsSchema = {
				uid: latestProject.uid + 1,
				name: 'None',
				description: 'None',
				href: 'https://bobbynooby.dev',
				item_order: latestProject.item_order + 1
			};
			projects.push(emptyBlock);

			set(sortProjects(projects));
		},
		swapOrder: (index1: number, index2: number) => {
			const index1ItemOrder = projects[index1].item_order;
			const index2ItemOrder = projects[index2].item_order;

			projects[index1].item_order = index2ItemOrder;
			projects[index2].item_order = index1ItemOrder;

			set(sortProjects(projects));
		},
		deleteEntry: (index: number) => {
			projects.splice(index, 1);
			set(sortProjects(projects));
		}
	};
}
