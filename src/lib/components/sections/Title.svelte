<script lang="ts">
	import { staticFilesUrl } from '$lib/utils/externalURLs';
	import { playAudio } from '$lib/utils/playAudio';

	function handleClick() {
		playAudio(`${staticFilesUrl}/a.mp3`);
	}
</script>

<button onclick={handleClick}>
	<p class="font-quicksand-300 text-6xl">
		<span class="font-cascadia-code">{'>'}</span>{'bobbynooby.dev'}
	</p>
</button>
