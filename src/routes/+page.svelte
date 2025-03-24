<script lang="ts">
	import MyInfo from '$lib/components/sections/MyInfo.svelte';
	import MyLinks from '$lib/components/sections/MyLinks.svelte';
	import MyProjects from '$lib/components/sections/MyProjects.svelte';
	import Title from '$lib/components/sections/Title.svelte';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import MyStatus from '$lib/components/sections/MyStatus.svelte';
	import MySpotify from '$lib/components/sections/MySpotify.svelte';
	import My3x3 from '$lib/components/sections/My3x3.svelte';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	let ready = $state(false);

	const interval = 200;
	const duration = 1000;

	const arrangement = {
		info: 1,
		projects: 2,
		links: 3,
		status: 4,
		music: 5,
		threeByThree: 6
	};

	onMount(() => {
		ready = true;
	});
</script>

{#if ready}
	<div class="main-screen flex flex-col items-center">
		<div class="mb-5" transition:fade={{ delay: 0, duration: duration }}>
			<Title />
		</div>
		<div class="main-container">
			<div class="w-2/3">
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.info * interval, duration: duration }}
				>
					<MyInfo />
				</div>
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.projects * interval, duration: duration }}
				>
					<MyProjects projects={data.projects} />
				</div>
			</div>
			<div class="w-1/3">
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.links * interval, duration: duration }}
				>
					<MyLinks links={data.links} />
				</div>
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.status * interval, duration: duration }}
				>
					<MyStatus initialDiscordStatus={data.discordStatus} />
				</div>
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.music * interval, duration: duration }}
				>
					<MySpotify
						initialCurrentSongData={data.currentSongData}
						initialLastSongData={data.lastSongData}
					/>
				</div>
				<div
					class="content-box"
					transition:fade={{ delay: arrangement.threeByThree * interval, duration: duration }}
				>
					<My3x3 />
				</div>
			</div>
		</div>
	</div>
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
