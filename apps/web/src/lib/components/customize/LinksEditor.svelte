<script lang="ts">
	import { swatchValue } from '$lib/admin/color';
	import type { CustomizeState } from '$lib/admin/customize.svelte';
	import { issues, linkSchema } from '$lib/admin/schemas';
	import { sortable } from '$lib/admin/sortable';
	import { dragOptions, moveKeepingFocus } from './reorder';
	import { flushSync } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fly, scale } from 'svelte/transition';

	let { cz }: { cz: CustomizeState } = $props();

	// The picker's value is set from script, not server-rendered: hydration
	// briefly clears a rendered value, and Chrome warns about every one.
	function swatch(node: HTMLInputElement, color: string) {
		node.value = swatchValue(color);
		return { update: (next: string) => (node.value = swatchValue(next)) };
	}

	function add() {
		const uid = cz.links.createNew({ label: 'New_Link', href: 'https://', color: '#FFFFFF' });
		flushSync();
		document.querySelector<HTMLInputElement>(`[data-uid="${uid}"] .cz-label`)?.select();
	}
</script>

<section class="pane on">
	<div class="ph">
		<h2>/Links</h2>
		<span>vim links.json · {cz.links.items.length}</span>
	</div>
	<div class="pbody">
		<p class="hint">drag ⠿ to reorder · the swatch opens a colour picker</p>
		<ul class="cz-rows" use:sortable={dragOptions(cz, cz.links)}>
			{#each cz.links.items as link, i (link.uid)}
				{@const bad = issues(linkSchema, link)}
				<li
					class="cz-row cz-link"
					class:flash={cz.flashUid === link.uid}
					data-uid={link.uid}
					animate:flip={{ duration: cz.dragUid === link.uid ? 0 : 240, easing: cubicOut }}
					in:scale={{ start: 0.96, duration: 200 }}
					out:fly={{ x: 18, duration: 160 }}
				>
					<span class="cz-grip" title="drag to reorder" aria-hidden="true">⠿</span>
					<input
						type="color"
						class="cz-swatch"
						use:swatch={link.color}
						oninput={(e) => (link.color = e.currentTarget.value.toUpperCase())}
						aria-label="Pick a colour for {link.label}"
					/>
					<input
						class="in cz-hex"
						class:bad={bad.has('color')}
						bind:value={link.color}
						aria-label="Colour of {link.label}"
					/>
					<input
						class="in cz-label"
						class:bad={bad.has('label')}
						style:color={link.color}
						bind:value={link.label}
						aria-label="Label"
					/>
					<input
						class="in cz-href"
						class:bad={bad.has('href')}
						bind:value={link.href}
						title="a full https:// link"
						aria-label="Link for {link.label}"
					/>
					<div class="cz-acts">
						<button
							type="button"
							class="cz-ib mv"
							disabled={i === 0}
							onclick={(e) => moveKeepingFocus(cz, cz.links, e, i, i - 1)}
							aria-label="Move {link.label} up">↑</button
						>
						<button
							type="button"
							class="cz-ib mv"
							disabled={i === cz.links.items.length - 1}
							onclick={(e) => moveKeepingFocus(cz, cz.links, e, i, i + 1)}
							aria-label="Move {link.label} down">↓</button
						>
						<button
							type="button"
							class="cz-ib del"
							onclick={() => cz.remove(cz.links, link.uid, link.label || 'link')}
							aria-label="Delete {link.label}">✕</button
						>
					</div>
				</li>
			{/each}
		</ul>
		<button type="button" class="chip add cz-add" onclick={add}>+ new link</button>
	</div>
</section>
