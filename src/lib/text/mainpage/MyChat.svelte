<script lang="ts">
	import { createMessageStore } from '$lib/stores/chatMessages';
	import { chatClient } from '$lib/supabaseChat';
	import type { chatMessageSchema } from '$lib/types/chatMessageSchema';
	import { wrapEmojis } from '$lib/utils/wrapEmojis';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { get } from 'svelte/store';
	import { fly } from 'svelte/transition';

	export let initialChatData: chatMessageSchema[] = [];

	const chatStore = createMessageStore(initialChatData);

	onMount(async () => {
		const subscription = chatClient
			.channel('chat')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
				chatStore.updateMessages(payload.new as chatMessageSchema);
			})
			.subscribe();

		onDestroy(() => {
			subscription.unsubscribe();
		});
	});

	let username = 'null';

	function generateRandomFourDigitNumber() {
		return Math.floor(1000 + Math.random() * 9000);
	}

	onMount(() => {
		if (localStorage.getItem('username') == null) {
			localStorage.setItem('username', `Guest_${generateRandomFourDigitNumber()}`);
		}

		username = localStorage.getItem('username') || `Guest_${generateRandomFourDigitNumber()}`;
		scrollToBottom();

		window.addEventListener('focus', (e) => {
			scrollToBottom();
		});
	});

	let message: string;

	let canMessageSend = true;
	async function handleEnter(event: Event) {
		event.preventDefault();

		username = localStorage.getItem('username') || `Guest_${generateRandomFourDigitNumber()}`;

		const maxMessageSize = 10 * 1024;
		const messageBytes = new TextEncoder().encode(message).length;

		if (messageBytes > maxMessageSize) {
			alert('Message too large. Max size is 10KB.');
			return;
		}

		if (message.trim() !== '' && canMessageSend) {
			try {
				canMessageSend = false;
				const isMessageValid = await chatStore.sendMessage({ name: username, message: message });

				if (isMessageValid) {
					message = '';
					scrollToBottom();
				}
			} finally {
				canMessageSend = true;
			}
		}
	}

	function scrollToBottom() {
		setTimeout(() => {
			const chatbox = document.getElementById('chatbox') as HTMLDivElement;
			chatbox.scrollTop = chatbox.scrollHeight;
		}, 1);
	}

	function parseTimeString(inputTime: string) {
		const now = new Date();
		const inputDate = new Date(inputTime);
		if (now.toLocaleDateString() === inputDate.toLocaleDateString()) {
			return inputDate.toLocaleTimeString();
		} else {
			return inputDate.toLocaleString();
		}
	}
</script>

<p class="container-title-text">/Chat</p>
<div
	id="chatbox"
	style=" height:20rem; overflow-y: scroll"
	class=" my-3 p-2 border border-white rounded-md w-full max-w-full text-sm"
>
	{#each $chatStore as message}
		<div
			class="flex flex-row w-full justify-between"
			style={message.rank == 'system' ? 'color : #02EEF7' : ''}
		>
			<div class="flex-shrink-0 min-w-min">
				<p>
					<span
						style="color : {message.rank == 'system'
							? ''
							: message.rank == 'owner'
								? '#00FF00'
								: '#CECECE'}"
					>
						{`<${message.name}>`}
					</span>
					:{' '}
				</p>
			</div>
			<div class="flex-grow min-w-0" style="max-width: 30rem;">
				<p class="{message.rank == 'system' ? '' : 'text-white'} break-words">
					{@html wrapEmojis(message.message)}
				</p>
			</div>
			<div class="flex-shrink-0 min-w-min">
				<p>{parseTimeString(message.created_at)}</p>
			</div>
		</div>
	{/each}
</div>

<form id="chatBar" method="POST" action="?/sendMessage" on:submit|preventDefault={handleEnter}>
	<div class="flex flex-row">
		<input
			class=" w-full text-white font-cascadia-code bg-black border border-white rounded-md p-1"
			type="text"
			placeholder="Message"
			bind:value={message}
			on:keydown={async (e) => {
				if (e.key === 'Enter') {
					await handleEnter(e);
				}
			}}
		/>
		<button type="submit" class="border border-white rounded-md px-5 ml-3">Send</button>
		<input
			type="hidden"
			name="messageData"
			value={JSON.stringify({ name: username, message: message })}
			required
		/>
	</div>
</form>
