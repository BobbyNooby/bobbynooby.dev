<script lang="ts">
	import type { Link } from '$lib/db/mongoTypes';
	import { onMount } from 'svelte';
	import { cubicIn, cubicInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let { links }: { links: Link[] } = $props();

	let ready = $state(false);

	const baseDelay = 400;

	onMount(() => {
		ready = true;
	});
</script>

<p
	in:fly={{ delay: baseDelay, x: 100, duration: 500, easing: cubicInOut }}
	class="container-title-text"
>
	/Links
</p>
<div class="flex flex-col">
	{#each links as link, i}
		{#if ready}
			<div style="color: {link.color};" class="link">
				<p
					in:fly={{ x: 100, delay: baseDelay + i * 50, duration: 500, easing: cubicIn }}
					style="text-indent: 2em"
				>
					<a href={link.href}>/{link.label}</a>
				</p>
			</div>
		{/if}
	{/each}
</div>

<style>
	.link {
		display: inline-block;
		transition: transform 0.1s ease-in-out;
	}

	.link:hover {
		transform: translateX(10px);
	}
</style>
