<script lang="ts">
	import { safeHref } from '$lib/bsh/format';
	import type { BshLink } from '$lib/bsh/types';
	import Pane from '../Pane.svelte';

	let { links }: { links: BshLink[] } = $props();
</script>

<Pane pane="links" title="/Links" label="Links" program="ls ~/links">
	<div class="links">
		<!-- Labels can repeat, and a repeated each key throws. -->
		{#each links as link, i (i)}
			{#if safeHref(link.href)}
				<a
					href={safeHref(link.href)}
					target="_blank"
					rel="noopener noreferrer"
					style:color={link.color}>/{link.label}</a
				>
			{/if}
		{/each}
	</div>
</Pane>
