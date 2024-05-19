<script lang="ts">
	import '../app.css';
</script>

<section class=" overflow-auto app">
	<main><slot /></main>
</section>

<style>
	.app {
		display: flex;
		background-color: black;
		width: 100%;
		flex-direction: column;
		min-height: 100vh;
	}
</style>
