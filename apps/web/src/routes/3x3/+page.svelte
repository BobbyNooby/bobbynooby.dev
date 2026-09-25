<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import ThreeByThreeListsButton from '$lib/components/3x3/ThreeByThreeListsButton.svelte';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

{#if !navigating.complete}
	<div class="items-center justify-center text-center">
		<p class=" font-cascadia-code mb-20 text-9xl">3x3</p>
		<div class="mb-20 flex flex-row space-y-2 space-x-5">
			{#each data.routes as category}
				<ThreeByThreeListsButton {category} />
			{/each}
		</div>
		<GenericButton text={'Back'} inputFunction={() => goto('/')} extraClasses={'text-xl'}
		></GenericButton>
	</div>
{/if}
