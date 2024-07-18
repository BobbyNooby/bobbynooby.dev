<script lang="ts">
	import type { Anime, Manga } from '$lib/types/aniListMedia';
	import { fly, type FlyParams } from 'svelte/transition';
	import MediaItem from './MediaItem.svelte';
	import { cubicInOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	export let list: Anime[] & Manga[];

	let ready = false;

	onMount(() => {
		ready = true;
	});

	function getTransitionData(index: number): FlyParams {
		let x: number = 0;
		let y: number = 0;
		let easing = cubicInOut;
		let duration = 2000;

		if (index % 3 === 0) {
			x = -100;
		} else if (index % 3 === 2) {
			x = 100;
		}

		if (index < 3) {
			y = -100;
		} else if (index > 5) {
			y = 100;
		}

		return { x, y, easing, duration };
	}
</script>

<div class="grid grid-cols-3 space-x-0 space-y-0">
	{#each list as entry, i}
		{#if ready}
			<div in:fly={getTransitionData(i)} class="h-72 w-48">
				<MediaItem tailwindcss={'h-72 w-48'} media={entry} />
			</div>
		{/if}
	{/each}
</div>
