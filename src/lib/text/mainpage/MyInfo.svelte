<script>
	import { playAudio } from '$lib/utils/playAudio';
	import { staticFilesUrl } from '$lib/utils/staticContentDirectory';
</script>

<p class="container-title-text">/About_Me</p>
<br />
<div class="flex flex-row">
	<button
		on:click={() => playAudio(`${staticFilesUrl}/honk.mp3`)}
		class="flex items-center justify-center border border-white mx-5 aspect-square h-24 honk-button"
	>
		<img
			src="https://raw.githubusercontent.com/BobbyNooby/bobbynooby.dev/master/static/logowhitetransparent.png"
			alt="logo"
		/>
	</button>
	<div>
		<p>
			Welcome to my small corner of the internet! This page was inspired by <a
				href="https://dimden.dev"
				target="_blank"
				><span style="text-decoration: underline;" class="text-yellow-500">dimden.dev</span></a
			> so you will find alot of similarities to that site here!
		</p>
	</div>
</div>
<br />
<p class="mx-2">
	The purpose of this site is to serve as a <span class=" text-blue-600">{'{'}</span>
	<span class=" text-blue-400">blog</span>
	/
	<span class=" text-green-400">status</span>
	/ <span class="text-red-500">portfolio</span>
	<span class=" text-blue-600">{'}'}</span>
	or whatever you wanna call it. Just mainly to show off what i
	<span class=" text-blue-600">{'{'}</span> <span style="color: #80848E;">have been</span> /
	<span style="color : #23A55A;">am currently</span>
	<span class=" text-blue-600">{'}'}</span> up to.
</p>

<style>
	@keyframes honk {
		0% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	.honk-button:active {
		animation: honk 0.2s steps(2);
	}
</style>
