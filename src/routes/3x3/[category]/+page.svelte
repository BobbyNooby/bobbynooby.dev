<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import ThreeByThree from '$lib/components/ThreeByThree.svelte';
	import type { GeneralMedia } from '$lib/types/3x3/GeneralMedia';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	export let data: { mediaList: GeneralMedia[] | null; category: string };
	let mediaList: GeneralMedia[] = data.mediaList;

	let ready = false;

	onMount(() => {
		ready = true;
	});
</script>

{#if !$navigating}
	{#if ready}
		<div class="backbutton" in:fade={{ duration: 1000, easing: cubicInOut }}>
			<GenericButton text={'Back'} inputFunction={() => goto('/3x3')}></GenericButton>
		</div>
	{/if}
{/if}
{#if mediaList != null}
	<p><ThreeByThree {mediaList}></ThreeByThree></p>
{:else}
	<p class="text-center mx-40 mb-10 font-fancy text-5xl">
		My deepest condolences fellow user. It appears that I lack the information required to display a
		three by three of the category "{data.category}". As compensation, I have prepared a second
		episode of a fabulous piece of Japanese media called "Azumanga Daioh" for your viewing pleasure.
		Please do enjoy yourself.
	</p>
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
