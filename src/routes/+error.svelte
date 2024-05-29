<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="text-center flex flex-col justify-center h-screen">
	<p class="text-white font-quicksand-300 text-9xl">{$page.status}</p>
	<p class="text-white font-quicksand-300 text-3xl">{$page.error?.message}</p>
</div>
