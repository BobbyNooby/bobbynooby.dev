<script lang="ts">
	import AfkChecker from '$lib/components/AFKChecker.svelte';
	import { Toaster } from 'svelte-french-toast';
	import '../app.css';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { cubicIn, cubicInOut } from 'svelte/easing';
</script>

<head>
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
</head>

<Toaster
	toastOptions={{
		duration: 5000,
		style: 'background-color: black; border-width : 0.2rem; border-color: white; color:white;'
	}}
/>
<section class="app md:items-center">
	<main><slot /><AfkChecker /></main>
	{#if $navigating}
		<div
			class="loader"
			in:fade={{ duration: 100, easing: cubicInOut }}
			out:fade={{ duration: 100, easing: cubicInOut }}
		>
			<img
				in:fade={{ duration: 100, easing: cubicInOut }}
				out:fade={{ duration: 100, easing: cubicInOut }}
				class="w-1/2 aspect-square"
				src="/spinninglogo.gif"
				alt="logo"
			/>
		</div>
	{/if}
</section>

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

	.app {
		z-index: 10;
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
