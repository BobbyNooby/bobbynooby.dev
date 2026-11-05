<script lang="ts">
	import Os from '$lib/components/os/Os.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Os links={data.links} projects={data.projects} grid={data.threeByThree} />
