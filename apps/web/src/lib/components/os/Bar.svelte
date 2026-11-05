<script lang="ts">
	import { ago } from '$lib/bsh/format';
	import type { PaneKey } from '$lib/bsh/types';
	import { DISCORD_COLORS } from '$lib/os/colors';
	import { useOs } from '$lib/os/os.svelte';
	import { twitch } from '$lib/twitch/twitchLive.svelte';
	import { staticFilesUrl } from '$lib/utils/externalURLs';
	import { playAudio } from '$lib/utils/playAudio';
	import type { Snippet } from 'svelte';

	let { here, onbrand }: { here?: Snippet; onbrand?: () => void } = $props();

	const { os, live } = useOs();

	const WORKSPACES: [PaneKey, string][] = [
		['about', '1 about'],
		['projects', '2 projects'],
		['games', '3 games'],
		['chat', '4 chat'],
		['links', '5 links'],
		['status', '6 status'],
		['music', '7 music'],
		['grid', '8 3x3']
	];

	const hhmm = (timeZone: string, now: Date) =>
		new Intl.DateTimeFormat('en-GB', {
			timeZone,
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23'
		}).format(now);

	let playing = $derived(live.song.isPlaying);
	let label = $derived(
		playing ? '< Now Playing >' : '! Last Played ' + ago(live.song.playedAt, live.now) + ' !'
	);

	function brand() {
		playAudio(`${staticFilesUrl}/a.mp3`);
		onbrand?.();
	}
</script>

<header class="bar">
	<button class="brand" type="button" onclick={brand}><b>&gt;</b>bobbynooby.dev</button>
	<nav class="ws" aria-label="Workspaces">
		{#if twitch.status?.live}
			<button
				class="wsb live"
				type="button"
				aria-pressed={os.focused === 'twitch'}
				onclick={() => os.focus('twitch', true)}>0 live</button
			>
		{/if}
		{#each WORKSPACES as [pane, text] (pane)}
			<button
				class="wsb"
				type="button"
				aria-pressed={os.focused === pane}
				onclick={() => os.focus(pane, true)}>{text}</button
			>
		{/each}
	</nav>
	<div class="np">
		<svg
			aria-hidden="true"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#4ade80"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle
				cx="18"
				cy="16"
				r="3"
			></circle></svg
		>
		<span class="lbl" style:color={playing ? '#4ade80' : '#9ca3af'}>{label}</span>
		<span class="ell">{live.song.title} — {live.song.artist}</span>
	</div>
	<div class="stat">
		<span style:color={DISCORD_COLORS[live.discord]}>● {live.discord}.sh</span>
		{#if twitch.status?.live}
			<span style:color="#a970ff">● live on twitch</span>
		{:else}
			<span class="mut">twitch: offline</span>
		{/if}
		<span>UK <span>{hhmm('Europe/London', live.now)}</span></span>
		<span>MY <span>{hhmm('Asia/Kuala_Lumpur', live.now)}</span></span>
	</div>
	{@render here?.()}
	<div class="toast" class:show={os.toastShown} role="status" aria-live="polite">
		{os.toastText}
	</div>
</header>
