<script lang="ts">
	import ThreeByThree from '$lib/components/ThreeByThree.svelte';
	import type { Anime, Manga } from '$lib/types/aniListMedia';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	let animeList: Anime[] = data.anime;
	console.log(animeList);
</script>

<p><ThreeByThree list={animeList}></ThreeByThree></p>
