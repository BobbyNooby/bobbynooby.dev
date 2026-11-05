<script lang="ts">
	import { ago, safeHref } from '$lib/bsh/format';
	import { useOs } from '$lib/os/os.svelte';
	import Pane from '../Pane.svelte';

	const { live } = useOs();

	const PLAYLIST_EMBED =
		'https://open.spotify.com/embed/playlist/4XMKgF2w5YScCmVCaODvlC?utm_source=generator&theme=0';
	// Fixed bar shapes so the equaliser looks the same on every render.
	const BARS = Array.from({ length: 24 }, (_, i) => ({
		height: 30 + ((i * 37) % 70),
		duration: 0.45 + ((i * 13) % 9) / 10,
		delay: -((i * 7) % 10) / 10
	}));

	let song = $derived(live.song);
	let track = $derived(safeHref(song.songUrl));
	let label = $derived(
		song.isPlaying ? '< Now Playing >' : '! Last Played ' + ago(song.playedAt, live.now) + ' !'
	);
</script>

<Pane pane="music" title="/Music" label="Music" program="cava">
	<!-- One link for the whole song; with no track URL it is a plain, unclickable block. -->
	<a
		class="nowplay"
		href={track}
		target="_blank"
		rel="noopener noreferrer"
		aria-label={track ? `${song.title} by ${song.artist}, open on Spotify` : undefined}
	>
		<div class="mus">
			<div class="art" aria-hidden="true">
				{#if song.albumImageUrl}
					<img src={song.albumImageUrl} alt="" />
				{/if}
			</div>
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
		{#if track}
			<p class="np2"><span class="open">open track</span></p>
		{/if}
	</a>
	<iframe
		class="playlist"
		src={PLAYLIST_EMBED}
		title="Recommended playlist"
		height="352"
		loading="lazy"
		allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
	></iframe>
</Pane>
