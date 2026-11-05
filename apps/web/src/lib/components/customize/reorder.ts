import type { CustomizeState } from '$lib/admin/customize.svelte';
import type { OrderedTable } from '$lib/admin/orderedTable.svelte';
import type { SortableOptions } from '$lib/admin/sortable';
import { flushSync } from 'svelte';

type Row = { uid: number };

/**
 * The drag setup every editor list shares: the table reorders as the pointer
 * moves, the dragged row skips its flip animation, and it flashes on drop.
 */
export function dragOptions<T extends Row>(
	cz: CustomizeState,
	table: OrderedTable<T>,
	where: Pick<SortableOptions, 'item' | 'handle' | 'mouseAnywhere'> = {
		item: '.cz-row',
		handle: '.cz-grip'
	}
): SortableOptions {
	return {
		...where,
		onmove: (from, to) => table.swapOrder(from, to),
		onstart: (uid) => (cz.dragUid = uid),
		ondrop: (uid) => {
			cz.dragUid = null;
			cz.flash(uid);
		}
	};
}

/**
 * Moves a row with its arrow button. Moving re-inserts the row's node, which
 * drops focus, so it goes back on the button and a held key keeps moving it.
 */
export function moveKeepingFocus<T extends Row>(
	cz: CustomizeState,
	table: OrderedTable<T>,
	event: MouseEvent,
	from: number,
	to: number
) {
	const button = event.currentTarget as HTMLButtonElement;
	flushSync(() => cz.move(table, from, to));
	button.focus();
}
