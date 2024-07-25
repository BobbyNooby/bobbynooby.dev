<script lang="ts">
	import ThreeByThree from '$lib/components/ThreeByThree.svelte';
	import type { GeneralMedia } from '$lib/types/3x3/GeneralMedia';
	import { staticFilesUrl } from '$lib/utils/staticContentDirectory';

	export let data: { mediaList: GeneralMedia[] | null; category: string };
	let mediaList: GeneralMedia[] = data.mediaList;
</script>

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
