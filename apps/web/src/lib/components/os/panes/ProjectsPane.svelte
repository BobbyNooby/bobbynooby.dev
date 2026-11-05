<script lang="ts">
	import { safeHref } from '$lib/bsh/format';
	import { fileNames } from '$lib/bsh/slug';
	import type { BshProject } from '$lib/bsh/types';
	import Pane from '../Pane.svelte';

	let { projects }: { projects: BshProject[] } = $props();

	let names = $derived(
		fileNames(
			projects.map((p) => p.title),
			'projects',
			'.txt'
		)
	);
</script>

<Pane pane="projects" title="/Projects" label="Projects" program="ls -la ~/projects">
	<div class="ls">
		{#each projects as project, i (names[i])}
			<span class="perm">-rw-r--r--</span>
			{#if safeHref(project.href)}
				<a href={safeHref(project.href)} target="_blank" rel="noopener noreferrer">{names[i]}</a>
			{:else}
				<span class="y">{names[i]}</span>
			{/if}
			<span class="desc">{project.description}</span>
		{/each}
		<span class="perm">drw-------</span>
		<span class="dim">.secrets/</span>
		<span class="desc dim">try cd-ing in here from the shell</span>
	</div>
</Pane>
