<script lang="ts">
	import type { SpotifySongData } from '$lib/spotify';
	import { getSongData } from '$lib/spotifyUtils';
	import {
		getSpotifyLastPlayedData,
		setSpotifyLastPlayedData,
		type SpotifyLastPlayedData
	} from '$lib/supabaseUtils';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import { onMount } from 'svelte';

	export let initialSongData: SpotifySongData, initialLastSongData: SpotifyLastPlayedData;

	let songData = initialSongData;
	let lastSongData = initialLastSongData;

	let timeSinceLastSong: number = Math.round(
		Math.abs(new Date().getTime() - initialLastSongData.time) / 1000
	);

	async function updateComponent() {
		const newSongData: SpotifySongData = await getSongData();
		const currentTime = new Date().getTime();
		const spotifyLastPlayedData: SpotifyLastPlayedData = await getSpotifyLastPlayedData();

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
	class=" flex flex-col h-auto w-full bg-black items-center text-white font-cascadia-code rounded-md space-y-2"
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
	<p class="text-xs text-nowrap">{songData.title}</p>
	<p class="text-xs text-nowrap">{songData.artist}</p>
</button>
