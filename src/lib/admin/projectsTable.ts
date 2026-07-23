import type { Project } from '$lib/db/mongoTypes';
import { writable } from 'svelte/store';

function dedupeUids<T extends { uid: number }>(items: T[]) {
	const seen = new Set<number>();
	items.forEach((item) => {
		while (seen.has(item.uid)) {
			item.uid += 1;
		}
		seen.add(item.uid);
	});
}

export function createProjectsTable(data: Project[]) {
	dedupeUids(data);
	const projects = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(projects);

	return {
		subscribe,
		set,
		createNew: () => {
			const maxUid = projects.length > 0
				? projects.reduce((max, p) => Math.max(max, p.uid), 0)
				: 0;
			const maxItemOrder = projects.length > 0
				? projects.reduce((max, p) => Math.max(max, p.item_order), 0)
				: 0;

			const emptyBlock: Project = {
				uid: maxUid + 1,
				title: 'None',
				description: 'None',
				href: 'https://bobbynooby.dev',
				item_order: maxItemOrder + 1
			};
			projects.push(emptyBlock);
			projects.sort((a, b) => a.item_order - b.item_order);

			set(projects.slice());
		},
		swapOrder: (index1: number, index2: number) => {
			if (index2 < 0 || index2 >= projects.length) return;
			const index1ItemOrder = projects[index1].item_order;
			const index2ItemOrder = projects[index2].item_order;

			projects[index1].item_order = index2ItemOrder;
			projects[index2].item_order = index1ItemOrder;
			projects.sort((a, b) => a.item_order - b.item_order);

			set(projects.slice());
		},
		deleteEntry: (index: number) => {
			projects.splice(index, 1);
			projects.sort((a, b) => a.item_order - b.item_order);

			set(projects.slice());
		}
	};
}
