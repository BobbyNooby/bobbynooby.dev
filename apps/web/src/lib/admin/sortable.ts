import { flushSync } from 'svelte';

export type SortableOptions = {
	/** Selector for the direct children that can be dragged. */
	item: string;
	/** Selector for the grip that starts a drag. */
	handle: string;
	/** With a mouse, drag from anywhere on the item (3x3 tiles); touch still needs the grip. */
	mouseAnywhere?: boolean;
	onmove: (from: number, to: number) => void;
	onstart?: (uid: number) => void;
	ondrop?: (uid: number) => void;
};

const EASE = 'cubic-bezier(.2,.8,.2,1)';

/**
 * Drag-to-reorder for a keyed {#each}. The list itself is reordered as the
 * pointer crosses other items, so Svelte's animate:flip slides the neighbours;
 * the dragged item just follows the pointer and settles into its slot on drop.
 * The target is picked from layout boxes rather than hit-testing, so items that
 * are mid-animation never get swapped back.
 */
export function sortable(node: HTMLElement, options: SortableOptions) {
	let opts = options;

	const items = () => [...node.children].filter((el): el is HTMLElement => el.matches(opts.item));

	function slotAt(x: number, y: number): number {
		const box = node.getBoundingClientRect();
		const px = x - box.left;
		const py = y - box.top;
		return items().findIndex(
			(el) =>
				px >= el.offsetLeft &&
				px < el.offsetLeft + el.offsetWidth &&
				py >= el.offsetTop &&
				py < el.offsetTop + el.offsetHeight
		);
	}

	function down(e: PointerEvent) {
		if (e.button > 0) return;
		const target = e.target as Element;
		const anywhere = opts.mouseAnywhere && e.pointerType === 'mouse';
		const grab = anywhere ? target.closest(opts.item) : target.closest(opts.handle);
		const el = grab?.closest<HTMLElement>(opts.item);
		if (!el || el.parentElement !== node) return;
		e.preventDefault();

		const uid = Number(el.dataset.uid);
		const sx = e.clientX;
		const sy = e.clientY;
		const home = { left: el.offsetLeft, top: el.offsetTop };
		let dragging = false;

		const follow = (ev: PointerEvent) => {
			const dx = ev.clientX - sx - (el.offsetLeft - home.left);
			const dy = ev.clientY - sy - (el.offsetTop - home.top);
			el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
		};

		const move = (ev: PointerEvent) => {
			if (!dragging) {
				if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
				dragging = true;
				el.classList.add('dragging');
				opts.onstart?.(uid);
			}
			const to = slotAt(ev.clientX, ev.clientY);
			const from = items().indexOf(el);
			if (to !== -1 && from !== -1 && to !== from) flushSync(() => opts.onmove(from, to));
			follow(ev);
		};

		const up = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', up);
			if (!dragging) return;
			// The click that ends a drag should not also select or toggle the item.
			const swallow = (ev: Event) => ev.stopPropagation();
			window.addEventListener('click', swallow, { capture: true, once: true });
			setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);

			const from = el.style.transform;
			el.style.transform = '';
			const done = () => {
				el.classList.remove('dragging');
				opts.ondrop?.(uid);
			};
			if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
			el.animate([{ transform: from }, { transform: 'none' }], {
				duration: 180,
				easing: EASE
			}).finished.then(done, done);
		};

		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', up);
	}

	node.addEventListener('pointerdown', down);
	return {
		update(next: SortableOptions) {
			opts = next;
		},
		destroy() {
			node.removeEventListener('pointerdown', down);
		}
	};
}
