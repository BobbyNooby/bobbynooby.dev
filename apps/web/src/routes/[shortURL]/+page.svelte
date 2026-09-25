<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageServerData } = $props();

	const maxDots = 4;
	let changingDotCount = $state(0);

	onMount(() => {
		if (data.success) {
			window.open(data.longURL, '_self');
		} else {
			window.open('https://bobbynooby.dev', '_self');
		}
	});

	setInterval(() => {
		changingDotCount = (changingDotCount + 1) % (maxDots + 1);
	}, 500);
</script>

{#if !data.success}
	<p class="text-xl">Invalid Short URL</p>
{/if}
<p class="text-2xl">
	Redirecting to {data.success ? data.longURL : 'https://bobbynooby.dev'}{'.'.repeat(
		changingDotCount
	)}
</p>
