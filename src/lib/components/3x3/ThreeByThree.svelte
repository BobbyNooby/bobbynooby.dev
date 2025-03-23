<script lang="ts">
	import { fly, type FlyParams } from 'svelte/transition';
	import MediaItem from './MediaItem.svelte';
	import { cubicInOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import type { GeneralMedia } from '$lib/media/mediaTypes';

	let { mediaList }: { mediaList: GeneralMedia[] } = $props();

	let ready = $state(false);

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

<div class="grid grid-cols-3 space-y-0 space-x-0">
	{#each mediaList as entry, i}
		{#if ready}
			<div in:fly={getTransitionData(i)} style={entry.css.outer}>
				<MediaItem css={entry.css} media={entry} />
			</div>
		{/if}
	{/each}
</div>
