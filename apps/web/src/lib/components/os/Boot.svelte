<script lang="ts">
	import { useOs } from '$lib/os/os.svelte';
	import { onMount } from 'svelte';

	const { live, chat, presence } = useOs();

	let lines = $state<string[]>([]);
	let fading = $state(false);
	let gone = $state(false);

	// Each line reads the live value at the moment it prints, so sockets that
	// connect during the boot show their real state.
	const steps = [
		() => 'bsh 0.1 · booting bobbynooby.dev',
		() => '[ ok ] mounted ~/projects ~/links ~/games ~/3x3',
		() => '[ ok ] ws /discord    ' + live.discord + '.sh',
		() =>
			'[ ok ] ws /spotify    ' +
			(live.hasSong ? live.song.title + ' — ' + live.song.artist : 'connected'),
		() => '[ ok ] ws /chat',
		() => '[ ok ] ws /presence   ' + presence.here + ' here',
		() => 'welcome, ' + chat.username.toLowerCase() + '.'
	];

	onMount(() => {
		let seen = false;
		try {
			seen = sessionStorage.getItem('bsh:booted') === '1';
			sessionStorage.setItem('bsh:booted', '1');
		} catch {
			seen = false;
		}
		if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			gone = true;
			return;
		}
		let timer: ReturnType<typeof setTimeout>;
		let i = 0;
		const step = () => {
			if (i < steps.length) {
				lines = [...lines, steps[i++]()];
				timer = setTimeout(step, 220);
				return;
			}
			timer = setTimeout(() => {
				fading = true;
				timer = setTimeout(() => (gone = true), 420);
			}, 700);
		};
		step();
		return () => clearTimeout(timer);
	});
</script>

{#if !gone}
	<div class="boot" class:fade={fading} aria-hidden="true">
		<img src="/logowhitetransparent.png" alt="" />
		<pre>{lines.join('\n')}</pre>
	</div>
{/if}
