<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';
	import { fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import ThreeByThree from '$lib/components/3x3/ThreeByThree.svelte';

	let { data }: { data: PageServerData } = $props();

	const mediaList = data.mediaList;

	let ready = $state(false);

	onMount(() => {
		ready = true;
	});
</script>

{#if !navigating.complete}
	{#if ready}
		<div class="backbutton" in:fade={{ duration: 1000, easing: cubicInOut }}>
			<GenericButton text={'Back'} inputFunction={() => goto('/3x3')}></GenericButton>
		</div>
	{/if}
	{#if mediaList != null}
		<p><ThreeByThree {mediaList}></ThreeByThree></p>
	{:else}
		<p class="font-fancy mx-40 mb-10 text-center text-5xl">
			My deepest condolences fellow user. It appears that I lack the information required to display
			a three by three of the category "{data.category}". As compensation, I have prepared a second
			episode of a fabulous piece of Japanese media called "Azumanga Daioh" for your viewing
			pleasure. Please do enjoy yourself.
		</p>
	{/if}
{/if}

<style>
	.backbutton {
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 1;
		display: flex;
	}
</style>
