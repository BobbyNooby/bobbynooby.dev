<script lang="ts">
	import type { BshData, BshLink, BshProject, PaneKey, Win } from '$lib/bsh/types';
	import type { GridEntry } from '$lib/media/homeGrid';
	import { ChatState } from '$lib/os/chat.svelte';
	import { KONAMI, createTitleTaps, konamiStep } from '$lib/os/eggs';
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
	import Boot from './Boot.svelte';
	import Cursors from './Cursors.svelte';
	import HerePopover from './HerePopover.svelte';
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
		}
	});

	let games = $derived(getSteamGamesState() ?? []);
	let waited = $state(false);
	let root = $state<HTMLDivElement>();

	// One name everywhere: a rename in the chat box or the shell reaches the other and our cursor.
	$effect(() => {
		const name = chat.username;
		untrack(() => {
			presence.hello();
			view.setUser(name);
		});
	});

	function pointer(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		const pane = (event.target as Element).closest<HTMLElement>('[data-pane]');
		if (!pane) return;
		const r = pane.getBoundingClientRect();
		presence.move(
			pane.dataset.pane as PaneKey,
			(event.clientX - r.left) / r.width,
			(event.clientY - r.top) / r.height
		);
	}

	onMount(() => {
		const stops = [
			live.start(),
			chat.start(),
			presence.start(() => chat.username),
			startSteamGames()
		];
		const wait = setTimeout(() => (waited = true), 4000);
		return () => {
			clearTimeout(wait);
			stops.forEach((stop) => stop());
			view.destroy();
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

	// Going live puts the stream first, once; each poll after that leaves focus alone.
	let wasLive = false;
	$effect(() => {
		const isLive = !!twitch.status?.live;
		if (isLive && !wasLive) untrack(() => os.focus('twitch'));
		wasLive = isLive;
	});

	// Being here while Bobby is live is an achievement (unlock is a no-op after the first).
	$effect(() => {
		if (twitch.status?.live && view.ready) untrack(() => view.unlock('live'));
	});

	let konamiPos = 0;
	const titleTaps = createTitleTaps();

	// Konami code or 7 quick title taps: amber phosphor, on and off.
	function phosphor() {
		os.phosphor = !os.phosphor;
		view.print([
			{
				t: os.phosphor
					? '↑ ↑ ↓ ↓ ← → ← → B A · phosphor mode on. do it again to turn it off.'
					: 'phosphor mode off.',
				c: '#facc15'
			}
		]);
		view.unlock('konami');
	}

	function keydown(event: KeyboardEvent) {
		konamiPos = konamiStep(konamiPos, event.key ?? '');
		if (konamiPos === KONAMI.length) {
			konamiPos = 0;
			phosphor();
		}
	}

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

<svelte:window onkeydown={keydown} />

<div
	class="os"
	class:phos={os.phosphor}
	bind:this={root}
	onpointermove={pointer}
	role="presentation"
>
	<Boot />
	<h1 class="sr-only">bobbynooby.dev</h1>
	<Bar onbrand={() => titleTaps(performance.now()) && phosphor()}>
		{#snippet here()}<HerePopover />{/snippet}
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
	<Cursors {root} />
</div>
