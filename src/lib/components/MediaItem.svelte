<script lang="ts">
	import type { Anime, Manga } from '$lib/types/aniListMedia';
	import { fade } from 'svelte/transition';
	import MediaDetails from './MediaDetails.svelte';

	export let tailwindcss: string, media: Anime & Manga;

	let menuOpen = false;

	function handleClick() {
		menuOpen = !menuOpen;
	}
</script>

<button on:click={handleClick} class="{tailwindcss} image">
	<img class="w-full h-full" src={media.coverImage.large} alt={media.title.userPreferred} />
</button>

{#if menuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
		class="menubackground"
		on:click={handleClick}
	>
		<MediaDetails {media} />
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
