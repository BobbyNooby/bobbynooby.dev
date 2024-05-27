<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicIn, cubicInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	export let links: { name: string; href: string; color: string }[];
	// const links: { name: string; href: string; color: string }[] = [
	// 	{ name: 'YouTube_1', href: 'https://www.youtube.com/@bobbynooby', color: '#FF0000' },
	// 	{
	// 		name: 'YouTube_2',
	// 		href: 'https://www.youtube.com/@bobsterlobster',
	// 		color: '#FF0000'
	// 	},
	// 	{ name: 'GitHub', href: 'https://github.com/bobbynooby', color: '#79A3AF' },
	// 	{ name: 'Twitter', href: 'https://twitter.com/bobbynoobyu', color: '#1DA1F2' },
	// 	{ name: 'Twitch', href: 'https://www.twitch.tv/bobbynooby', color: '#9147FF' },
	// 	{ name: 'Ko-fi', href: 'https://ko-fi.com/bobbynooby', color: '#FF5A62' },
	// 	{
	// 		name: 'Spotify',
	// 		href: 'https://open.spotify.com/artist/3ixFauWAVAnvtA1u7VJ5Ju?si=BxypzrtlT3aKuNPeqBFu2g',
	// 		color: '#1FDF64'
	// 	},
	// 	{ name: 'SoundCloud', href: 'https://soundcloud.com/bobbynooby', color: '#FF5500' },
	// 	{
	// 		name: 'osu!',
	// 		href: 'https://osu.ppy.sh/users/11574990',
	// 		color: '#E6649E'
	// 	}
	// ];

	let ready = false;

	onMount(() => {
		ready = true;
	});
</script>

<p in:fly={{ x: 100, duration: 500, easing: cubicInOut }} class="container-title-text">/Links</p>
{#each links as link, i}
	{#if ready}
		<div
			in:fly={{ x: 100, duration: 500, easing: cubicInOut, delay: (i + 1) * 50 }}
			style="color: {link.color};"
		>
			<p style="text-indent: 2em">/<a href={link.href}>{link.name}</a></p>
		</div>
	{/if}
{/each}
