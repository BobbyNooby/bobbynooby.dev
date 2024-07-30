<script lang="ts">
	import { fade } from 'svelte/transition';
	import MediaDetails from './MediaDetails.svelte';
	import type { GeneralMedia } from '$lib/types/3x3/GeneralMedia';

	export let css: { outer: string; inner: string };
	export let media: GeneralMedia;

	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function handleBackgroundClick(event: Event) {
		if (!event.target.classList.contains('menubackground')) return;
		menuOpen = false;
	}
</script>

<button on:click={toggleMenu} class="image" style={css.outer}>
	<img class="w-full h-full" src={media.coverImageURL} alt={media.titles[0].value} />
</button>

{#if menuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		class="menubackground"
		on:click={handleBackgroundClick}
		on:click={handleBackgroundClick}
	>
		<MediaDetails {media} {css} />
	</div>
{/if}

<style>
	.image {
		transition: transform 0.1s ease-in-out;
	}

	.image:hover {
		transform: scale(1.1);
	}

	.menubackground {
		z-index: 10;
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
		position: fixed;
		align-items: center;
		display: flex;
		justify-content: center;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
