<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SteamGameSummary } from '$lib/steam/steamTypes';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { SvelteSet } from 'svelte/reactivity';

	let {
		games,
		lastRefresh,
		hidden,
		notify
	}: {
		games: SteamGameSummary[];
		lastRefresh: string | null;
		hidden: SvelteSet<number>;
		notify: (text: string, options?: { bad?: boolean }) => void;
	} = $props();

	let filter = $state('');
	let show = $state<'all' | 'shown' | 'hidden'>('all');
	let refreshing = $state(false);

	const visible = $derived(
		games.filter((game) => {
			if (filter && !game.name.toLowerCase().includes(filter.toLowerCase())) return false;
			if (show === 'shown') return !hidden.has(game.appid);
			if (show === 'hidden') return hidden.has(game.appid);
			return true;
		})
	);
	const refreshed = $derived(lastRefresh ? new Date(lastRefresh).toLocaleString('en-GB') : 'never');

	// Hiding saves on the spot (its own action), so flip it locally and undo on failure.
	const toggle: SubmitFunction = ({ formData }) => {
		const appid = Number(formData.get('appid'));
		const name = games.find((g) => g.appid === appid)?.name ?? 'game';
		const hide = !hidden.has(appid);
		if (hide) hidden.add(appid);
		else hidden.delete(appid);
		return async ({ result }) => {
			if (result.type === 'success') {
				notify(`${name} ${hide ? 'hidden from' : 'back on'} /Games · saved`);
				return;
			}
			if (hide) hidden.delete(appid);
			else hidden.add(appid);
			notify('could not update the hidden games', { bad: true });
		};
	};

	const refresh: SubmitFunction = () => {
		refreshing = true;
		return async ({ result, update }) => {
			refreshing = false;
			if (result.type === 'success') {
				await update();
				notify('steam cache refreshed');
			} else {
				notify('steam cache refresh failed', { bad: true });
			}
		};
	};
</script>

<section class="pane on">
	<div class="ph">
		<h2>/Steam</h2>
		<span>saves instantly</span>
	</div>
	<div class="pbody">
		<p class="hint">
			{games.length} games cached · {hidden.size} hidden · refreshed {refreshed} · zero-hour games never
			show
		</p>
		<div class="cz-stools">
			<input class="in" placeholder="filter games…" bind:value={filter} aria-label="Filter games" />
			{#each ['all', 'shown', 'hidden'] as const as key (key)}
				<button type="button" class="chip" aria-pressed={show === key} onclick={() => (show = key)}
					>{key}</button
				>
			{/each}
			<form method="POST" action="?/refreshSteam" use:enhance={refresh}>
				<button type="submit" class="btn" disabled={refreshing}
					>{refreshing ? 'refreshing…' : 'refresh cache'}</button
				>
			</form>
		</div>
		<form method="POST" action="?/toggleGame" use:enhance={toggle}>
			<ul class="cz-games">
				{#each visible as game (game.appid)}
					{@const off = hidden.has(game.appid)}
					<li class="cz-game" class:off>
						{#if game.icon}<img src={game.icon} alt="" loading="lazy" />{:else}<span></span>{/if}
						<span class="nm">{game.name}</span>
						<span class="hr">{game.hours.toLocaleString('en-US')}h</span>
						<button
							type="submit"
							name="appid"
							value={game.appid}
							class="cz-eye"
							aria-pressed={!off}
							aria-label="{off ? 'Show' : 'Hide'} {game.name}">{off ? '⊘' : '👁'}</button
						>
					</li>
				{/each}
			</ul>
		</form>
	</div>
</section>
