<script lang="ts">
	import AfkChecker from '$lib/components/AFKChecker.svelte';
	import '../app.css';
</script>

<head>
	<!-- Primary Meta Tags -->
	<title>{'>bobbynooby.dev'}</title>
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
</head>

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
