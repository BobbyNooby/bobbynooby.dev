<script lang="ts">
	import { onMount } from 'svelte';
	import type { SteamGameDetails, SteamGameSummary } from '$lib/steam/steamTypes';
	import { getSteamGamesState, startSteamGames } from '$lib/steam/steamGames.svelte';

	let games = $derived(getSteamGamesState());
	let selected = $state<{ summary: SteamGameSummary; details: SteamGameDetails | null } | null>(
		null
	);
	let loadingDetails = $state(false);

	const fmtHours = (h: number) => `${h.toLocaleString('en-US')}h`;
	const fmtPlayed = (ts: number | null) =>
		ts ? new Date(ts * 1000).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '';

	async function open(summary: SteamGameSummary) {
		selected = { summary, details: null };
		loadingDetails = true;
		try {
			const res = await fetch(`/api/steam/game/${summary.appid}`);
			const body = (await res.json()) as { details: SteamGameDetails | null };
			selected = { summary, details: body.details };
		} catch {
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
		<div class="game-card" role="dialog" aria-label={selected.summary.name}>
			<button class="game-card-close" onclick={() => (selected = null)}>×</button>
			<img
				src={selected.details?.headerImage ?? selected.summary.capsule}
				alt={selected.summary.name}
				class="game-card-img"
			/>
			<h3 class="game-card-title">{selected.summary.name}</h3>
			<p class="game-card-meta">
				{fmtHours(selected.summary.hours)}
				{#if selected.summary.lastPlayed}· last played {fmtPlayed(selected.summary.lastPlayed)}{/if}
				{#if selected.details?.releaseDate}· {selected.details.releaseDate}{/if}
			</p>
			{#if selected.details?.genres.length}
				<p class="game-card-genres">{selected.details.genres.join(' · ')}</p>
			{/if}
			{#if loadingDetails}
				<p class="game-card-desc text-gray-400">loading…</p>
			{:else if selected.details?.description}
				<div class="game-card-desc">{@html selected.details.description}</div>
			{/if}
			{#if selected.details}
				<p class="game-card-ach">
					🏆 {selected.details.achievements.unlocked}/{selected.details.achievements.total}
				</p>
			{/if}
		</div>
	{/if}
	<div class="content-box">
		<p class="container-title-text text-[#1b9be8]">/Games</p>
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
	</div>
{/if}

<style>
	.carousel-viewport {
		overflow: hidden;
		margin-top: 8px;
	}
	.capsule {
		position: relative;
		flex: 0 0 auto;
		width: 120px;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 0.2rem;
		padding: 0;
		background: none;
		cursor: pointer;
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
	}
	@media (prefers-reduced-motion: reduce) {
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
		width: min(480px, 90vw);
		max-height: 85vh;
		overflow-y: auto;
		background: black;
		border: 2px solid white;
		border-radius: 0.2rem;
		padding: 14px;
		color: white;
		font-family: 'Cascadia Code';
	}
	.game-card-close {
		position: absolute;
		top: 6px;
		right: 10px;
		font-size: 1.25rem;
		color: white;
		background: none;
		border: none;
		cursor: pointer;
	}
	.game-card-img {
		width: 100%;
		border-radius: 0.2rem;
	}
	.game-card-title {
		margin-top: 8px;
		font-size: 1.25rem;
		font-weight: bold;
	}
	.game-card-meta,
	.game-card-genres {
		font-size: 0.8rem;
		color: #9ca3af;
	}
	.game-card-desc {
		margin-top: 8px;
		font-size: 0.85rem;
		line-height: 1.4;
	}
	.game-card-ach {
		margin-top: 8px;
		font-size: 0.9rem;
	}
</style>
