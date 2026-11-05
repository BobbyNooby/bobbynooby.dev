<script lang="ts">
	import { chatColorForRank } from '$lib/chat/chatColors';
	import { useOs } from '$lib/os/os.svelte';
	import { CHAT_MAX_MESSAGE_LENGTH } from '@bobbynooby/shared';
	import { tick } from 'svelte';
	import Pane from '../Pane.svelte';

	const { chat, presence } = useOs();

	let box = $state<HTMLDivElement>();
	let draft = $state('');

	const when = (iso: string) => {
		const d = new Date(iso);
		return d.toDateString() === new Date().toDateString()
			? d.toLocaleTimeString()
			: d.toLocaleString();
	};

	$effect(() => {
		void chat.messages.length;
		tick().then(() => box?.scrollTo(0, box.scrollHeight));
	});

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (chat.submit(draft)) draft = '';
	}
</script>

<Pane pane="chat" title="/Chat" label="Chat">
	{#snippet program()}Current Active Users : <span class="y">{presence.here}</span>{/snippet}
	<div class="chat" bind:this={box} aria-live="polite">
		{#each chat.messages as m, i (i)}
			<p title={when(m.created_at)}>
				<span style:color={chatColorForRank(m.rank)}>&lt;{m.name}&gt;</span>
				{m.message}
			</p>
		{/each}
	</div>
	<form class="chatform" onsubmit={submit}>
		<label class="sr-only" for="chat-input">Chat message</label>
		<input
			id="chat-input"
			type="text"
			placeholder="message, or /username <name>"
			enterkeyhint="send"
			autocomplete="off"
			maxlength={CHAT_MAX_MESSAGE_LENGTH}
			bind:value={draft}
		/>
		<button type="submit">send</button>
	</form>
	<p class="hint2">
		or type <span class="w">say &lt;msg&gt;</span> or
		<span class="w">username &lt;name&gt;</span> in the shell
	</p>
</Pane>
