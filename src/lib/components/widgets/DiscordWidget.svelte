<script lang="ts">
	import { PUBLIC_WEBSOCKET_BASE_URL } from '$env/static/public';
	import type { discordStatuses } from '$lib/discord/discordTypes';

	const colors: Record<discordStatuses, string> = {
		online: '#23A55A',
		idle: '#F0B232',
		dnd: '#F23F43',
		offline: '#80848E',
		unknown: '#80848E'
	};

	let discordStatus: discordStatuses = $state('offline');
	const ws = new WebSocket(`${PUBLIC_WEBSOCKET_BASE_URL}/discord`);

	ws.onmessage = (event) => {
		const { data } = event;
		const { status } = JSON.parse(data);
		console.log(status);
		discordStatus = status;
	};
</script>

<p class="font-cascadia-code text-white" style="color: {colors[discordStatus]};">
	{`${discordStatus}.sh`}
</p>
