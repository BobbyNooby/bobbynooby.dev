import type { threeByThreeEntry, threeByThreeServerData } from '$lib/types';
import { writable } from 'svelte/store';
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
			if (index2 < 0) return;
			for (const threeByThree of threeByThrees) {
				if (threeByThree.label === label) {
					if (index2 >= threeByThree.data.length) return;
					const index1ItemOrder = threeByThree.data[index1].item_order;
					const index2ItemOrder = threeByThree.data[index2].item_order;
					threeByThree.data[index1].item_order = index2ItemOrder;
					threeByThree.data[index2].item_order = index1ItemOrder;
					break;
				}
			}
			set(threeByThrees);
		},
		createNew: (label: string) => {
			for (const threeByThree of threeByThrees) {
				if (threeByThree.label === label) {
					const latestEntry = threeByThree.data.length > 0
						? threeByThree.data.sort((a, b) => a.item_order - b.item_order)[threeByThree.data.length - 1]
						: null;
					const emptyEntry: threeByThreeEntry = {
						id: '',
						label: 'New Entry',
						review: '',
						bobscore: 0,
						item_order: latestEntry ? latestEntry.item_order + 1 : 1
					};
					threeByThree.data.push(emptyEntry);
					break;
				}
			}
			set(threeByThrees);
		},
		deleteEntry: (label: string, index: number) => {
			for (const threeByThree of threeByThrees) {
				if (threeByThree.label === label) {
					threeByThree.data.splice(index, 1);
					break;
				}
			}
			set(threeByThrees);
		}
	};
}
