<script lang="ts">
	import Loader from '$lib/components/widgets/Loader.svelte';
	import { Toaster } from 'svelte-french-toast';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{'>bobbynooby.dev'}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<!-- Add viewport meta tag -->

	<meta name="title" content="bobbynooby.dev" />
	<meta name="description" content="" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bobbynooby.dev/" />
	<meta property="og:title" content=">bobbynooby.dev" />
	<meta property="og:description" content="" />
	<meta
		property="og:image"
		content="https://raw.githubusercontent.com/BobbyNooby/bobbynooby.dev/master/static/logonotransparent.jpg"
	/>

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://bobbynooby.dev/" />
	<meta property="twitter:title" content=">bobbynooby.dev" />
	<meta property="twitter:description" content="" />
	<meta
		property="twitter:image"
		content="https://raw.githubusercontent.com/BobbyNooby/bobbynooby.dev/master/static/logonotransparent.jpg"
	/>

	<!-- Meta Tags Generated with https://metatags.io -->
</svelte:head>

<Toaster
	toastOptions={{
		duration: 5000,
		style: 'background-color: black; border-width : 0.2rem; border-color: white; color:white;'
	}}
/>
<main class="main-content font-cascadia-code items-center">{@render children()}<Loader /></main>

<style>
	.main-content {
		display: flex;
		background-color: black;
		width: 100%;
		justify-content: center;
		flex-direction: column;
		min-height: 100vh;
		color: white;
		overflow: auto;
		overflow-x: scroll;
		overflow-y: auto;
	}
</style>
