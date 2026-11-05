<script lang="ts">
	import { DISCORD_COLORS } from '$lib/os/colors';
	import { useOs } from '$lib/os/os.svelte';
	import { twitch } from '$lib/twitch/twitchLive.svelte';
	import Pane from '../Pane.svelte';

	const { live } = useOs();

	const full = (timeZone: string, now: Date) => now.toLocaleString('en-GB', { timeZone });
</script>

<Pane pane="status" title="/Status" label="Status" program="tree">
	<div class="tree">
		<p>/discord</p>
		<p class="i1" style:color={DISCORD_COLORS[live.discord]}>{live.discord}.sh</p>
		{#if twitch.status?.configured !== false}
			<p>/twitch</p>
			{#if twitch.status?.live}
				<p class="i1" style:color="#a970ff" style:font-weight="700">live</p>
			{:else}
				<p class="i1" style:color="#8a8a8a">offline</p>
			{/if}
		{/if}
		<p>/time</p>
		<p class="i1">/UK <span class="emoji-font">🇬🇧</span></p>
		<p class="i2">{full('Europe/London', live.now)}</p>
		<p class="i1">/MY <span class="emoji-font">🇲🇾</span></p>
		<p class="i2">{full('Asia/Kuala_Lumpur', live.now)}</p>
	</div>
</Pane>
