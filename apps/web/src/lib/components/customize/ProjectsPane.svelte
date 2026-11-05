<script lang="ts">
	import type { CustomizeState } from '$lib/admin/customize.svelte';
	import { issues, projectSchema } from '$lib/admin/schemas';
	import { sortable } from '$lib/admin/sortable';
	import { flushSync } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { SvelteSet } from 'svelte/reactivity';
	import { fly, scale, slide } from 'svelte/transition';

	let { cz }: { cz: CustomizeState } = $props();

	// Rows the user opened; a row with a problem also stays open so the red field shows.
	const opened = new SvelteSet<number>();
	const short = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '');

	function toggle(uid: number) {
		if (opened.has(uid)) opened.delete(uid);
		else opened.add(uid);
	}

	function moveKeepingFocus(event: MouseEvent, from: number, to: number) {
		const button = event.currentTarget as HTMLButtonElement;
		flushSync(() => cz.move(cz.projects, from, to));
		button.focus();
	}

	function add() {
		const uid = cz.projects.createNew({
			title: 'New project',
			description: '',
			href: 'https://github.com/BobbyNooby/'
		});
		opened.add(uid);
	}
</script>

<section class="pane on">
	<div class="ph">
		<h2>/Projects</h2>
		<span>vim projects.json · {cz.projects.items.length}</span>
	</div>
	<div class="pbody">
		<p class="hint">click a project to edit it · drag ⠿ to reorder</p>
		<ul
			class="cz-rows"
			use:sortable={{
				item: '.cz-row',
				handle: '.cz-grip',
				onmove: (from, to) => cz.projects.swapOrder(from, to),
				onstart: (uid) => (cz.dragUid = uid),
				ondrop: (uid) => {
					cz.dragUid = null;
					cz.flash(uid);
				}
			}}
		>
			{#each cz.projects.items as project, i (project.uid)}
				{@const bad = issues(projectSchema, project)}
				{@const open = opened.has(project.uid) || bad.size > 0}
				<li
					class="cz-row cz-project"
					class:flash={cz.flashUid === project.uid}
					data-uid={project.uid}
					animate:flip={{ duration: cz.dragUid === project.uid ? 0 : 240, easing: cubicOut }}
					in:scale={{ start: 0.96, duration: 200 }}
					out:fly={{ x: 18, duration: 160 }}
				>
					<span class="cz-grip" title="drag to reorder" aria-hidden="true">⠿</span>
					<button
						type="button"
						class="cz-sum"
						aria-expanded={open}
						onclick={() => toggle(project.uid)}
					>
						<span class="t">{project.title || 'untitled'}</span>
						<span class="u">{short(project.href)}</span>
						<span class="caret">{open ? '▾ close' : '▸ edit'}</span>
					</button>
					<div class="cz-acts">
						<button
							type="button"
							class="cz-ib mv"
							disabled={i === 0}
							onclick={(e) => moveKeepingFocus(e, i, i - 1)}
							aria-label="Move {project.title} up">↑</button
						>
						<button
							type="button"
							class="cz-ib mv"
							disabled={i === cz.projects.items.length - 1}
							onclick={(e) => moveKeepingFocus(e, i, i + 1)}
							aria-label="Move {project.title} down">↓</button
						>
						<button
							type="button"
							class="cz-ib del"
							onclick={() => cz.remove(cz.projects, project.uid, project.title || 'project')}
							aria-label="Delete {project.title}">✕</button
						>
					</div>
					{#if open}
						<div class="cz-ed" transition:slide={{ duration: 180 }}>
							<label class="cz-field">
								<span>title</span>
								<input class="in" class:bad={bad.has('title')} bind:value={project.title} />
							</label>
							<label class="cz-field">
								<span>link</span>
								<input
									class="in"
									class:bad={bad.has('href')}
									bind:value={project.href}
									title="starts with https:// or /"
								/>
							</label>
							<label class="cz-field full">
								<span>description</span>
								<textarea class="in" rows="3" bind:value={project.description}></textarea>
							</label>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		<button type="button" class="chip add cz-add" onclick={add}>+ new project</button>
	</div>
</section>
