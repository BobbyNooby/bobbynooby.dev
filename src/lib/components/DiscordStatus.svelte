<script lang="ts">
	import { getDiscordStatus } from '$lib/discordUtils';

	export let initialDiscordStatus: string;

	let discordStatus: string = initialDiscordStatus;

	setInterval(async () => {
		discordStatus = await getDiscordStatus();
	}, 5000);
</script>

<p class="text-white font-quicksand-300">{discordStatus}</p>
