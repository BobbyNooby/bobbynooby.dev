<script lang="ts">
	import type { GeneralMedia } from '$lib/media/mediaTypes';
	import { getGreenRedColorFromScore } from '$lib/utils/getGreenRedColorFromScore';

	export let media: GeneralMedia, css: { outer: string; inner: string };
	function openLink(url: string) {
		window.open(url, '_blank');
	}
</script>

<div class="box flex flex-row rounded-lg border border-white">
	<div class="mr-8 flex flex-col">
		<button onclick={() => openLink(media.url)}>
			<div
				class=" cover-art-container rounded-lg"
				style="border-color: {media.color}; background-color: {media.coverImageURL}; {css}"
			>
				<img
					class="h-full w-full rounded-lg"
					src={media.coverImageURL}
					alt={media.titles[0].value}
				/>
			</div>
		</button>

		<!-- Details -->
		<div class="mt-5">
			{#each media.details as detail}
				<p>
					{detail.category.value} :
					<span style="color: {detail.text.color}">{detail.text.value}</span>
				</p>
			{/each}
		</div>

		<!-- Genre -->
		<div class="mt-5 text-center">
			{#each media.genres as genre}
				<p style="color : {media.color}">{genre}</p>
			{/each}
		</div>
	</div>
	<div class="flex flex-col">
		<!-- Titles -->
		<div class="mb-10 space-y-2">
			{#each media.titles as title, i}
				<p class={i == 0 ? 'text-6xl' : ''} style="color: {title.color};">{title.value}</p>
			{/each}
		</div>

		<!-- Description -->
		<div>
			<p>{@html media.description}</p>
		</div>

		<!-- BobStats -->
		<div class=" mt-5 space-y-4">
			<p class="text-5xl">BobStats™</p>
			<p style="color: {getGreenRedColorFromScore(media.bobStats.score * 100)};">
				Score : {media.bobStats.score * 10}
			</p>
			<p>{media.bobStats.review}</p>
		</div>
	</div>
</div>

<style>
	.box {
		width: 80rem;
		background-color: black;
		padding: 2rem;
		z-index: 30;
		border-width: 0.2rem;
	}
	.cover-art-container {
		height: 22rem;
		width: 16rem;

		border-width: 0.3rem;
	}

	p {
		font-family: 'Cascadia Code';
	}
</style>
