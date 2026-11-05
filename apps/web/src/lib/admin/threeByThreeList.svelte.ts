import type { threeByThreeEntry, threeByThreeServerData } from '$lib/types';
import { OrderedTable } from './orderedTable.svelte';

export class ThreeByThreeGroup {
	label: string;
	entries: OrderedTable<threeByThreeEntry>;

	constructor(data: threeByThreeServerData) {
		this.label = data.label;
		this.entries = new OrderedTable(data.data);
	}

	/** Wire shape for the save payload: the server expects { label, data } per list. */
	toJSON() {
		return { label: this.label, data: this.entries.items };
	}
}

export class ThreeByThreeCollection {
	groups = $state<ThreeByThreeGroup[]>([]);

	constructor(data: threeByThreeServerData[]) {
		this.groups = data.map((item) => new ThreeByThreeGroup(item));
	}

	group(label: string): ThreeByThreeGroup | undefined {
		return this.groups.find((group) => group.label === label);
	}

	/** Adds a blank entry to the named list; returns its uid, or null for an unknown list. */
	createNew(label: string): number | null {
		return (
			this.group(label)?.entries.createNew({
				id: '',
				label: 'New Entry',
				review: '',
				bobscore: 0
			}) ?? null
		);
	}

	swapOrder(label: string, index1: number, index2: number) {
		this.group(label)?.entries.swapOrder(index1, index2);
	}

	deleteByUid(label: string, uid: number) {
		this.group(label)?.entries.deleteByUid(uid);
	}
}
