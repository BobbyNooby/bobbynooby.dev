<script lang="ts">
	// Spotify playlist embeds need no API — the iframe is the whole feature.
	const playlistEmbedUrl =
		'https://open.spotify.com/embed/playlist/4XMKgF2w5YScCmVCaODvlC?utm_source=generator&theme=0';
</script>

<p class="container-title-text">/Playlist</p>
<iframe
	src={playlistEmbedUrl}
	title="Recommended playlist"
	width="100%"
	height="352"
	loading="lazy"
	allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
	class="rounded-md"
	style="border: 0;"
></iframe>
