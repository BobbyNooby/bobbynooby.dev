<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let sessionTime: number = 0;
	const maxSessionTime: number = 180;
	const gracePeriod: number = 30;
	let isAFK: boolean = false;

	onMount(() => {
		window.addEventListener('mousemove', () => {
			sessionTime = 0;
			isAFK = false;
		});
		window.addEventListener('keydown', () => {
			sessionTime = 0;
			isAFK = false;
		});
	});

	onMount(() => {
		if (window.location.pathname === '/') {
			sessionTime = 0;
		}
		const idleInterval = setInterval(() => {
			if (window.location.pathname === '/') {
				sessionTime += 1;
				if (sessionTime > maxSessionTime) {
					isAFK = true;
				}
				if (isAFK && sessionTime > maxSessionTime + gracePeriod) {
					isAFK = false;
					goto('/afk'); // Redirect to the AFK page
				}
			}
		}, 1000);

		return () => {
			clearInterval(idleInterval);
		};
	});
</script>

<div style="width: 100vw; height: 100vh;" class=" fixed z-0">
	{#if isAFK}
		<div
			class="w-1/2 h-1/2 bg-black border border-white z-30 fixed items-center flex text-center justify-center p-20 text-3xl"
			style="top: 25%; left: 25%;"
		>
			<p class="text-white font-josefin-sans-400">
				The system has detected that you are AFK. This website runs on a free plan and is constantly
				making API requests. In order to curb excess API / Network / Bandwith usage, you will be
				redirected to an AFK page in <span style="color: #FF0000;"
					>{maxSessionTime + gracePeriod - sessionTime}</span
				> seconds.
			</p>
		</div>
	{/if}
</div>
