<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex h-screen flex-col justify-center text-center">
	<p class="font-quicksand-300 text-9xl text-white">{$page.status}</p>
	<p class="font-quicksand-300 text-3xl text-white">{$page.error?.message}</p>
</div>
