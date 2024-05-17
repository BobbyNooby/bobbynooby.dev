<script lang="ts">
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';

	let terminalHistory: { text: string; animated: boolean }[] = [];

	let currentCommand: string = '';

	const validCommands = {
		test: {
			response: 'This command is the test command',
			function: () => {
				console.log('Amogogs.');
			}
		},
		help: {
			response: 'HAHAHA BITCH YOU THOUGHT XD',
			function: () => {
				console.log('boner');
			}
		},
		ls: {
			response: `/src /home /etc /dev /homework /passwords /boner`,
			function: () => {}
		},
		cd: {
			response: 'Nuh uh you aint navigating anywhere bruh',
			function: () => {}
		}
	};

	function executeCommand(command: string) {
		let responseMessage: string = '';

		if (command == '') {
			terminalHistory = [
				...terminalHistory.map((item) => ({ ...item, animated: false })),
				{ text: '', animated: true }
			];
		} else {
			if (Object.keys(validCommands).includes(command)) {
				responseMessage = validCommands[command as keyof typeof validCommands].response;
				validCommands[command as keyof typeof validCommands].function();
			} else {
				responseMessage = `Command "${command}" not found`;
			}

			terminalHistory = [
				...terminalHistory.map((item) => ({ ...item, animated: false })),
				{ text: command, animated: true },
				{ text: responseMessage, animated: true }
			];
		}
		console.log(terminalHistory);
		currentCommand = '';
		updateTheKey();
		scrollToBottom();
	}

	function scrollToBottom() {
		// Defer the scroll to the next tick
		setTimeout(() => {
			const terminal = document.getElementById('terminal');
			terminal.scrollTop = terminal.scrollHeight;
		}, 0);
	}

	onMount(() => {
		scrollToBottom();
	});

	const updateKey = writable(false);

	function updateTheKey() {
		updateKey.set(!$updateKey);
	}
</script>

<body class="h-full bg-black m-5 border-white border rounded-md p-5 pb-10">
	<div id="terminal" class="terminal-container">
		<div class="terminal-history">
			{#each terminalHistory as pastLine, index}
				<p
					in:fly={{
						x: index === terminalHistory.length - 1 ? 100 : 0,
						duration: 200,
						easing: cubicInOut
					}}
					class="terminal-line"
				>
					{pastLine.text}
				</p>
			{/each}
		</div>
	</div>
	<div class="flex flex-row">
		<p class="text-white">{'> '}</p>
		<input
			class="terminal-input border rounded-md border-white ml-2 mr-5"
			placeholder="Type a command"
			type="text"
			style="font-family: 'Cascadia Code', sans-serif;"
			bind:value={currentCommand}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					executeCommand(currentCommand);
				}
			}}
		/>
	</div>
</body>

<style>
	@import url('https://cdn.jsdelivr.net/npm/@xz/fonts@1/serve/cascadia-code.min.css');

	.terminal-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: 0;
		background-color: black;
	}
	.terminal-history {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.terminal-input {
		color: white;
		background-color: rgba(0, 0, 0, 0);
		width: 100%;
	}
	.terminal-line {
		font-family: 'Cascadia Code', sans-serif;

		color: white;
	}
</style>
