<script lang="ts">
	import { bar, fmtHours, safeHref } from '$lib/bsh/format';
	import { slug } from '$lib/bsh/slug';
	import type { GridEntry } from '$lib/media/homeGrid';
	import { plainText } from '$lib/media/plainText';
	import { inkFor } from '$lib/os/colors';
	import type { OsWindow } from '$lib/os/os.svelte';
	import type { SteamGameDetails, SteamGameListItem } from '$lib/steam/steamTypes';
	import { getGreenRedColorFromScore } from '$lib/utils/getGreenRedColorFromScore';
	import { tick } from 'svelte';

	let {
		win,
		games,
		grid,
		onclose
	}: {
		win: OsWindow;
		games: SteamGameListItem[];
		grid: Record<string, GridEntry[]>;
		onclose: () => void;
	} = $props();

	let box = $state<HTMLDivElement>();
	let top = $state(200);
	let details = $state<SteamGameDetails | null>(null);

	let game = $derived(win.kind === 'game' ? games.find((g) => g.appid === win.appid) : undefined);
	let media = $derived(win.kind === 'media' ? grid[win.category]?.[win.index] : undefined);
	let genres = $derived(details?.genres.length ? details.genres : (game?.genres ?? []));
	let release = $derived(details?.releaseDate ?? game?.releaseDate ?? null);
	let ach = $derived(details?.achievements?.total ? details.achievements : game?.achievements);
	let title = $derived(
		win.kind === 'game'
			? '~/games/' + (slug(game?.name ?? '') || 'game') + '.txt — steam'
			: '~/3x3/' + win.category + '/' + (slug(media?.label ?? '') || 'entry') + '.txt — anilist'
	);

	// Open next to the pane it came from, like the sheet does.
	$effect(() => {
		const pane = document.querySelector<HTMLElement>(
			`[data-pane="${win.kind === 'game' ? 'games' : 'grid'}"]`
		);
		top = Math.max(60, (pane?.offsetTop ?? 220) - 20);
		tick().then(() => box?.focus({ preventScroll: true }));
	});

	$effect(() => {
		if (win.kind !== 'game') return;
		const appid = win.appid;
		details = null;
		fetch(`/api/steam/game/${appid}`)
			.then((r) => r.json())
			.then((body: { details: SteamGameDetails | null }) => {
				if (win.kind === 'game' && win.appid === appid) details = body.details;
			})
			.catch(() => {});
	});

	const played = (ts: number) =>
		new Date(ts * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' });

	function onheaderror(event: Event) {
		(event.currentTarget as HTMLImageElement).remove();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="win" role="dialog" aria-label={title} tabindex="-1" style:top="{top}px" bind:this={box}>
	<div class="ph">
		<h2>{title}</h2>
		<button class="wclose" type="button" aria-label="Close window" onclick={onclose}>×</button>
	</div>
	<div class="wbody">
		{#if win.kind === 'game' && game}
			<img
				class="gbanner"
				src="https://steamcdn-a.akamaihd.net/steam/apps/{game.appid}/header.jpg"
				alt=""
				onerror={onheaderror}
			/>
			<p class="gname">{game.name}</p>
			<div class="tags">
				<span class="tag acc">{fmtHours(game.hours)}</span>
				{#if game.lastPlayed}<span class="tag">last played {played(game.lastPlayed)}</span>{/if}
				{#if release}<span class="tag">{release}</span>{/if}
				{#each genres as g (g)}<span class="tag">[{g.toUpperCase()}]</span>{/each}
			</div>
			{#if details?.short}<p class="desc">{plainText(details.short)}</p>{/if}
			<p class="gach">
				{#if ach && ach.total}
					<span style:color="#00ff00" style:letter-spacing="1px"
						>[{bar(ach.unlocked, ach.total, 18)}]</span
					>
					{ach.unlocked}/{ach.total} ({Math.round((ach.unlocked / ach.total) * 100)}%)
				{:else}
					<span class="mut">no achievement data for this one</span>
				{/if}
			</p>
			<p>
				<a
					href="https://store.steampowered.com/app/{game.appid}"
					target="_blank"
					rel="noopener noreferrer">open on Steam</a
				>
			</p>
		{:else if win.kind === 'media' && media}
			<div class="mwin">
				<div
					class="cover"
					style:background={media.color || '#262626'}
					style:color={inkFor(media.color)}
				>
					{media.label}
					{#if media.cover}<img src={media.cover} alt="" />{/if}
				</div>
				<div class="mtext">
					<p class="gname">{media.title || media.label}</p>
					{#each media.altTitles as alt (alt)}<p class="mut">{alt}</p>{/each}
					<div class="tags">
						<span class="tag acc">/3x3/{win.category} #{win.index + 1}</span>
						{#each media.details as d (d.label)}
							<span class="tag">{d.label}: <span style:color={d.color}>{d.value}</span></span>
						{/each}
						{#each media.genres as g (g)}<span class="tag">{g}</span>{/each}
					</div>
					<p class="bs">BobStats™</p>
					<p style:color={getGreenRedColorFromScore(media.score * 100)}>
						Score : {media.score * 10}
					</p>
					<p>{media.review || 'No review yet.'}</p>
					{#if media.description}<p class="desc mut">{media.description}</p>{/if}
					{#if safeHref(media.url ?? '')}
						<p>
							<a href={safeHref(media.url ?? '')} target="_blank" rel="noopener noreferrer"
								>open on AniList</a
							>
						</p>
					{/if}
				</div>
			</div>
		{:else}
			<p class="mut">nothing here anymore.</p>
		{/if}
	</div>
</div>
