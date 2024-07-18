<script lang="ts">
	import ThreeByThree from '$lib/components/ThreeByThree.svelte';
	import type { Anime, Manga } from '$lib/types/aniListMedia';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	let mangaList: Manga[] = data.manga;
</script>

<p><ThreeByThree list={mangaList}></ThreeByThree></p>
