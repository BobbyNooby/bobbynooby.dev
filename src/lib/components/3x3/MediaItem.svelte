<script lang="ts">
	import { fade } from 'svelte/transition';
	import MediaDetails from './MediaDetails.svelte';
	import type { GeneralMedia } from '$lib/media/mediaTypes';

	let { css, media }: { css: { outer: string; inner: string }; media: GeneralMedia } = $props();

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function handleBackgroundClick(event: Event) {
		if (!event.target!.classList.contains('menubackground')) return;
		menuOpen = false;
	}
</script>

<button onclick={toggleMenu} class="image" style={css.outer}>
	<img class="h-full w-full" src={media.coverImageURL} alt={media.titles[0].value} />
</button>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if menuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		class="menubackground"
		onclick={handleBackgroundClick}
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
