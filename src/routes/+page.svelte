<script lang="ts">
	import { onMount } from 'svelte';
	import type { SpotifySongData } from '$lib/spotify';
	import type { PageData } from './$types';

	export let data: PageData;

	let songData: SpotifySongData = data.songData;

	function randomKeyboardCharacter(): string {
		const validCharacters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=,.<>/?\|{}[];`;

		return validCharacters[Math.floor(Math.random() * validCharacters.length)];
	}

	function scrambleTextTransition(
		inputText: string,
		outputText: string,
		duration: number,
		iterations: number
	) {
		let tempText = inputText;
		const intervalId = setInterval(() => {
			tempText = tempText
				.split('')
				.map((c) => randomKeyboardCharacter())
				.join('');
		}, duration / iterations);
		setTimeout(() => {
			benistextgaming = outputText;
			clearInterval(intervalId);
		}, duration);
	}

	async function getSongData() {
		const data = await fetch('http://localhost:5173/api/spotify_now_playing', {
			method: 'GET'
		}).then((res) => res.json());
		songData = data;
	}
	setInterval(() => {
		getSongData();
	}, 3000);
	onMount(() => {
		getSongData();
		scrambleTextTransition(benistextgaming, 'SvelteBonerGamingasdasd', 1000, 100);
	});

	let benistextgaming = 'SvelteBonerGaming';
</script>

<button
	on:click={() => {
		benistextgaming = 'SvelteBonerGamingasdasd';
	}}>ASDSAD</button
>
<h1>Welcome to SvelteKit {benistextgaming}</h1>

<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<p>{`Now Playing: ${songData.title} by ${songData.artist}`}</p>
<img src={songData.albumImageUrl} alt="Album Art" />
