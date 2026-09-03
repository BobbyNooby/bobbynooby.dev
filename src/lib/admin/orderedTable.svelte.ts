export type WithUid = { uid: number };

/**
 * A reactive ordered list of rows. Array order is the display order:
 * reordering is a plain splice, so there is no separate order field that can
 * drift out of sync with the row positions. All mutations go through $state
 * deep reactivity — no manual set()/slice() calls to forget.
 */
export class OrderedTable<T extends WithUid> {
	items = $state<T[]>([]);
	#nextUid = 0;

	constructor(items: T[]) {
		const seen = new Set<number>();
		for (const item of items) {
			// Renumber missing or duplicate uids so every row is addressable by uid.
			if (item.uid == null || seen.has(item.uid)) {
				item.uid = this.#nextUid;
			}
			seen.add(item.uid);
			if (item.uid >= this.#nextUid) {
				this.#nextUid = item.uid + 1;
			}
		}
		this.items = items;
	}

	createNew(blank: Omit<T, 'uid'>) {
		this.items.push({ ...blank, uid: this.#nextUid++ } as T);
	}

	/** Moves the row at index1 to index2. Out-of-bounds or no-op moves are ignored. */
	swapOrder(index1: number, index2: number) {
		if (
			index1 < 0 ||
			index2 < 0 ||
			index1 >= this.items.length ||
			index2 >= this.items.length ||
			index1 === index2
		) {
			return;
		}
		const [moved] = this.items.splice(index1, 1);
		this.items.splice(index2, 0, moved);
	}

	deleteByUid(uid: number) {
		const index = this.items.findIndex((item) => item.uid === uid);
		if (index !== -1) {
			this.items.splice(index, 1);
		}
	}
}
