<script lang="ts">
	import { onMount } from 'svelte';
	import DiscordWidget from '../widgets/DiscordWidget.svelte';
	import Emoji from '$lib/components/ui/Emoji.svelte';
	import { startTwitchPolling, twitch } from '$lib/twitch/twitchLive.svelte';

	let malaysiaTimeString: string = $state('');
	let ukTimeString: string = $state('');

	onMount(() => {
		const dateClass = new Date();
		malaysiaTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' });
		ukTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Europe/London' });
		return startTwitchPolling();
	});

	setInterval(() => {
		const dateClass = new Date();
		malaysiaTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' });
		ukTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Europe/London' });
	}, 100);
</script>

<p class="container-title-text">/Status</p>
<p style="text-indent: 2em;">/discord</p>
<div style=" text-indent: 4em ">
	<DiscordWidget />
</div>
{#if twitch.status?.configured}
	<p style="text-indent: 2em;">/twitch</p>
	<p style="text-indent: 4em;">
		{#if twitch.status.live}
			<span class="live-text">live</span>
		{:else}
			<span class="offline-text">offline</span>
		{/if}
	</p>
{/if}
<p style="text-indent: 2em;">/time</p>
<p style="text-indent: 4em;">/UK <span><Emoji emoji={'🇬🇧'} /></span></p>
<p style="text-indent: 6em;">{ukTimeString}</p>
<p style="text-indent: 4em;">/MY <span><Emoji emoji={'🇲🇾'} /></span></p>
<p style="text-indent: 6em;">{malaysiaTimeString}</p>

<style>
	.live-text {
		color: #9146ff;
		font-weight: bold;
	}

	.offline-text {
		color: #7a7a7a;
	}
</style>
