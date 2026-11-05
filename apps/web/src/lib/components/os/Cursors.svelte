<script lang="ts">
	import { DELAY_MS, sample, type CursorSample } from '$lib/os/cursorSample';
	import { useOs } from '$lib/os/os.svelte';

	let { root }: { root: HTMLElement | undefined } = $props();

	const { presence } = useOs();
	const els = new Map<string, HTMLElement>();

	function track(node: HTMLElement, id: string) {
		els.set(id, node);
		return { destroy: () => els.delete(id) };
	}

	// Positions arrive pane-relative, so they are turned into pixels each frame;
	// a cursor over /Projects lands on /Projects whatever the layout.
	$effect(() => {
		let raf = 0;
		const draw = (now: number) => {
			if (root && presence.showOthers && presence.others.length) {
				const base = root.getBoundingClientRect();
				const rects = new Map<string, DOMRect | null>();
				const rectOf = (pane: string) => {
					if (!rects.has(pane)) {
						const el = root.querySelector(`[data-pane="${pane}"]`);
						rects.set(pane, el ? el.getBoundingClientRect() : null);
					}
					return rects.get(pane) ?? null;
				};
				const toPx = (s: CursorSample) => {
					const r = rectOf(s.pane);
					return r
						? { x: r.left - base.left + s.x * r.width, y: r.top - base.top + s.y * r.height }
						: null;
				};
				for (const v of presence.others) {
					const p = sample(presence.buffers.get(v.id) ?? [], now - DELAY_MS, toPx);
					const el = els.get(v.id);
					if (el && p) el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
				}
			}
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div class="curs" class:hide={!presence.showOthers} aria-hidden="true">
	{#each presence.others as v (v.id)}
		<div class="cur" use:track={v.id}>
			<i style:background={v.color}></i><span style:background={v.color}>{v.name}</span>
		</div>
	{/each}
</div>
