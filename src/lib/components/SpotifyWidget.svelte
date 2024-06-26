<script lang="ts">
	import type { SpotifySongData } from '$lib/spotify';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import { onMount } from 'svelte';
	import ScrollingText from './ScrollingText.svelte';
	import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotifyUtils';
	import { type SpotifyLastPlayedData } from '$lib/supabaseUtils';

	export let initialSongData: SpotifySongData, initialLastSongData: SpotifyLastPlayedData;

	let songData = initialSongData;
	let lastSongData = initialLastSongData;

	let timeSinceLastSong: number = Math.round(
		Math.abs(new Date().getTime() - initialLastSongData.time) / 1000
	);

	async function updateComponent() {
		const newSongData: SpotifySongData = await getCurrentSongData();
		const spotifyLastPlayedData: SpotifyLastPlayedData = await getLastPlayedSongData();
		const currentTime = new Date().getTime();

		if (songData.isPlaying && !newSongData.isPlaying) {
			lastSongData = spotifyLastPlayedData;
		} else {
			timeSinceLastSong = Math.round(Math.abs(currentTime - spotifyLastPlayedData.time) / 1000);
		}

		songData = newSongData;
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
	on:click={() => gotoURL(songData.songUrl)}
	class=" flex flex-col h-auto w-full bg-black items-center text-white font-cascadia-code rounded-md space-y-2 overflow-hidden"
>
	<p class=" {songData.isPlaying ? 'text-green-400' : 'text-gray-400'}">
		{songData.isPlaying
			? '< Now Playing >'
			: `! Last Played ${secondsToTimeString(timeSinceLastSong)} ago !`}
	</p>
	<img
		class=" w-24 h-24 border border-white rotating-image"
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
