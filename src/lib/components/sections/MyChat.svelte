<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_WEBSOCKET_BASE_URL } from '$env/static/public';
	import type { ChatMessage, SentChatMessage } from '$lib/types';
	import { playAudio } from '$lib/utils/playAudio';
	import { onMount } from 'svelte';

	const starterMessages: ChatMessage[] = [
		{
			message: 'Welcome to the chat! Use /username to change your username.',
			rank: 'owner',
			created_at: new Date().toISOString(),
			name: 'bobbynooby.dev'
		},
		{
			message: 'If the name is green, its me! If not, its someone else.',
			rank: 'owner',
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

		window.addEventListener('focus', (e) => {
			scrollToBottom();
		});
	});

	let message: string = $state('');
	let lastMessageISent: { name: string; message: string } = $state({ name: '', message: '' });

	const ws = new WebSocket(`${PUBLIC_WEBSOCKET_BASE_URL}/chat`);

	ws.onmessage = (event) => {
		const { data } = event;
		const { message, initialMessages } = JSON.parse(data);
		if (!initialMessages) {
			messages = [...messages, message];

			if (!(lastMessageISent.name == message.name && lastMessageISent.message == message.message)) {
				playAudio('/imrcv.mp3');
			} else {
				playAudio('/imsend.mp3');
			}

			scrollToBottom();
		} else if (initialMessages) {
			messages = [...initialMessages, ...starterMessages];
			scrollToBottom();
		}
	};

	async function handleEnter(event: Event) {
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
			message: trimmedMessage,
			sessionId: page.data.session?.user?.id || undefined
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
				rank: 'owner',
				created_at: new Date().toISOString()
			}
		];
	}

	let localUserCount = $state(0);

	const usersWs = new WebSocket(`${PUBLIC_WEBSOCKET_BASE_URL}/userCount`);

	usersWs.onmessage = (event) => {
		const { data } = event;
		const { userCount } = JSON.parse(data);
		localUserCount = userCount;
	};
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
					<span style="color : {message.rank == 'owner' ? '#00FF00' : '#CECECE'}">
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

<input
	class=" font-cascadia-code w-full rounded-md border border-white bg-black p-1 text-white"
	type="text"
	placeholder="Message"
	bind:value={message}
	onkeydown={async (e) => {
		if (e.key === 'Enter') {
			await handleEnter(e);
		}
	}}
/>
<input
	type="hidden"
	name="messageData"
	value={JSON.stringify({ name: username, message: message })}
	required
/>
