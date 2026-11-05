<script lang="ts">
	import { PANE_TITLES } from '$lib/bsh/engine';
	import { useOs } from '$lib/os/os.svelte';

	const { presence, chat } = useOs();

	let open = $state(false);
	let wrap = $state<HTMLDivElement>();
	let unnamed = $derived(Math.max(0, presence.here - 1 - presence.others.length));

	function outside(event: PointerEvent) {
		if (open && wrap && !wrap.contains(event.target as Node)) open = false;
	}
</script>

<svelte:window
	onpointerdown={outside}
	onkeydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<div class="here" bind:this={wrap}>
	<button
		class="herebtn"
		type="button"
		aria-expanded={open}
		aria-controls="herepop"
		onclick={() => (open = !open)}>{presence.here} here</button
	>
	{#if open}
		<div class="herepop" id="herepop">
			<div>
				<p>
					<span style:color="#CECECE">&lt;<bdi>{chat.username}</bdi>&gt;</span><span class="mut"
						>{' you' + (presence.share ? '' : ' · cursor hidden')}</span
					>
				</p>
				{#each presence.others as v (v.id)}
					<p>
						<span style:color={v.color}>&lt;<bdi>{v.name}</bdi>&gt;</span><span class="mut"
							>{' in ' + PANE_TITLES[v.pane]}</span
						>
					</p>
				{/each}
				{#if unnamed}
					<p class="mut">+ {unnamed} more, not moving their mouse</p>
				{/if}
			</div>
			<div class="tg">
				<button
					class="tgb"
					type="button"
					aria-pressed={presence.share}
					onclick={() => presence.setShare(!presence.share)}
					>{presence.share ? '[x]' : '[ ]'} share my cursor</button
				>
				<button
					class="tgb"
					type="button"
					aria-pressed={presence.showOthers}
					onclick={() => presence.setShowOthers(!presence.showOthers)}
					>{presence.showOthers ? '[x]' : '[ ]'} show others</button
				>
			</div>
		</div>
	{/if}
</div>
