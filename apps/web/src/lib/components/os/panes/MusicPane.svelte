<script lang="ts">
	import { ago, safeHref } from '$lib/bsh/format';
	import { useOs } from '$lib/os/os.svelte';
	import Pane from '../Pane.svelte';

	const { live } = useOs();

	const PLAYLIST = 'https://open.spotify.com/playlist/4XMKgF2w5YScCmVCaODvlC';
	// Fixed bar shapes so the equaliser looks the same on every render.
	const BARS = Array.from({ length: 24 }, (_, i) => ({
		height: 30 + ((i * 37) % 70),
		duration: 0.45 + ((i * 13) % 9) / 10,
		delay: -((i * 7) % 10) / 10
	}));

	let song = $derived(live.song);
	let label = $derived(
		song.isPlaying ? '< Now Playing >' : '! Last Played ' + ago(song.playedAt, live.now) + ' !'
	);
</script>

<Pane pane="music" title="/Music" label="Music" program="cava">
	<div class="mus">
		<!-- A mouse/touch shortcut only: keyboard and screen readers already get "open track" below. -->
		<a
			class="art"
			href={safeHref(song.songUrl)}
			target="_blank"
			rel="noopener noreferrer"
			tabindex="-1"
			aria-hidden="true"
		>
			{#if song.albumImageUrl}
				<img src={song.albumImageUrl} alt="" />
			{/if}
		</a>
		<div class="meta">
			<span style:color={song.isPlaying ? '#4ade80' : '#9ca3af'}>{label}</span>
			<span class="w">{song.title}</span>
			<span class="mut">{song.artist}</span>
			<span class="dim">{song.album}</span>
		</div>
	</div>
	<div class="eq" class:idle={!song.isPlaying} aria-hidden="true">
		{#each BARS as b, i (i)}
			<span
				style:height="{b.height}%"
				style:animation-duration="{b.duration}s"
				style:animation-delay="{b.delay}s"
			></span>
		{/each}
	</div>
	<p class="np2">
		{#if safeHref(song.songUrl)}
			<a href={safeHref(song.songUrl)} target="_blank" rel="noopener noreferrer">open track</a> ·
		{/if}
		<a href={PLAYLIST} target="_blank" rel="noopener noreferrer">/Playlist</a>
	</p>
</Pane>
