import type { Link } from '$lib/db/mongoTypes';
import { writable } from 'svelte/store';

export function createLinksTable(data: Link[]) {
	const links = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(links);

	return {
		subscribe,
		set,
		createNew: () => {
			const latestLink = links.length > 0
				? links.reduce((max, link) => (link.item_order > max.item_order ? link : max))
				: null;

			const emptyBlock: Link = {
				uid: latestLink ? latestLink.uid + 1 : 1,
				label: 'None',
				href: 'https://bobbynooby.dev',
				color: '#FFFFFF',
				item_order: latestLink ? latestLink.item_order + 1 : 1
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
