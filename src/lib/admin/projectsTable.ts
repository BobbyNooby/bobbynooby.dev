import type { Project } from '$lib/db/mongoTypes';
import { writable } from 'svelte/store';

function sortProjects(projects: Project[]) {
	return projects.sort((a, b) => a.item_order - b.item_order);
}
export function createProjectsTable(data: Project[]) {
	const projects = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(projects);

	return {
		subscribe,
		set,
		createNew: () => {
			const latestProject = projects.length > 0
				? projects.sort((a, b) => a.item_order - b.item_order)[projects.length - 1]
				: null;

			const emptyBlock: Project = {
				uid: latestProject ? latestProject.uid + 1 : 1,
				title: 'None',
				description: 'None',
				href: 'https://bobbynooby.dev',
				item_order: latestProject ? latestProject.item_order + 1 : 1
			};
			projects.push(emptyBlock);

			set(sortProjects(projects));
		},
		swapOrder: (index1: number, index2: number) => {
			if (index2 < 0 || index2 >= projects.length) return;
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
