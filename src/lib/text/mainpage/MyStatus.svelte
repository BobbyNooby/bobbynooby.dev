<script lang="ts">
	import DiscordStatus from '$lib/components/DiscordStatus.svelte';
	import type { discordStatuses } from '$lib/discordUtils';

	export let initialDiscordStatus: discordStatuses;

	let discordStatus: discordStatuses = initialDiscordStatus || 'offline';
</script>

<p class="container-title-text">/Status</p>
<div style=" text-indent: 2em ">
	<DiscordStatus initialDiscordStatus={discordStatus} />
</div>
