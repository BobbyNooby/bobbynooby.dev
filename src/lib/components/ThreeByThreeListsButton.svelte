<script lang="ts">
	import { goto } from '$app/navigation';

	export let category: string;
</script>

<button
	class=" cormorant-garamond-semibold text-6xl text-yellow-300"
	on:click={() => {
		goto('/3x3/' + category.toLowerCase());
	}}>{category}</button
>

<style>
	button {
		transition: 0.1s ease-in-out;
	}

	button:hover {
		transform: scale(1.1);
	}
</style>
