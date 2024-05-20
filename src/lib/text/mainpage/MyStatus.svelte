<script lang="ts">
	import DiscordStatus from '$lib/components/DiscordStatus.svelte';
	import type { discordStatuses } from '$lib/discordUtils';
	import { onMount } from 'svelte';

	export let initialDiscordStatus: discordStatuses;

	let discordStatus: discordStatuses = initialDiscordStatus || 'offline';

	let malaysiaTimeString: string = '';
	let ukTimeString: string = '';

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
	<DiscordStatus initialDiscordStatus={discordStatus} />
</div>
<p style="text-indent: 2em;">/time</p>
<p style="text-indent: 4em;">/UK</p>
<p style="text-indent: 6em;">{ukTimeString}</p>
<p style="text-indent: 4em;">/MY</p>
<p style="text-indent: 6em;">{malaysiaTimeString}</p>
