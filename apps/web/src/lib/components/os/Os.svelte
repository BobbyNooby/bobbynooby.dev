<script lang="ts">
	import type { BshLink, BshProject } from '$lib/bsh/types';
	import type { GridEntry } from '$lib/media/homeGrid';
	import { ChatState } from '$lib/os/chat.svelte';
	import { LiveState } from '$lib/os/live.svelte';
	import { OsState, setOsContext } from '$lib/os/os.svelte';
	import { PresenceState } from '$lib/os/presence.svelte';
	import { getSteamGamesState, startSteamGames } from '$lib/steam/steamGames.svelte';
	import { twitch } from '$lib/twitch/twitchLive.svelte';
	import { staticFilesUrl } from '$lib/utils/externalURLs';
	import { playAudio } from '$lib/utils/playAudio';
	import { onMount, untrack } from 'svelte';
	import Bar from './Bar.svelte';
	import './os.css';
	import AboutPane from './panes/AboutPane.svelte';
	import ChatPane from './panes/ChatPane.svelte';
	import GamesPane from './panes/GamesPane.svelte';
	import GridPane from './panes/GridPane.svelte';
	import LinksPane from './panes/LinksPane.svelte';
	import MusicPane from './panes/MusicPane.svelte';
	import ProjectsPane from './panes/ProjectsPane.svelte';
	import StatusPane from './panes/StatusPane.svelte';
	import TwitchPane from './panes/TwitchPane.svelte';

	let {
		links,
		projects,
		grid
	}: { links: BshLink[]; projects: BshProject[]; grid: Record<string, GridEntry[]> } = $props();

	const ctx = setOsContext({
		os: new OsState(),
		live: new LiveState(),
		chat: new ChatState(),
		presence: new PresenceState()
	});
	const { os, presence } = ctx;
	untrack(() => {
		if (!grid[os.gridCat]) os.gridCat = Object.keys(grid)[0] ?? 'anime';
	});

	let games = $derived(getSteamGamesState() ?? []);
	let honks = $state(0);

	onMount(() => {
		const stops = [ctx.live.start(), ctx.chat.start(), presence.start(), startSteamGames()];
		return () => stops.forEach((stop) => stop());
	});

	// Going live puts the stream first.
	$effect(() => {
		if (twitch.status?.live) untrack(() => os.focus('twitch'));
	});

	function honk() {
		playAudio(`${staticFilesUrl}/honk.mp3`);
		honks += 1;
	}
</script>

<div class="os">
	<h1 class="sr-only">bobbynooby.dev</h1>
	<Bar>
		{#snippet here()}
			<div class="here">
				<button class="herebtn" type="button">{presence.here} here</button>
			</div>
		{/snippet}
	</Bar>

	<div class="panes">
		<div class="col-l">
			<TwitchPane />
			<AboutPane {honks} onhonk={honk} />
			<ProjectsPane {projects} />
			<GamesPane {games} onopen={() => os.focus('games')} />
			<ChatPane />
		</div>
		<div class="col-r">
			<LinksPane {links} />
			<StatusPane />
			<MusicPane />
			<GridPane {grid} onopen={() => os.focus('grid')} />
		</div>
	</div>

	<section class="shell" aria-label="Shell">
		<div class="ph"><h2>~ — bsh</h2></div>
		<div class="out"></div>
	</section>
</div>
