<script lang="ts">
	import type { PaneKey } from '$lib/bsh/types';
	import { useOs } from '$lib/os/os.svelte';
	import type { Snippet } from 'svelte';

	let {
		pane,
		title,
		label,
		program,
		extra = '',
		badge,
		children
	}: {
		pane: PaneKey;
		title: string;
		label: string;
		program?: Snippet | string;
		extra?: string;
		badge?: Snippet;
		children: Snippet;
	} = $props();

	const { os } = useOs();
</script>

<section
	class="pane {extra}"
	class:on={os.focused === pane}
	data-pane={pane}
	aria-label={label}
	onpointerdown={() => os.focused !== pane && os.focus(pane)}
	onfocusin={() => os.focused !== pane && os.focus(pane)}
>
	<div class="ph">
		<h2>{title}{@render badge?.()}</h2>
		{#if typeof program === 'string'}
			<span>{program}</span>
		{:else if program}
			<span>{@render program()}</span>
		{/if}
	</div>
	{@render children()}
</section>
