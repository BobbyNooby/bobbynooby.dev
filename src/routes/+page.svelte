<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut, cubicOut } from 'svelte/easing';
	import MyInfo from '$lib/text/mainpage/MyInfo.svelte';
	import MyLinks from '$lib/text/mainpage/MyLinks.svelte';
	import MyStatus from '$lib/text/mainpage/MyStatus.svelte';
	import MySpotify from '$lib/text/mainpage/MySpotify.svelte';
	import MyProjects from '$lib/text/mainpage/MyProjects.svelte';
	import MySystemsStatus from '$lib/text/mainpage/MySystemsStatus.svelte';
	import { playAudio } from '$lib/utils/playAudio';
	import { staticFilesUrl } from '$lib/utils/staticContentDirectory';
	import MyChat from '$lib/text/mainpage/MyChat.svelte';
	import { navigating } from '$app/stores';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;

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
	let ready = false;
	onMount(() => {
		ready = true;
	});
</script>

{#if !$navigating}
	{#if ready}
		<div class="main-screen items-center flex flex-col">
			<p
				in:fade={{ duration: 2000, easing: cubicInOut }}
				out:fade={{ duration: 100, easing: cubicInOut }}
				class="text-white text-7xl font-quicksand-300 mt-5 mb-5"
			>
				<button on:click={() => playAudio(`${staticFilesUrl}/a.mp3`)}>
					<span class="font-cascadia-code">{'>'}</span>bobbynooby.dev</button
				>
			</p>
			<div
				in:fly={{ y: 100, duration: 1000, easing: cubicOut, delay: 1000 }}
				out:fade={{ duration: 100, easing: cubicInOut }}
			>
				<div class="main-container">
					<div class="w-2/3">
						<div class="content-box">
							<MyInfo />
						</div>
						<div class="content-box"><MyProjects projects={data.projects} /></div>
						<!-- <div class="content-box"><MySystemsStatus /></div> -->
						<div class="content-box"><MyChat initialChatData={data.chatMessages} /></div>
					</div>
					<div class="w-1/3">
						<div class="content-box"><MyLinks links={data.links} /></div>
						<div class="content-box">
							<MyStatus initialDiscordStatus={data.discordStatus || 'offline'} />
						</div>
						<div class="content-box">
							<GenericButton
								text={'3x3'}
								inputFunction={() => {
									goto('/3x3');
								}}
							/>
						</div>
						<div class="content-box">
							<MySpotify
								initialSongData={data.songData}
								initialLastSongData={data.spotifyLastPlayedData}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.main-container {
		display: flex;
		flex-direction: row;
		width: 100%;
		z-index: 10;
	}

	.main-screen {
		width: 70rem;
	}
	.content-box {
		font-family: 'Cascadia Code', sans-serif;
		margin-left: 5px;
		margin-right: 5px;
		margin-bottom: 20px;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: normal;
		border-width: 2px;
		border-radius: 0.2rem;
		border-color: white;
		padding: 10px;
		color: white;
		max-width: 100vw;
	}
</style>
