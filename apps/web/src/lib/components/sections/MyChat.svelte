<script lang="ts">
	import type { ChatMessage, SentChatMessage } from '$lib/types';
	import { chatColorForRank } from '$lib/chat/chatColors';
	import { createLiveSocket } from '$lib/utils/liveSocket';
	import { playAudio } from '$lib/utils/playAudio';
	import { onDestroy, onMount } from 'svelte';

	const starterMessages: ChatMessage[] = [
		{
			message: 'Welcome to the chat! Use /username to change your username.',
			rank: 'system',
			created_at: new Date().toISOString(),
			name: 'bobbynooby.dev'
		},
		{
			message: 'If the name is green, its me! If not, its someone else.',
			rank: 'system',
			created_at: new Date().toISOString(),
			name: 'bobbynooby.dev'
		}
	];

	let username = $state('null');
	let messages = $state<ChatMessage[]>([]);

	function generateRandomFourDigitNumber() {
		return Math.floor(1000 + Math.random() * 9000);
	}

	onMount(() => {
		if (localStorage.getItem('username') == null) {
			localStorage.setItem('username', `Guest_${generateRandomFourDigitNumber()}`);
		}

		username = localStorage.getItem('username') || `Guest_${generateRandomFourDigitNumber()}`;
		scrollToBottom();

		window.addEventListener('focus', () => {
			scrollToBottom();
		});
	});

	let message: string = $state('');
	let lastMessageISent: { name: string; message: string } = $state({ name: '', message: '' });

	// The backend sends either the history on connect or a single new message.
	const ws = createLiveSocket<{ initialMessages: ChatMessage[] } | { message: ChatMessage }>(
		'/chat',
		(data) => {
			if ('initialMessages' in data) {
				// The backend sends history newest-first; render oldest at the top.
				messages = [...starterMessages, ...data.initialMessages.slice().reverse()];
				scrollToBottom();
				return;
			}

			messages = [...messages, data.message];

			if (
				!(
					lastMessageISent.name == data.message.name &&
					lastMessageISent.message == data.message.message
				)
			) {
				playAudio('/imrcv.mp3');
			} else {
				playAudio('/imsend.mp3');
			}

			scrollToBottom();
		}
	);

	let localUserCount = $state(0);

	const usersWs = createLiveSocket<{ userCount: number }>('/userCount', ({ userCount }) => {
		localUserCount = userCount;
	});

	onDestroy(() => {
		ws.close();
		usersWs.close();
	});

	async function handleSend(event: Event) {
		event.preventDefault();

		username = localStorage.getItem('username') || `Guest_${generateRandomFourDigitNumber()}`;

		const maxMessageSize = 10 * 1024;
		const messageBytes = new TextEncoder().encode(message).length;

		if (messageBytes > maxMessageSize) {
			alert('Message too large. Max size is 10KB.');
			return;
		}

		const trimmedMessage = message.trim();
		if (trimmedMessage === '') {
			return;
		}

		if (isCommand(trimmedMessage)) {
			message = '';
			scrollToBottom();
			return;
		}

		const messageObject: SentChatMessage = {
			name: username,
			message: trimmedMessage
		};

		lastMessageISent = { name: username, message: trimmedMessage };
		ws.send(JSON.stringify(messageObject));

		message = '';
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

	function isCommand(message: string): boolean {
		const splitMessage = message.split(/\s+/);
		const command = splitMessage[0];

		if (command.startsWith('/')) {
			if (command === '/username') {
				const restOfUserName = splitMessage.slice(1).join(' ');
				localStorage.setItem('username', restOfUserName);
				username = restOfUserName;
				addDevMessage(`Username changed to ${restOfUserName}`);
				return true;
			}

			addDevMessage(`Command ${command} not found`);
			return true;
		}

		return false;
	}

	function addDevMessage(message: string) {
		messages = [
			...messages,
			{
				name: 'bobbynooby.dev',
				message: message,
				rank: 'system',
				created_at: new Date().toISOString()
			}
		];
	}
</script>

<p class="container-title-text">/Chat</p>
<p class="font-quicksand-300">
	Current Active Users : <span class=" text-yellow-300">{localUserCount}</span>
</p>
<div
	id="chatbox"
	style=" height:20rem; overflow-y: scroll"
	class=" my-3 w-full max-w-full rounded-md border border-white p-2 text-sm"
>
	{#each messages as message}
		<div class="flex w-full flex-row justify-between">
			<div class="min-w-min flex-shrink-0">
				<p>
					<span style="color : {chatColorForRank(message.rank)}">
						{`<${message.name}>`}
					</span>
					:{' '}
				</p>
			</div>
			<div class="min-w-0 flex-grow" style="max-width: 30rem;">
				<p class="break-words text-white">
					{message.message}
				</p>
			</div>
			<div class="min-w-min flex-shrink-0">
				<p>{parseTimeString(message.created_at)}</p>
			</div>
		</div>
	{/each}
</div>

<form class="flex w-full flex-row gap-2" onsubmit={handleSend}>
	<input
		class=" font-cascadia-code min-w-0 flex-grow rounded-md border border-white bg-black p-1 text-base text-white"
		type="text"
		placeholder="Message"
		enterkeyhint="send"
		autocomplete="off"
		bind:value={message}
	/>
	<button
		type="submit"
		class="font-cascadia-code shrink-0 rounded-md border border-white bg-black px-3 py-1 text-base text-white"
	>
		Send
	</button>
	<input
		type="hidden"
		name="messageData"
		value={JSON.stringify({ name: username, message: message })}
		required
	/>
</form>
