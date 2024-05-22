<script lang="ts">
	import type { SpotifySongData } from '$lib/spotify';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import { onMount } from 'svelte';
	import ScrollingText from './ScrollingText.svelte';
	import { getCurrentSongData, getLastPlayedSongData } from '$lib/spotifyUtils';
	import { setSpotifyLastPlayedData, type SpotifyLastPlayedData } from '$lib/supabaseUtils';

	export let initialSongData: SpotifySongData, initialLastSongData: SpotifyLastPlayedData;

	let songData = initialSongData;
	let lastSongData = initialLastSongData;

	let timeSinceLastSong: number = Math.round(
		Math.abs(new Date().getTime() - initialLastSongData.time) / 1000
	);

	async function updateComponent() {
		const newSongData: SpotifySongData = await getCurrentSongData();
		const currentTime = new Date().getTime();
		const spotifyLastPlayedData: SpotifyLastPlayedData = await getLastPlayedSongData();
		console.log();
		if (songData.isPlaying && !newSongData.isPlaying) {
			timeSinceLastSong = 0;

			const dataForFunction: SpotifyLastPlayedData = {
				time: currentTime,
				title: newSongData.title,
				artist: newSongData.artist,
				album: newSongData.album,
				albumImageUrl: newSongData.albumImageUrl,
				songUrl: newSongData.songUrl
			};

			setSpotifyLastPlayedData(dataForFunction);

			lastSongData = dataForFunction;
		} else {
			timeSinceLastSong = Math.round(Math.abs(currentTime - spotifyLastPlayedData.time) / 1000);
		}

		songData = newSongData;
	}

	setInterval(async () => {
		updateComponent();
	}, 5000);

	onMount(async () => {
		updateComponent();
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
			? 'Now Playing'
			: `Last Played ${secondsToTimeString(timeSinceLastSong)} ago`}
	</p>
	<img
		class=" w-24 h-24 border border-white"
		src={songData.isPlaying ? songData.albumImageUrl : lastSongData.albumImageUrl}
		alt="Album Art"
	/>
	<ScrollingText text={songData.title} tailwindcss="text-xs text-nowrap" />
	<ScrollingText text={songData.artist} tailwindcss="text-xs text-nowrap" />
</button>
