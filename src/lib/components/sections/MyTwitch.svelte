<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { startTwitchPolling, twitch } from '$lib/twitch/twitchLive.svelte';

	// The player requires ?parent= to match the embedding page's hostname.
	let parent = $state('');

	onMount(() => {
		parent = location.hostname;
		return startTwitchPolling();
	});
</script>

<!-- Only occupies the page while live: when live it sits as the first box of
     the left column, otherwise /Status carries a small /twitch line instead. -->
{#if twitch.status?.live}
	<div class="content-box" transition:fade={{ duration: 500 }}>
		<div class="flex items-center gap-2">
			<span class="live-dot"></span>
			<p class="container-title-text text-red-500">/Twitch</p>
			<p class="font-cascadia-code font-bold text-[#9146ff]">LIVE NOW</p>
		</div>
		<iframe
			src={`https://player.twitch.tv/?channel=bobbynooby&parent=${parent}&muted`}
			title="Twitch stream"
			class="mt-2 w-full rounded-md"
			style="aspect-ratio: 16 / 9; border: 0;"
			allowfullscreen
		></iframe>
		<p class="font-cascadia-code mt-2 text-sm break-words text-white">
			{twitch.status.title}
		</p>
		<p class="font-cascadia-code text-sm text-gray-400">
			Playing {twitch.status.game}{twitch.status.viewers
				? ` · ${twitch.status.viewers} viewers`
				: ''}
		</p>
	</div>
{/if}

<style>
	.content-box {
		font-family: 'Cascadia Code', sans-serif;
		margin: 0 5px 20px;
		word-wrap: break-word;
		overflow-wrap: break-word;
		border: 2px solid white;
		border-radius: 0.2rem;
		padding: 10px;
		color: white;
		max-width: 100%;
	}

	.live-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background-color: #9146ff;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
</style>
