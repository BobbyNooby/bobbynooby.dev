<script lang="ts">
	import { bar, fmtHours } from '$lib/bsh/format';
	import type { SteamGameListItem } from '$lib/steam/steamTypes';
	import Pane from '../Pane.svelte';

	let { games, onopen }: { games: SteamGameListItem[]; onopen: (g: SteamGameListItem) => void } =
		$props();

	let shown = $derived(games.slice(0, 10));
	let recent = $derived(
		games
			.filter((g) => g.achievements && g.achievements.total)
			.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))[0]
	);

	function fallback(event: Event, appid: number) {
		// library_600x900.jpg 404s for some games, so fall back to the store header.
		const img = event.currentTarget as HTMLImageElement;
		const header = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;
		if (img.src !== header) img.src = header;
		else img.remove();
	}
</script>

<Pane pane="games" title="/Games" label="Games" program="steam · tap a game">
	<div class="games">
		<div class="caps">
			{#each shown as g (g.appid)}
				<button
					class="cap2"
					type="button"
					aria-label="{g.name}, {fmtHours(g.hours)}"
					onclick={() => onopen(g)}
				>
					{g.name}
					<img src={g.capsule} alt="" loading="lazy" onerror={(e) => fallback(e, g.appid)} />
					<b>{fmtHours(g.hours)}</b>
				</button>
			{:else}
				<p class="mut">no games to show right now</p>
			{/each}
		</div>
		{#if recent?.achievements}
			{@const a = recent.achievements}
			<p class="achrow">
				<span class="mut">{recent.name} </span><span
					style:color="#00ff00"
					style:letter-spacing="1px">[{bar(a.unlocked, a.total, 18)}]</span
				>
				{a.unlocked}/{a.total} ({Math.round((a.unlocked / a.total) * 100)}%)
			</p>
		{/if}
	</div>
</Pane>
