<script lang="ts">
	import type { GridEntry } from '$lib/media/homeGrid';
	import { inkFor } from '$lib/os/colors';
	import { useOs } from '$lib/os/os.svelte';
	import Pane from '../Pane.svelte';

	let {
		grid,
		onopen
	}: {
		grid: Record<string, GridEntry[]>;
		onopen: (category: string, index: number) => void;
	} = $props();

	const { os } = useOs();

	let categories = $derived(Object.keys(grid));
	let items = $derived(grid[os.gridCat] ?? []);
</script>

<Pane pane="grid" title="/3x3" label="3x3 grids" program="anilist · tap a tile">
	<div class="g3">
		<div class="grid3">
			<!-- Keyed by category: reusing the tiles kept the old covers up until the new ones loaded. -->
			{#each items as m, i (os.gridCat + ':' + i)}
				<button
					class="tile"
					type="button"
					aria-label="{m.title || m.label}, open details"
					style:background={m.color || '#262626'}
					style:color={inkFor(m.color)}
					onclick={() => onopen(os.gridCat, i)}
				>
					{m.label}
					{#if m.cover}<img src={m.cover} alt="" loading="lazy" />{/if}
				</button>
			{/each}
		</div>
		<div class="tabs3" role="group" aria-label="3x3 category">
			{#each categories as c (c)}
				<button
					class="chip"
					type="button"
					aria-pressed={os.gridCat === c}
					onclick={() => (os.gridCat = c)}>/{c}</button
				>
			{/each}
			<a href="/3x3">open /3x3</a>
		</div>
	</div>
</Pane>
