import type { threeByThreeEntry, threeByThreeServerData } from '$lib/types';
import { OrderedTable } from './orderedTable.svelte';

export class ThreeByThreeGroup {
	label: string;
	entries: OrderedTable<threeByThreeEntry>;
	visible = $state(false);

	constructor(data: threeByThreeServerData) {
		this.label = data.label;
		this.entries = new OrderedTable(data.data);
	}
}

export class ThreeByThreeCollection {
	groups = $state<ThreeByThreeGroup[]>([]);

	constructor(data: threeByThreeServerData[]) {
		this.groups = data.map((item) => new ThreeByThreeGroup(item));
	}

	#find(label: string): ThreeByThreeGroup | undefined {
		return this.groups.find((group) => group.label === label);
	}

	toggle(label: string) {
		const group = this.#find(label);
		if (group) {
			group.visible = !group.visible;
		}
	}

	createNew(label: string) {
		this.#find(label)?.entries.createNew({
			id: '',
			label: 'New Entry',
			review: '',
			bobscore: 0
		});
	}

	swapOrder(label: string, index1: number, index2: number) {
		this.#find(label)?.entries.swapOrder(index1, index2);
	}

	deleteByUid(label: string, uid: number) {
		this.#find(label)?.entries.deleteByUid(uid);
	}
}
