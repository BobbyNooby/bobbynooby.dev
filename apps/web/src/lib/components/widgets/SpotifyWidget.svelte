<script lang="ts">
	import { errorLastPlayedSong } from '$lib/spotify/spotifyUtils';
	import type { SpotifyLastPlayedData } from '$lib/spotify/spotifyTypes';
	import { createLiveSocket } from '$lib/utils/liveSocket';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import { onDestroy } from 'svelte';
	import ScrollingText from '../ui/ScrollingText.svelte';

	let songData = $state(errorLastPlayedSong);

	const socket = createLiveSocket<{ song: SpotifyLastPlayedData }>('/spotify', ({ song }) => {
		songData = song;
	});
	onDestroy(() => socket.close());

	// The fallback error song carries no playedAt, so guard against NaN.
	let timeSinceLastSong = $derived.by(() => {
		if (!songData.playedAt) return 0;
		const played = new Date(songData.playedAt).getTime();
		if (Number.isNaN(played)) return 0;
		return Math.round(Math.abs(Date.now() - played) / 1000);
	});

	function gotoURL(url: string) {
		window.open(url, '_blank');
	}
</script>

<button
	onclick={() => gotoURL(songData.songUrl)}
	class=" font-cascadia-code flex h-auto w-full flex-col items-center space-y-2 overflow-hidden rounded-md bg-black text-white"
>
	<p class=" {songData.isPlaying ? 'text-green-400' : 'text-gray-400'}">
		{songData.isPlaying
			? '< Now Playing >'
			: `! Last Played ${secondsToTimeString(timeSinceLastSong)} ago !`}
	</p>
	<img
		class=" rotating-image h-24 w-24 border border-white"
		src={songData.albumImageUrl}
		alt="Album Art"
	/>
	<ScrollingText text={songData.title} tailwindcss="text-xs text-nowrap" />
	<ScrollingText text={songData.artist} rightToLeft={true} tailwindcss="text-xs text-nowrap" />
</button>

<style>
	.rotating-image {
		animation: rotate 3s steps(72) infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate3d(0, 0, 0, 0deg);
		}
		to {
			transform: rotate3d(0, 1, 0, 360deg);
		}
	}
</style>
