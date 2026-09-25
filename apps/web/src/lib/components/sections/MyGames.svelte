<script lang="ts">
	import { onMount } from 'svelte';
	import type { SteamGameDetails, SteamGameSummary } from '$lib/steam/steamTypes';
	import { getSteamGamesState, startSteamGames } from '$lib/steam/steamGames.svelte';

	let games = $derived(getSteamGamesState());
	let selected = $state<{ summary: SteamGameSummary; details: SteamGameDetails | null } | null>(
		null
	);
	let loadingDetails = $state(false);
	let cardEl = $state<HTMLDivElement | undefined>(undefined);

	const fmtHours = (h: number) => `${h.toLocaleString('en-US')}h`;
	const fmtPlayed = (ts: number | null) =>
		ts ? new Date(ts * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '';

	// Character-cell achievement bar, e.g. [████████░░░░░░░░░░] 35/42 (83%)
	const ACH_CELLS = 18;
	function achBar(unlocked: number, total: number) {
		const filled = Math.round((unlocked / total) * ACH_CELLS);
		return `${'█'.repeat(filled)}${'░'.repeat(ACH_CELLS - filled)}`;
	}

	async function open(summary: SteamGameSummary) {
		selected = { summary, details: null };
		loadingDetails = true;
		try {
			const res = await fetch(`/api/steam/game/${summary.appid}`);
			const body = (await res.json()) as { details: SteamGameDetails | null };
			// A slow response for an earlier click must not clobber the current card.
			if (selected?.summary.appid !== summary.appid) return;
			selected = { summary, details: body.details };
		} catch {
			if (selected?.summary.appid !== summary.appid) return;
			selected = { summary, details: null };
		} finally {
			loadingDetails = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') selected = null;
	}

	function onCapsuleError(event: Event, summary: SteamGameSummary) {
		// library_600x900.jpg 404s for some games — fall back to the store header.
		const img = event.currentTarget as HTMLImageElement;
		if (!img.src.includes('header.jpg')) {
			img.src = `https://steamcdn-a.akamaihd.net/steam/apps/${summary.appid}/header.jpg`;
		}
	}

	$effect(() => {
		if (selected) cardEl?.focus();
	});

	onMount(() => startSteamGames());
</script>

<svelte:document onkeydown={onKeydown} />

{#if games && games.length > 0}
	{#if selected}
		<div
			class="fixed inset-0 z-50 bg-black/70"
			onclick={(e) => e.target === e.currentTarget && (selected = null)}
			aria-hidden="true"
		></div>
		<div
			class="game-card"
			role="dialog"
			aria-label={selected.summary.name}
			tabindex="-1"
			bind:this={cardEl}
		>
			<div class="game-card-banner">
				<img
					src={`https://steamcdn-a.akamaihd.net/steam/apps/${selected.summary.appid}/header.jpg`}
					alt={selected.summary.name}
					class="game-card-img"
					onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
				/>
				<button class="game-card-close" aria-label="Close" onclick={() => (selected = null)}>
					×
				</button>
			</div>
			<h3 class="game-card-title">{selected.summary.name}</h3>
			<div class="game-card-chips">
				<span class="chip chip-accent">{fmtHours(selected.summary.hours)}</span>
				{#if selected.summary.lastPlayed}
					<span class="chip">last played {fmtPlayed(selected.summary.lastPlayed)}</span>
				{/if}
				{#if selected.details?.releaseDate}
					<span class="chip">{selected.details.releaseDate}</span>
				{/if}
				{#each selected.details?.genres ?? [] as genre (genre)}
					<span class="chip">[{genre.toUpperCase()}]</span>
				{/each}
			</div>
			{#if loadingDetails}
				<p class="game-card-ach text-gray-400">loading achievements…</p>
			{:else if selected.details && selected.details.achievements.total > 0}
				<p class="game-card-ach">
					<span class="ach-track"
						>{achBar(
							selected.details.achievements.unlocked,
							selected.details.achievements.total
						)}</span
					>
					<span class="ach-count">
						{selected.details.achievements.unlocked}/{selected.details.achievements.total}
						({Math.round(
							(selected.details.achievements.unlocked / selected.details.achievements.total) * 100
						)}%)
					</span>
				</p>
			{/if}
		</div>
	{/if}
	<div class="games-title-row">
		<p class="games-title">/Games</p>
	</div>
	<div class="carousel-viewport">
		{#if games.length > 1}
			<div class="carousel-track">
				{#each [...games, ...games] as game, i (i)}
					<button class="capsule" onclick={() => open(game)} title={game.name}>
						<img
							src={game.capsule}
							alt={game.name}
							loading="lazy"
							onerror={(e) => onCapsuleError(e, game)}
						/>
						<span class="capsule-hours">{fmtHours(game.hours)}</span>
					</button>
				{/each}
			</div>
		{:else}
			{#each games as game (game.appid)}
				<button class="capsule" onclick={() => open(game)} title={game.name}>
					<img
						src={game.capsule}
						alt={game.name}
						loading="lazy"
						onerror={(e) => onCapsuleError(e, game)}
					/>
					<span class="capsule-hours">{fmtHours(game.hours)}</span>
				</button>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.games-title-row {
		border-bottom: 2px solid white;
		padding-bottom: 6px;
		text-align: center;
	}
	.games-title {
		font-family: 'Cascadia Code';
		font-size: 1.5rem;
		font-weight: bold;
		color: #1b9be8;
	}
	.carousel-viewport {
		overflow: hidden;
		margin-top: 8px;
	}
	.capsule {
		position: relative;
		flex: 0 0 auto;
		width: 110px;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 0.2rem;
		padding: 0;
		background: none;
		cursor: pointer;
		transition:
			transform 150ms ease,
			border-color 150ms ease;
	}
	.capsule:hover {
		transform: translateY(-3px);
		border-color: #1b9be8;
	}
	.capsule img {
		display: block;
		width: 100%;
		aspect-ratio: 600 / 900;
		object-fit: cover;
		border-radius: 0.2rem;
	}
	.capsule-hours {
		position: absolute;
		right: 4px;
		bottom: 4px;
		padding: 1px 5px;
		font-size: 0.75rem;
		background: rgba(0, 0, 0, 0.75);
		border-radius: 0.2rem;
		color: white;
		font-family: 'Cascadia Code';
	}
	@media (prefers-reduced-motion: no-preference) {
		.carousel-viewport:hover .carousel-track {
			animation-play-state: paused;
		}
		.carousel-track {
			display: flex;
			gap: 8px;
			width: max-content;
			animation: scroll 40s linear infinite;
		}
		@keyframes scroll {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(-50%);
			}
		}
		.game-card {
			animation: pop 180ms ease-out;
		}
		@keyframes pop {
			from {
				transform: translate(-50%, -50%) scale(0.95);
				opacity: 0;
			}
			to {
				transform: translate(-50%, -50%) scale(1);
				opacity: 1;
			}
		}
	}
	@media (prefers-reduced-motion: reduce) {
		/* No animation: the viewport becomes a plain scrollable row instead. */
		.carousel-viewport {
			overflow-x: auto;
		}
		.carousel-track {
			display: flex;
			gap: 8px;
			width: max-content;
		}
	}
	.game-card {
		position: fixed;
		z-index: 51;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(440px, 90vw);
		max-height: 85vh;
		overflow-y: auto;
		background: black;
		border: 2px solid white;
		border-radius: 0.2rem;
		color: white;
		font-family: 'Cascadia Code';
		outline: none;
		box-shadow:
			0 0 24px rgba(27, 155, 232, 0.35),
			0 8px 30px rgba(0, 0, 0, 0.8);
	}
	.game-card-banner {
		position: relative;
	}
	.game-card-banner::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, transparent 40%, black);
		pointer-events: none;
	}
	.game-card-img {
		display: block;
		width: 100%;
		aspect-ratio: 460 / 215;
		object-fit: cover;
	}
	.game-card-close {
		position: absolute;
		z-index: 1;
		top: 6px;
		right: 10px;
		font-size: 1.25rem;
		color: white;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 0.2rem;
		width: 1.75rem;
		height: 1.75rem;
		line-height: 1;
		cursor: pointer;
	}
	.game-card-title {
		margin: 8px 14px 0;
		font-size: 1.25rem;
		font-weight: bold;
	}
	.game-card-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 8px 14px 12px;
	}
	.chip {
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 0.2rem;
		padding: 2px 8px;
		font-size: 0.72rem;
		color: #d1d5db;
	}
	.chip-accent {
		color: #1b9be8;
		border-color: rgba(27, 155, 232, 0.6);
	}
	.game-card-ach {
		margin: 0 14px 14px;
		font-size: 0.85rem;
		white-space: nowrap;
	}
	.ach-track {
		color: #00ff00;
		letter-spacing: 1px;
	}
	.ach-count {
		margin-left: 8px;
		color: #d1d5db;
	}
</style>
