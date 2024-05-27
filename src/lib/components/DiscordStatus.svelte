<script lang="ts">
	import { getDiscordStatus, type discordStatuses } from '$lib/discordUtils';

	export let initialDiscordStatus: discordStatuses;

	const colors: Record<discordStatuses, string> = {
		online: '#23A55A',
		idle: '#F0B232',
		dnd: '#F23F43',
		offline: '#80848E',
		unknown: '#80848E'
	};

	let discordStatus: discordStatuses = initialDiscordStatus || 'offline';

	setInterval(async () => {
		discordStatus = await getDiscordStatus();
	}, 5000);
</script>

<p class="text-white font-cascadia-code" style="color: {colors[discordStatus]};">
	{`${discordStatus}.sh`}
</p>
