<script lang="ts">
	import { enhance } from '$app/forms';
	import Title from '$lib/components/sections/Title.svelte';
	import toast from 'svelte-french-toast';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { navigating, page } from '$app/state';
	import type { PageServerData } from './$types';
	import DiscordLoginBall from '$lib/components/DiscordLoginBall.svelte';
	import { SignOut } from '@auth/sveltekit/components';
	import GenericButton from '$lib/components/GenericButton.svelte';

	let { data }: { data: PageServerData } = $props();

	let longURL = $state('');
	let responseString = $state('');
	let responseURL = $state('');
	let longURLFormData = $state('');

	function updateResponseString(
		shortURL: string | null,
		message: string | null = null,
		error: boolean = false
	): string {
		if (error) {
			responseURL = '';
			return `Error in generating short URL : ${message}`;
		}

		if (shortURL) {
			responseURL = `https://bobbynooby.dev/${shortURL}`;
			return `Your short URL is: `;
		}

		return '';
	}

	function copyClipboard() {
		if (responseURL) {
			navigator.clipboard
				.writeText(responseURL)
				.then(() => {
					toast.success('Copied to clipboard!', {
						style: "font-family: 'Cascadia Code', sans-serif;"
					});
				})
				.catch((err) => {
					toast.error('Failed to copy', {
						style: "font-family: 'Cascadia Code', sans-serif;"
					});
				});
		}
	}

	const handleEnhance: SubmitFunction = () => {
		return async ({ result, update }) => {
			update({ reset: false });

			if (result.type === 'success') {
				// Type-safe access to shortURL
				const shortURL =
					result.data && typeof result.data === 'object' && 'shortURL' in result.data
						? result.data.shortURL
						: null;

				if (typeof shortURL === 'string') {
					responseString = updateResponseString(shortURL);
					toast.success('ShortURL created successfully!', {
						style: "font-family: 'Cascadia Code', sans-serif;"
					});
				} else {
					toast.error('Invalid response from server');
				}
			}

			if (result.type === 'failure') {
				// Type-safe error handling
				const errorMessage =
					result.data && typeof result.data === 'object' && 'error' in result.data
						? String(result.data.message)
						: 'Failed to create ShortURL';

				responseString = updateResponseString(null, errorMessage, true);
				toast.error(errorMessage, {
					style: "font-family: 'Cascadia Code', sans-serif;"
				});
			}
		};
	};
</script>

{#if !navigating.complete}
	{#if page.data.session}
		{#if data.isSessionValid}
			<Title />
			<p class="font-quicksand-300 my-5 text-4xl">URL Shortener</p>
			<SignOut>
				<div slot="submitButton" class="buttonPrimary mb-5">
					<GenericButton text={'Sign Out'}></GenericButton>
				</div>
			</SignOut>
			<form method="POST" action="?/create" use:enhance={handleEnhance} class="relative flex w-1/2">
				<div class="flex h-10 w-full flex-row justify-center border pl-2">
					<input
						class="w-full bg-black text-white focus:outline-none"
						type="text"
						bind:value={longURL}
						placeholder="Enter your URL here..."
						required
					/>
					<button
						type="submit"
						onclick={() => (longURLFormData = JSON.stringify(longURL))}
						class="ml-2 border-l border-white bg-white px-4 text-black transition-transform duration-500"
					>
						Submit
					</button>

					<input type="hidden" name="longURL" value={longURL} required />
				</div>
			</form>

			<div class="flex items-center space-x-2 text-xl">
				<p>{responseString}</p>
				{#if responseURL}
					<button onclick={copyClipboard} class="cursor-pointer text-blue-500 hover:underline">
						{responseURL}
					</button>
				{/if}
			</div>
		{:else}
			<div class="flex h-screen flex-col items-center justify-center overflow-hidden text-center">
				<p class="font-cascadia-code bouncy-animation text-3xl">
					NAH BRUH you aint got the perms bruh GETCHO ASS OUTTA HERE <span class="emoji-font"
						>🗣🗣🗣🔥🔥🔥💯💯🤣🤣🤣🫵🫵🫵🫵</span
					>
				</p>
				<SignOut
					><div slot="submitButton" class="buttonPrimary">
						<GenericButton text={'Sign Out'} extraClasses={'text-2xl m-10'} />
					</div></SignOut
				>
			</div>
		{/if}
	{:else}
		<DiscordLoginBall />
	{/if}
{/if}
