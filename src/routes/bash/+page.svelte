<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';
	import { SignIn } from '@auth/sveltekit/components';
	import { page } from '$app/stores';
</script>

<body class="w-screen h-screen bg-black p-10 overflow-hidden">
	<Terminal />
</body>
