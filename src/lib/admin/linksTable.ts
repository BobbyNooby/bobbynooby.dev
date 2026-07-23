import type { Link } from '$lib/db/mongoTypes';
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

export function createLinksTable(data: Link[]) {
	dedupeUids(data);
	const links = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(links);

	return {
		subscribe,
		set,
		createNew: () => {
			const maxUid = links.length > 0
				? links.reduce((max, link) => Math.max(max, link.uid), 0)
				: 0;
			const maxItemOrder = links.length > 0
				? links.reduce((max, link) => Math.max(max, link.item_order), 0)
				: 0;

			const emptyBlock: Link = {
				uid: maxUid + 1,
				label: 'None',
				href: 'https://bobbynooby.dev',
				color: '#FFFFFF',
				item_order: maxItemOrder + 1
			};
			links.push(emptyBlock);
			links.sort((a, b) => a.item_order - b.item_order);

			set(links.slice());
		},
		swapOrder: (index1: number, index2: number) => {
			if (index2 < 0 || index2 >= links.length) return;
			const index1ItemOrder = links[index1].item_order;
			const index2ItemOrder = links[index2].item_order;

			links[index1].item_order = index2ItemOrder;
			links[index2].item_order = index1ItemOrder;
			links.sort((a, b) => a.item_order - b.item_order);

			set(links.slice());
		},
		deleteEntry: (index: number) => {
			links.splice(index, 1);
			links.sort((a, b) => a.item_order - b.item_order);

			set(links.slice());
		}
	};
}
