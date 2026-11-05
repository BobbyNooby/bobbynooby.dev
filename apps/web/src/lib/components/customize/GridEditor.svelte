<script lang="ts">
	import type { CustomizeState } from '$lib/admin/customize.svelte';
	import { entryIssues, idFromInput } from '$lib/admin/schemas';
	import { toTen } from '$lib/admin/score';
	import { sortable } from '$lib/admin/sortable';
	import { dragOptions } from './reorder';
	import { getGreenRedColorFromScore } from '$lib/utils/getGreenRedColorFromScore';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import ScoreInput from './ScoreInput.svelte';

	let {
		cz,
		covers
	}: { cz: CustomizeState; covers: Record<string, { cover: string; title: string }> } = $props();

	let cat = $state(cz.grid.groups[0]?.label ?? '');
	let selected = $state<number | null>(null);

	const group = $derived(cz.grid.group(cat));
	const entries = $derived(group?.entries.items ?? []);
	// Falls back to the first tile when the selection was deleted or the list changed.
	const entry = $derived(entries.find((e) => e.uid === selected) ?? entries[0]);
	const index = $derived(entry ? entries.indexOf(entry) : -1);
	const cover = $derived(entry ? covers[String(entry.id)] : undefined);
	const bad = $derived(entry ? entryIssues(entry) : new Set<string>());

	function pickCategory(label: string) {
		cat = label;
		selected = null;
	}

	function add() {
		const uid = cz.grid.createNew(cat);
		if (uid != null) selected = uid;
	}

	function move(to: number) {
		if (group && entry) cz.move(group.entries, index, to);
	}

	function setId(text: string) {
		if (entry) entry.id = idFromInput(text);
	}
</script>

<section class="pane on">
	<div class="ph">
		<h2>/3x3</h2>
		<span>vim 3x3/{cat.toLowerCase()}.json</span>
	</div>
	<div class="pbody">
		<div class="cz-gtools">
			{#each cz.grid.groups as g (g.label)}
				<button
					type="button"
					class="chip"
					aria-pressed={g.label === cat}
					onclick={() => pickCategory(g.label)}>{g.label.toLowerCase()}</button
				>
			{/each}
			<button type="button" class="chip add" onclick={add}>+ add entry</button>
		</div>
		<p class="hint">
			drag tiles to reorder · click one to edit · only the first 9 show on the site
		</p>
		<div class="cz-g3">
			{#key cat}
				{#if group}
					<div
						class="cz-grid"
						use:sortable={dragOptions(cz, group.entries, {
							item: '.cz-tile',
							handle: '.cz-tgrip',
							mouseAnywhere: true
						})}
					>
						{#each entries as e, i (e.uid)}
							{@const c = covers[String(e.id)]}
							<button
								type="button"
								class="cz-tile"
								class:sel={e.uid === entry?.uid}
								class:bad={entryIssues(e).size > 0}
								class:extra={i >= 9}
								class:flash={cz.flashUid === e.uid}
								data-uid={e.uid}
								aria-pressed={e.uid === entry?.uid}
								title={i >= 9 ? 'only the first 9 show on the site' : e.label}
								onclick={() => (selected = e.uid)}
								animate:flip={{ duration: cz.dragUid === e.uid ? 0 : 260, easing: cubicOut }}
								in:scale={{ start: 0.9, duration: 200 }}
								out:scale={{ start: 0.9, duration: 160 }}
							>
								{#if c}<img src={c.cover} alt="" loading="lazy" />{/if}
								<span class="sc" style:color={getGreenRedColorFromScore(e.bobscore * 100)}
									>{toTen(e.bobscore)}</span
								>
								<span class="cap">{e.label}</span>
								<span class="cz-tgrip" aria-hidden="true">⠿</span>
							</button>
						{/each}
					</div>
				{/if}
			{/key}

			{#if entry && group}
				<div class="cz-editor">
					{#if cover}
						<!-- A fresh img per entry, so the last pick's cover never shows while this one loads. -->
						{#key entry.uid}<img class="cz-cover" src={cover.cover} alt="" />{/key}
					{:else}
						<div class="cz-cover"></div>
					{/if}
					<div>
						<h3>{cover?.title ?? entry.label}</h3>
						<p class="hint">
							{cover ? `anilist #${entry.id}` : 'the cover and title show up after you save'}
						</p>
						<div class="cz-efields">
							<label class="cz-field">
								<span>anilist id</span>
								<input
									class="in"
									class:bad={bad.has('id')}
									inputmode="numeric"
									value={entry.id}
									oninput={(e) => setId(e.currentTarget.value)}
								/>
							</label>
							<label class="cz-field">
								<span>label (on the tile)</span>
								<input class="in" class:bad={bad.has('label')} bind:value={entry.label} />
							</label>
							<div class="cz-field">
								<span>score /10</span>
								{#key entry.uid}
									<ScoreInput bind:value={entry.bobscore} bad={bad.has('bobscore')} />
								{/key}
							</div>
							<div class="cz-eacts">
								<button
									type="button"
									class="btn"
									disabled={index <= 0}
									onclick={() => move(index - 1)}>◀ earlier</button
								>
								<button
									type="button"
									class="btn"
									disabled={index >= entries.length - 1}
									onclick={() => move(index + 1)}>later ▶</button
								>
								<button
									type="button"
									class="btn"
									onclick={() => cz.remove(group.entries, entry.uid, entry.label || 'entry')}
									>remove</button
								>
							</div>
							<label class="cz-field full">
								<span>review</span>
								<textarea class="in" rows="5" placeholder="no review yet" bind:value={entry.review}
								></textarea>
							</label>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
