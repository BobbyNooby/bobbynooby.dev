<script lang="ts">
	import { onMount } from 'svelte';
	import type { SpotifySongData } from '$lib/spotify';
	import type { PageData } from './$types';
	import { getSongData } from '$lib/spotifyUtils';
	import {
		getSpotifyLastPlayedData,
		setSpotifyLastPlayedData,
		type SpotifyLastPlayedData
	} from '$lib/supabaseUtils';
	import { secondsToTimeString } from '$lib/utils/secondsToTimeString';
	import SpotifyWidget from '$lib/components/SpotifyWidget.svelte';
	import DiscordStatus from '$lib/components/DiscordStatus.svelte';

	export let data: PageData;

	let songData: SpotifySongData = data.songData;
	let lastSongData: SpotifyLastPlayedData = data.spotifyLastPlayedData;

	function randomKeyboardCharacter(): string {
		const validCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=,.<>/?\|{}[];`;

		return validCharacters[Math.floor(Math.random() * validCharacters.length)];
	}

	// function scrambleTextTransition(
	// 	inputText: string,
	// 	outputText: string,
	// 	duration: number,
	// 	iterations: number
	// ) {
	// 	let tempText = inputText;
	// 	const intervalId = setInterval(() => {
	// 		tempText = tempText
	// 			.split('')
	// 			.map((c) => randomKeyboardCharacter())
	// 			.join('');
	// 	}, duration / iterations);
	// 	setTimeout(() => {
	// 		benistextgaming = outputText;
	// 		clearInterval(intervalId);
	// 	}, duration);
	// }
</script>

<p class="text-white text-7xl font-quicksand-300">bobbynooby.dev</p>
<SpotifyWidget initialSongData={songData} initialLastSongData={lastSongData}></SpotifyWidget>
<DiscordStatus initialDiscordStatus={data.discordStatus}></DiscordStatus>
