<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Pane from '../Pane.svelte';

	let { honks, onhonk }: { honks: number; onhonk: () => void } = $props();
</script>

<Pane pane="about" title="/About_Me" label="About me" program="nvim about_me.txt">
	<div class="about">
		<button class="honk" type="button" aria-label="Honk the cat" onclick={onhonk}>
			<img src="/logowhitetransparent.png" alt="" />
		</button>
		<div class="lines">
			<span class="ln">1</span>
			<p>
				Welcome to my small corner of the internet! This site was inspired by
				<a href="https://dimden.dev" target="_blank" rel="noopener noreferrer">dimden.dev</a>, so
				you'll spot a few similarities.
			</p>
			<span class="ln">2</span>
			<p>
				The purpose of this site is to serve as a <span class="br">{'{'}</span>
				<span style:color="#60a5fa">blog</span> /
				<span style:color="#4ade80">status</span> /
				<span style:color="#ef4444">portfolio</span>
				<span class="br">{'}'}</span> or whatever you wanna call it. Mainly to show off what I
				<span class="br">{'{'}</span> <span class="mut">have been</span> /
				<span style:color="#23A55A">am currently</span> <span class="br">{'}'}</span> up to.
			</p>
			<span class="ln">3</span>
			<p>
				I do a <b style:color="#ef4444">mild</b> <span class="emoji-font">💀</span> amount of
				content creation, so check me out on
				<a
					href="https://www.youtube.com/@bobbynooby"
					target="_blank"
					rel="noopener noreferrer"
					style:color="#ff4d4d">YouTube</a
				>
				and
				<a
					href="https://www.twitch.tv/bobbynooby"
					target="_blank"
					rel="noopener noreferrer"
					style:color="#a970ff">Twitch</a
				>
				(I stream regularly) <span class="emoji-font">😁</span>.
			</p>
			<span class="ln">4</span>
			<p>
				If you want to keep up with what I'm doing, my socials are linked in
				<span style:color="#facc15">/Links</span>. If you'd like to join a
				<a
					href="https://discord.gg/Bn9qX8hzNQ"
					target="_blank"
					rel="noopener noreferrer"
					style:color="#5865F2">Discord<Icon name="discord" size="1em" /></a
				>
				to just chill and stuff, click
				<a
					href="https://discord.gg/Bn9qX8hzNQ"
					target="_blank"
					rel="noopener noreferrer"
					style:color="#5865F2">here</a
				>.
			</p>
			<span class="ln">5</span>
			<p>
				Main languages: <span class="br">{'{'}</span>
				<span style:color="#F0DB4F">JavaScript<Icon name="javascript" size="1em" /></span> /
				<span style:color="#4f8fe0">TypeScript<Icon name="typescript" size="1em" /></span> / English
				<span class="emoji-font">🤓</span>
				<span class="br">{'}'}</span>, favourite framework
				<span style:color="#ff6a33">Svelte<Icon name="svelte" size="1em" /></span>.
			</p>
			<span class="ln">6</span>
			<p class="dim">~</p>
		</div>
	</div>
	<div class="mode">
		<span class="m">NORMAL</span><span>about_me.txt</span><span class="mut">honks: {honks}</span
		><span class="mut push">utf-8 · 5:1</span>
	</div>
</Pane>
