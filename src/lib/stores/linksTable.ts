import type { linksSchema } from '$lib/types/linksSchema';
import { get, writable } from 'svelte/store';

function sortLinks(links: linksSchema[]) {
	return links.sort((a, b) => a.item_order - b.item_order);
}
export function createLinksTable(data: linksSchema[]) {
	const links = data.sort((a, b) => a.item_order - b.item_order);

	const { subscribe, update, set } = writable(links);

	return {
		subscribe,
		set,
		createNew: () => {
			const latestLink = links.sort((a, b) => a.item_order - b.item_order)[links.length - 1];

			const emptyBlock: linksSchema = {
				uid: latestLink.uid + 1,
				name: 'None',
				href: 'https://bobbynooby.dev',
				color: '#FFFFFF',
				item_order: latestLink.item_order + 1
			};
			console.log(emptyBlock);
			links.push(emptyBlock);

			set(sortLinks(links));
		},
		swapOrder: (index1: number, index2: number) => {
			console.log(index1, index2);
			const index1ItemOrder = links[index1].item_order;
			const index2ItemOrder = links[index2].item_order;

			links[index1].item_order = index2ItemOrder;
			links[index2].item_order = index1ItemOrder;
			console.log(links);

			set(sortLinks(links));
		},
		deleteEntry: (index: number) => {
			links.splice(index, 1);
			set(sortLinks(links));
		}
	};
}
