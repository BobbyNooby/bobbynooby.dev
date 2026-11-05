<script lang="ts">
	import { fromTen, toTen } from '$lib/admin/score';
	import { getGreenRedColorFromScore } from '$lib/utils/getGreenRedColorFromScore';
	import { untrack } from 'svelte';

	let { value = $bindable(), bad = false }: { value: number; bad?: boolean } = $props();

	// The text is kept apart from the number so "8." can be typed without being
	// rewritten to "8.0". Both change in one handler; the effect below only
	// resyncs the text when the score changes from outside (discard, undo).
	let text = $state(untrack(() => toTen(value)));
	$effect(() => {
		const score = value;
		untrack(() => {
			const typed = fromTen(text);
			if (typed !== score && !(Number.isNaN(typed) && Number.isNaN(score))) text = toTen(score);
		});
	});

	function oninput(e: Event & { currentTarget: HTMLInputElement }) {
		text = e.currentTarget.value;
		value = fromTen(text);
	}

	const width = $derived(Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value)) * 100);
</script>

<input
	class="in"
	class:bad
	inputmode="decimal"
	value={text}
	{oninput}
	aria-label="Score out of 10"
/>
<div class="cz-scorebar" aria-hidden="true">
	<i style:width="{width}%" style:background={getGreenRedColorFromScore(value * 100)}></i>
</div>
