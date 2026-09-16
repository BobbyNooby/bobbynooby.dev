<script lang="ts">
	import type { discordStatuses } from '$lib/discord/discordTypes';
	import { createLiveSocket } from '$lib/utils/liveSocket';
	import { onDestroy } from 'svelte';

	const colors: Record<discordStatuses, string> = {
		online: '#23A55A',
		idle: '#F0B232',
		dnd: '#F23F43',
		offline: '#80848E',
		unknown: '#80848E'
	};

	let discordStatus: discordStatuses = $state('offline');

	const socket = createLiveSocket<{ status: discordStatuses }>('/discord', ({ status }) => {
		discordStatus = status;
	});
	onDestroy(() => socket.close());
</script>

<p class="font-cascadia-code text-white" style="color: {colors[discordStatus]};">
	{`${discordStatus}.sh`}
</p>
