<script lang="ts">
	import { onMount } from 'svelte';
	import type { SpotifySongData } from '$lib/spotify';
	import type { PageData } from './$types';
	import { cubicOut } from 'svelte/easing';

	import { getSongData } from '$lib/spotifyUtils';
	import { getSpotifyLastPlayedTime, setSpotifyLastPlayedTime } from '$lib/supabaseUtils';
	import { secondsToTimeString } from '$lib/utils/calculateTimeSinceLastUpdate';

	export let data: PageData;

	let songData: SpotifySongData = data.songData;

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

	let timeSinceLastSong: number = 0;

	async function updateComponent() {
		const newSongData: SpotifySongData = await getSongData();

		const dateClass = new Date();
		const currentTime = dateClass.getTime();
		const spotifyLastTime = await getSpotifyLastPlayedTime();

		if (songData.isPlaying && !newSongData.isPlaying) {
			timeSinceLastSong = 0;
			setSpotifyLastPlayedTime(currentTime);
		} else {
			timeSinceLastSong = Math.round(Math.abs(currentTime - spotifyLastTime) / 1000);
		}
		songData = newSongData;
	}

	setInterval(async () => {
		updateComponent();
	}, 1000);

	onMount(() => {
		updateComponent();
	});
</script>

<h1>Welcome to SvelteKit</h1>

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{#if songData.isPlaying}
	<p>{`Now Playing: ${songData.title} by ${songData.artist}`}</p>
{:else}
	<p>
		{`Last Song Played: ${songData.title} by ${songData.artist}, ${secondsToTimeString(
			timeSinceLastSong
		)} ago`}
	</p>
{/if}
<img src={songData.albumImageUrl} alt="Album Art" />
