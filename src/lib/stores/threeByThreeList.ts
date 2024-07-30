import type { threeByThreeEntry } from '$lib/types/3x3/aniListMedia';
import type { threeByThreeServerData } from '$lib/types/threeByThreeTypes';
import { writable } from 'svelte/store';
import { createThreeByThreeTable } from './threeByThreeTable';
function sortThreeByThree(threeByThreeEntries: threeByThreeEntry[]) {
	return threeByThreeEntries.sort((a, b) => a.item_order - b.item_order);
}
export function createThreeByThreeList(data: threeByThreeServerData[]) {
	const threeByThrees = data.map((item) => {
		return {
			label: item.label,
			data: sortThreeByThree(item.data),
			visible: false
		};
	});

	const { subscribe, update, set } = writable(threeByThrees);

	return {
		subscribe,
		set,
		toggle: (label: string) => {
			threeByThrees.forEach((threeByThree) => {
				if (threeByThree.label === label) {
					threeByThree.visible = !threeByThree.visible;
				}
			});
			set(threeByThrees);
		},
		swapOrder: (label: string, index1: number, index2: number) => {
			threeByThrees.forEach((threeByThree) => {
				if (threeByThree.label === label) {
					const index1ItemOrder = threeByThree.data[index1].item_order;
					const index2ItemOrder = threeByThree.data[index2].item_order;
					threeByThree.data[index1].item_order = index2ItemOrder;
					threeByThree.data[index2].item_order = index1ItemOrder;
				}

				set(threeByThrees);
			});
		},
		getData: () => {
			return threeByThrees;
		}
	};
}
