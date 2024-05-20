<script lang="ts">
	import SpotifyWidget from '$lib/components/SpotifyWidget.svelte';
	import type { SpotifySongData } from '$lib/spotify';
	import type { SpotifyLastPlayedData } from '$lib/supabaseUtils';

	export let initialSongData: SpotifySongData, initialLastSongData: SpotifyLastPlayedData;
</script>

<p class="container-title-text">/Music</p>
<SpotifyWidget {initialSongData} {initialLastSongData} />
