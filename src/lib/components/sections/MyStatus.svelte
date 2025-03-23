<script lang="ts">
	import type { discordStatuses } from '$lib/discord/discordTypes';
	import { onMount } from 'svelte';
	import DiscordWidget from '../widgets/DiscordWidget.svelte';
	import Emoji from '$lib/components/ui/Emoji.svelte';

	let { initialDiscordStatus }: { initialDiscordStatus: discordStatuses } = $props();

	let discordStatus: discordStatuses = initialDiscordStatus || 'offline';

	let malaysiaTimeString: string = $state('');
	let ukTimeString: string = $state('');

	onMount(() => {
		const dateClass = new Date();
		malaysiaTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' });
		ukTimeString = dateClass.toLocaleString('en-GB', { timeZone: 'Europe/London' });
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
	<DiscordWidget initialDiscordStatus={discordStatus} />
</div>
<p style="text-indent: 2em;">/time</p>
<p style="text-indent: 4em;">/UK <span><Emoji emoji={'🇬🇧'} /></span></p>
<p style="text-indent: 6em;">{ukTimeString}</p>
<p style="text-indent: 4em;">/MY <span><Emoji emoji={'🇲🇾'} /></span></p>
<p style="text-indent: 6em;">{malaysiaTimeString}</p>
