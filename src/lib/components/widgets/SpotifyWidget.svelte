<script lang="ts">
	import { PUBLIC_WEBSOCKET_BASE_URL } from '$env/static/public';
	import { errorLastPlayedSong, errorSong } from '$lib/spotify/spotifyUtils';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import ScrollingText from '../ui/ScrollingText.svelte';

	let songData = $state(errorLastPlayedSong);

	const ws = new WebSocket(`${PUBLIC_WEBSOCKET_BASE_URL}/spotify`);

	ws.onmessage = (event) => {
		const { data } = event;
		const { song } = JSON.parse(data);

		songData = song;
	};

	let timeSinceLastSong = $derived(
		Math.round(
			Math.abs(
				new Date(new Date().toISOString()).getTime() - new Date(songData.playedAt).getTime()
			) / 1000
		)
	);

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
