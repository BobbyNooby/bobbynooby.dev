<script lang="ts">
	import type { discordStatuses } from '$lib/discord/discordTypes';
	import { getDiscordStatus } from '$lib/discord/discordUtils';
	import { onMount } from 'svelte';

	let { initialDiscordStatus }: { initialDiscordStatus: discordStatuses } = $props();

	const colors: Record<discordStatuses, string> = {
		online: '#23A55A',
		idle: '#F0B232',
		dnd: '#F23F43',
		offline: '#80848E',
		unknown: '#80848E'
	};

	let discordStatus: discordStatuses = $state(initialDiscordStatus || 'offline');

	onMount(async () => {
		discordStatus = await getDiscordStatus();

		window.addEventListener('focus', async () => {
			discordStatus = await getDiscordStatus();
		});
	});

	setInterval(async () => {
		discordStatus = await getDiscordStatus();
	}, 5000);
</script>

<p class="font-cascadia-code text-white" style="color: {colors[discordStatus]};">
	{`${discordStatus}.sh`}
</p>
