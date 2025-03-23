<script lang="ts">
	import type { SpotifyLastPlayedData, SpotifySongData } from '$lib/spotify/spotifyTypes';
	import SpotifyWidget from '../widgets/SpotifyWidget.svelte';

	let {
		initialCurrentSongData,
		initialLastSongData
	}: { initialCurrentSongData: SpotifySongData; initialLastSongData: SpotifyLastPlayedData } =
		$props();
</script>

<p class="container-title-text">/Music</p>
<SpotifyWidget {initialCurrentSongData} {initialLastSongData} />
