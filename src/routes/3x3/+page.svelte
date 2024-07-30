<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import ThreeByThreeListsButton from '$lib/components/ThreeByThreeListsButton.svelte';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

{#if !$navigating}
	<div class="items-center justify-center text-center">
		<p class=" font-cascadia-code text-9xl mb-20">3x3</p>
		<div class="flex flex-row space-x-5 space-y-2 mb-20">
			{#each data.categories as category}
				<ThreeByThreeListsButton {category} />
			{/each}
		</div>
		<GenericButton text={'Back'} inputFunction={() => goto('/')} extraClasses={'text-xl'}
		></GenericButton>
	</div>
{/if}
