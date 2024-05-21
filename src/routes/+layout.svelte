<script lang="ts">
	import AfkChecker from '$lib/components/AFKChecker.svelte';
	import '../app.css';
</script>

<section class="overflow-auto app items-center">
	<main><slot /><AfkChecker /></main>
</section>

<style>
	.app {
		z-index: 10;
		display: flex;
		background-color: black;
		width: 100%;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
