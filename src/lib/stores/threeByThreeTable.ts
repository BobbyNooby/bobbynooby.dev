import { get, writable } from 'svelte/store';
import type { threeByThreeEntry } from '$lib/types/3x3/aniListMedia';

function sortThreeByThree(threeByThreeEntries: threeByThreeEntry[]) {
	return threeByThreeEntries.sort((a, b) => a.item_order - b.item_order);
}
export function createThreeByThreeTable(data: threeByThreeEntry[]) {
	const threeByThree = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(threeByThree);

	return {
		subscribe,
		set,
		createNew: () => {
			const latestProject = threeByThree.sort((a, b) => a.item_order - b.item_order)[
				threeByThree.length - 1
			];

			const emptyBlock: threeByThreeEntry = {
				id: 'None',
				review: 'None',
				label: 'None',
				bobscore: 0,
				item_order: latestProject.item_order + 1
			};
			threeByThree.push(emptyBlock);

			set(sortThreeByThree(threeByThree));
		},
		swapOrder: (index1: number, index2: number) => {
			const index1ItemOrder = threeByThree[index1].item_order;
			const index2ItemOrder = threeByThree[index2].item_order;

			threeByThree[index1].item_order = index2ItemOrder;
			threeByThree[index2].item_order = index1ItemOrder;

			set(sortThreeByThree(threeByThree));
		},
		deleteEntry: (index: number) => {
			threeByThree.splice(index, 1);
			set(sortThreeByThree(threeByThree));
		},
		getData: () => {
			return threeByThree;
		}
	};
}
