<script lang="ts">
	import '../app.css';
</script>

<section class=" overflow-auto app">
	<main><slot /></main>
</section>

<style>
	@import url('https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/cascadia-code.min.css');

	.app {
		display: flex;
		width: 100%;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
