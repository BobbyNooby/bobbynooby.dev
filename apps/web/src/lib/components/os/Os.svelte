<script lang="ts">
	import type { BshData, BshLink, BshProject, Win } from '$lib/bsh/types';
	import type { GridEntry } from '$lib/media/homeGrid';
	import { ChatState } from '$lib/os/chat.svelte';
	import { LiveState } from '$lib/os/live.svelte';
	import { OsState, setOsContext } from '$lib/os/os.svelte';
	import { PresenceState } from '$lib/os/presence.svelte';
	import { ShellView } from '$lib/os/shell.svelte';
	import { getSteamGamesState, startSteamGames } from '$lib/steam/steamGames.svelte';
	import type { SteamGameListItem } from '$lib/steam/steamTypes';
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
	import Shell from './Shell.svelte';
	import Window from './Window.svelte';

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
	const { os, live, chat, presence } = ctx;
	untrack(() => {
		if (!grid[os.gridCat]) os.gridCat = Object.keys(grid)[0] ?? 'anime';
	});

	const view = new ShellView(ctx, {
		openWindow: (w: Win) => {
			os.win =
				w.kind === 'game'
					? { kind: 'game', appid: w.game.appid }
					: { kind: 'media', category: w.category, index: w.index };
		},
		startSnake: () => {}
	});

	let games = $derived(getSteamGamesState() ?? []);
	let waited = $state(false);

	onMount(() => {
		const stops = [live.start(), chat.start(), presence.start(), startSteamGames()];
		const wait = setTimeout(() => (waited = true), 4000);
		return () => {
			clearTimeout(wait);
			stops.forEach((stop) => stop());
		};
	});

	// The folder tree is built once, so wait for the Steam list and the last song (or 4s).
	$effect(() => {
		const ready = (getSteamGamesState() !== null && live.hasSong) || waited;
		if (!ready) return;
		untrack(() => {
			if (view.shell) return;
			const data: BshData = {
				links,
				projects,
				games: getSteamGamesState() ?? [],
				lastPlayed: live.hasSong ? live.song : null,
				threeByThree: grid
			};
			view.start(data, chat.username);
		});
	});

	// Going live puts the stream first, and being here for it is an achievement.
	$effect(() => {
		if (!twitch.status?.live) return;
		untrack(() => os.focus('twitch'));
		if (view.ready) untrack(() => view.unlock('live'));
	});

	function honk() {
		if (view.shell) view.honk();
		else playAudio(`${staticFilesUrl}/honk.mp3`);
	}

	function openGame(g: SteamGameListItem) {
		os.win = { kind: 'game', appid: g.appid };
		view.unlock('window');
	}

	function openMedia(category: string, index: number) {
		os.win = { kind: 'media', category, index };
		view.unlock('media');
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
			<AboutPane honks={view.honks} onhonk={honk} />
			<ProjectsPane {projects} />
			<GamesPane {games} onopen={openGame} />
			<ChatPane />
		</div>
		<div class="col-r">
			<LinksPane {links} />
			<StatusPane />
			<MusicPane />
			<GridPane {grid} onopen={openMedia} />
		</div>
	</div>

	<Shell {view} />

	{#if os.win}
		<Window win={os.win} {games} {grid} onclose={() => (os.win = null)} />
	{/if}
</div>
