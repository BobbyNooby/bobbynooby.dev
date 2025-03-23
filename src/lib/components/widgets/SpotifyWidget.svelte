<script lang="ts">
	import { onMount } from 'svelte';
	import type { SpotifyLastPlayedData, SpotifySongData } from '$lib/spotify/spotifyTypes';
	import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotify/spotifyUtils';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import ScrollingText from '../ui/ScrollingText.svelte';

	let {
		initialCurrentSongData,
		initialLastSongData
	}: { initialCurrentSongData: SpotifySongData; initialLastSongData: SpotifyLastPlayedData } =
		$props();

	let songData = $state(initialCurrentSongData);
	let lastSongData = $state(initialLastSongData);

	let timeSinceLastSong = $state(
		Math.round(
			Math.abs(
				new Date(new Date().toISOString()).getTime() -
					new Date(initialLastSongData.playedAt).getTime()
			) / 1000
		)
	);

	async function updateComponent() {
		const newCurrentSongData: SpotifySongData = await getCurrentSongData(fetch);
		const newLastSongData: SpotifyLastPlayedData = await getLastPlayedSongData(fetch);
		const currentTime = new Date().getTime();
		const lastPlayedTime = new Date(lastSongData.playedAt).getTime();

		songData = newCurrentSongData;
		lastSongData = newLastSongData;
		timeSinceLastSong = Math.round(Math.abs(currentTime - lastPlayedTime) / 1000);
		console.log(timeSinceLastSong);
	}

	setInterval(async () => {
		await updateComponent();
	}, 5000);

	onMount(async () => {
		await updateComponent();

		window.addEventListener('focus', async () => {
			await updateComponent();
		});
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
		src={songData.isPlaying ? songData.albumImageUrl : lastSongData.albumImageUrl}
		alt="Album Art"
	/>
	<ScrollingText
		text={songData.isPlaying ? songData.title : lastSongData.title}
		tailwindcss="text-xs text-nowrap"
	/>
	<ScrollingText
		text={songData.isPlaying ? songData.artist : lastSongData.artist}
		rightToLeft={true}
		tailwindcss="text-xs text-nowrap"
	/>
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
