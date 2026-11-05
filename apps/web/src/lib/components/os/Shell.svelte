<script lang="ts">
	import type { ShellView } from '$lib/os/shell.svelte';
	import { tick } from 'svelte';

	let { view }: { view: ShellView } = $props();

	const PAD: [string, [number, number], string][] = [
		['↑', [0, -1], 'up'],
		['←', [-1, 0], 'left'],
		['↓', [0, 1], 'down'],
		['→', [1, 0], 'right']
	];

	const CHIPS = ['ls', 'tree', 'cd ..', 'neofetch', 'honk', 'help'];

	let input = $state('');
	let field = $state<HTMLInputElement>();
	let out = $state<HTMLDivElement>();
	let back = -1;

	$effect(() => {
		void view.lines;
		tick().then(() => out?.scrollTo(0, out.scrollHeight));
	});

	const finePointer = () =>
		typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;

	function run(cmd: string) {
		view.run(cmd);
		if (finePointer()) field?.focus({ preventScroll: true });
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		back = -1;
		const cmd = input;
		input = '';
		view.run(cmd);
	}

	function keydown(event: KeyboardEvent) {
		if (view.snakeKey(event)) return;
		const history = view.shell?.state.history ?? [];
		if (event.key === 'Tab') {
			event.preventDefault();
			input = view.shell?.complete(input) ?? input;
		} else if (event.key === 'ArrowUp' && history.length) {
			event.preventDefault();
			back = back < 0 ? history.length - 1 : Math.max(0, back - 1);
			input = history[back];
		} else if (event.key === 'ArrowDown' && back >= 0) {
			event.preventDefault();
			back += 1;
			if (back >= history.length) {
				back = -1;
				input = '';
			} else input = history[back];
		}
	}

	export function focus() {
		field?.focus({ preventScroll: true });
	}
</script>

<section class="shell" aria-label="Shell">
	<div class="ph">
		<h2>{view.title} — bsh</h2>
		<span class="tip"
			>try: ls · cd projects · cat about_me.txt · tree · open links/github.txt · Tab completes</span
		>
	</div>
	<div class="out" bind:this={out} role="log" aria-live="polite">
		{#each view.lines as line (line.id)}
			{#if line.kind === 'snake'}
				<div class="snake">{line.segs[0]?.t}</div>
			{:else if line.kind === 'pad'}
				<div class="snakepad">
					{#each PAD as [label, dir, name] (name)}
						<button type="button" aria-label="Snake {name}" onclick={() => view.snakeTurn(dir)}
							>{label}</button
						>
					{/each}
					<button type="button" onclick={() => view.snakeQuit()}>quit</button>
				</div>
			{:else}
				<div>
					{#each line.segs as s, j (j)}
						{#if s.href}
							<a href={s.href} target="_blank" rel="noopener noreferrer" style:color={s.c}>{s.t}</a>
						{:else if s.run}
							{@const cmd = s.run}
							<button
								type="button"
								class="ol"
								style:color={s.c || '#f5f5f5'}
								onclick={() => run(cmd)}>{s.t}</button
							>
						{:else if s.fx}
							<span class="fx">{s.t}</span>
						{:else}
							<span style:color={s.c}>{s.t}</span>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}
	</div>
	<div class="chips">
		{#each CHIPS as cmd (cmd)}
			<button class="chip" type="button" onclick={() => run(cmd)} disabled={!view.ready}
				>{cmd}</button
			>
		{/each}
	</div>
	<form class="prompt" onsubmit={submit}>
		<label class="pl">
			<span>{view.prompt}</span>
			<input
				bind:this={field}
				bind:value={input}
				onkeydown={keydown}
				type="text"
				autocomplete="off"
				autocapitalize="off"
				spellcheck="false"
				enterkeyhint="go"
				placeholder={view.ready ? 'type a command' : 'mounting…'}
				disabled={!view.ready}
				aria-label="Shell command"
			/>
		</label>
		<button type="submit" disabled={!view.ready}>run ⏎</button>
	</form>
</section>
