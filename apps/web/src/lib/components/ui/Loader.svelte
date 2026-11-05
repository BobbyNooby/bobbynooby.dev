<script>
	import { navigating } from '$app/state';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
</script>

{#if navigating.complete}
	<div
		class="loader"
		in:fade={{ duration: 100, easing: cubicInOut }}
		out:fade={{ duration: 100, easing: cubicInOut }}
	>
		<img
			in:fade={{ duration: 100, easing: cubicInOut }}
			out:fade={{ duration: 100, easing: cubicInOut }}
			class="aspect-square w-1/2"
			src="/spinninglogo.gif"
			alt="logo"
		/>
	</div>
{/if}

<style>
	.loader {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}
</style>
