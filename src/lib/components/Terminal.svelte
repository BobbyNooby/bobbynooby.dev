<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { writable } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	import { parseCommand } from '$lib/utils/parseCommand';
	import { getCommandTreeServer } from '$lib/utils/getCommandTreeServer';
	import { argChecker } from '$lib/utils/argsChecker';
	// import { commandTreePublic } from '$lib/commands/commandTree';

	let terminalHistory: { text: string; animated: boolean }[] = [];

	let currentCommand: string = '';

	const clientSideCommandTree: Record<
		string,
		{ args: 0; function: (args: string[]) => { isValid: boolean; history: string[] } }
	> = {
		help: {
			args: 0,
			function: (args) => {
				return {
					isValid: true,
					history: ['HAHAHA BITCH YOU THOUGHT XD']
				};
			}
		},
		ls: {
			args: 0,
			function: (args) => {
				return {
					isValid: true,
					history: ['/src /home /etc /dev /homework /passwords /boner']
				};
			}
		},
		cd: {
			args: 0,
			function: (args) => {
				return {
					isValid: true,
					history: ['Nuh uh you aint navigating anywhere bruh']
				};
			}
		},
		auth: {
			args: 0,
			function: (args) => {
				signIn('discord', { redirect: false });
				return {
					isValid: true,
					history: ['Logging in...']
				};
			}
		},
		logout: {
			args: 0,
			function: (args) => {
				signOut();
				return {
					isValid: true,
					history: ['Logging out...']
				};
			}
		},
		status: {
			args: 0,
			function: (args) => {
				return {
					isValid: true,
					history: [$page.data.session?.expires || 'error']
				};
			}
		},
		user: {
			args: 0,
			function: (args) => {
				return {
					isValid: true,
					history: [JSON.stringify($page.data.session) || 'error']
				};
			}
		},
		clear: {
			args: 0,
			function: (args) => {
				terminalHistory = [];
				return {
					isValid: true,
					history: []
				};
			}
		}
	};

	async function executeCommand(command: string) {
		try {
			let response: { isValid: boolean; history: string[] } = {
				isValid: false,
				history: ['Error : Client Side']
			};

			if (command !== '') {
				const commandArray = parseCommand(command);

				const rootCommand = commandArray[0];
				const args = commandArray.slice(1);
				const commandTreeServer = await getCommandTreeServer($page.data.session);

				let isClientSide = true;

				if (Object.keys(commandTreeServer).includes(rootCommand)) {
					isClientSide = false;
				}
				if (isClientSide) {
					try {
						response = argChecker(clientSideCommandTree[rootCommand].args, args);
						if (response.isValid) {
							response = {
								isValid: true,
								history: [
									rootCommand == 'clear' ? '' : commandArray.join(' '),
									...clientSideCommandTree[rootCommand].function(args).history
								]
							};
						}
					} catch (e) {
						response = {
							isValid: false,
							history: [commandArray.join(' '), `Command "${rootCommand}" not found`]
						};
					}
				} else {
					try {
						response = await fetch('http://localhost:5173/api/handle_command', {
							method: 'POST',
							body: JSON.stringify({ command: command })
						}).then((res) => res.json());
					} catch (e) {
						response = {
							isValid: false,
							history: [commandArray.join(' '), `Command "${rootCommand}" not found`]
						};
					}
				}
			} else {
				response = {
					isValid: true,
					history: ['>']
				};
			}
			terminalHistory = [
				...terminalHistory.map((item) => ({ ...item, animated: false })),
				...response.history.map((item) => ({ text: item, animated: true }))
			];

			console.log(terminalHistory);
			currentCommand = '';
			updateTheKey();
			scrollToBottom();
		} catch (e) {
			console.log(e);
		}
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

	let ready = false;
	onMount(() => {
		ready = true;
	});
</script>

{#if ready}
	<div
		in:fade={{ duration: 2000, easing: cubicInOut }}
		class="h-full w-full border-white border rounded-md p-3"
	>
		<div id="terminal" class="terminal-container pb-3">
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
		<div class="flex flex-row w-full">
			<p class="text-white">{'> '}</p>
			<input
				class="terminal-input border rounded-md border-white w-full ml-6"
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
	</div>
{/if}

<style>
	.terminal-container {
		display: flex;
		flex-direction: column;
		height: calc(100% - 2rem);
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: 0;
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
	}
	.terminal-line {
		font-family: 'Cascadia Code', sans-serif;

		color: white;
	}
</style>
