<script lang="ts">
	import { TWITCH_CHANNEL } from '$lib/twitch/channel';
	import { twitch } from '$lib/twitch/twitchLive.svelte';
	import { onMount } from 'svelte';
	import Pane from '../Pane.svelte';

	// The player requires ?parent= to match the embedding page's hostname.
	let parent = $state('');
	onMount(() => (parent = location.hostname));
</script>

{#if twitch.status?.live}
	<Pane
		pane="twitch"
		title="/Twitch"
		label="Twitch"
		program="twitch.tv/{TWITCH_CHANNEL}"
		extra="tw"
	>
		{#snippet badge()}<span class="livebadge">LIVE NOW</span>{/snippet}
		<div class="tw-body">
			{#if parent}
				<iframe
					class="player"
					src="https://player.twitch.tv/?channel={TWITCH_CHANNEL}&parent={parent}&muted"
					title="Twitch stream"
					allowfullscreen
				></iframe>
			{/if}
			<p class="w">{twitch.status.title}</p>
			<p class="mut">
				Playing {twitch.status.game}{twitch.status.viewers
					? ` · ${twitch.status.viewers} viewers`
					: ''}
			</p>
		</div>
	</Pane>
{/if}
