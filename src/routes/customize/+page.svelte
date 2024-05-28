<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from '../$types';
	import 'remixicon/fonts/remixicon.css';
	import { createLinksTable } from '$lib/stores/linksTable';
	import { flip } from 'svelte/animate';
	import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { createProjectsTable } from '$lib/stores/projectsTable';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import { page } from '$app/stores';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const linksTable = createLinksTable(data.links);
	let linksReady = false;

	const projectsTable = createProjectsTable(data.projects);
	let projectsReady = false;

	let isDeleteMenuActive = false;
	let deleteMenuData: {} = { none: 'None' };
	let deleteFunction = () => {};

	function handleDelete(inputFunction: () => any, data: any) {
		isDeleteMenuActive = true;
		deleteFunction = inputFunction;
		deleteMenuData = data;
	}

	function doDelete() {
		deleteFunction();
		isDeleteMenuActive = false;
		deleteFunction = () => {};
		deleteMenuData = {};
	}

	function cancelDelete() {
		isDeleteMenuActive = false;
		deleteFunction = () => {};
		deleteMenuData = {};
	}

	function resizeTextArea(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	$: {
		console.log($projectsTable);
	}
</script>

{#if $page.data.session}
	{#if data.isSessionValid}
		<div class="flex flex-col z-0 mt-5">
			<div class="flex flex-row space-x-5">
				<div class="space-y-2">
					<SignOut>
						<div slot="submitButton" class="buttonPrimary">
							<GenericButton text={'Sign Out'}></GenericButton>
						</div>
					</SignOut>
					<form
						method="POST"
						action="?/update"
						use:enhance={() => {
							return async ({ result, update }) => {
								update({ reset: false });

								if (result.type === 'success') {
									toast.success('Data updated successfully!', {
										style: "font-family : 'Cascadia Code', sans-serif;"
									});
								}

								if (result.type === 'failure') {
									toast.error('Error updating data!', {
										style: "font-family : 'Cascadia Code', sans-serif;"
									});
								}
							};
						}}
					>
						<input type="hidden" name="linksTable" value={JSON.stringify($linksTable)} required />
						<input
							type="hidden"
							name="projectsTable"
							value={JSON.stringify($projectsTable)}
							required
						/>
						<GenericButton buttonType={'submit'} text={'Update'} />
					</form>
					<div>
						<GenericButton text={'Home'} inputFunction={() => goto('/')} />
					</div>
				</div>
				<div class="link-root">
					<div class="flex flex-row items-center">
						<p class=" container-title-text font-cascadia-code">/Links</p>
						<button on:click={() => (linksReady = !linksReady)}>
							{#if !linksReady}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"
									></path></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM7 11H17V13H7V11Z"
									></path></svg
								>
							{/if}
						</button>
						{#if linksReady}
							<button on:click={() => linksTable.createNew()}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM4 5V19H20V7H11.5858L9.58579 5H4ZM11 12V9H13V12H16V14H13V17H11V14H8V12H11Z"
									></path></svg
								>
							</button>
						{/if}
					</div>
					{#if linksReady}
						<div
							in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
							out:fly={{ y: 100, duration: 500, easing: cubicOut }}
						>
							{#each $linksTable as link, i (link.uid)}
								<div
									animate:flip={{ duration: 200, easing: cubicOut }}
									class="border rounded-md border-white p-3 m-2"
								>
									<div class="flex flex-row">
										<div class="flex flex-col w-full">
											<div class="link-container">
												<p class="mr-2 font-cascadia-code">/</p>
												<input
													style="color : {link.color}"
													class="edit-input rounded w-full"
													type="text"
													placeholder="Name"
													bind:value={link.name}
												/>
											</div>
											<div class="link-container">
												<p class="mr-2 font-cascadia-code">#</p>
												<input
													class="edit-input rounded w-full"
													style="color :{link.color}"
													type="text"
													placeholder="Color"
													bind:value={link.color}
												/>
											</div>
											<div class="link-container">
												<p class="mr-2 font-cascadia-code">@</p>
												<input
													placeholder="Link"
													class="edit-input rounded w-full"
													type="text"
													bind:value={link.href}
												/>
											</div>
										</div>
										<div class="flex flex-col items-center w-min justify-center ml-2">
											<button class="my-1" on:click={() => linksTable.swapOrder(i, i - 1)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12V16H11V12H8L12 8L16 12H13Z"
													></path></svg
												></button
											>
											<button
												on:click={() =>
													handleDelete(() => linksTable.deleteEntry(i), {
														name: link.name,
														href: link.href,
														color: link.color
													})}
												><svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"
													></path></svg
												></button
											>
											<button class="my-1" on:click={() => linksTable.swapOrder(i, i + 1)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z"
													></path></svg
												></button
											>
										</div>
									</div>
								</div>
							{/each}
							<GenericButton
								text={'+'}
								inputFunction={() => linksTable.createNew()}
								extraClasses={'text-xl'}
							/>
						</div>
					{/if}
				</div>
				<div class="projects-root">
					<div class="flex flex-row items-center">
						<p class=" container-title-text font-cascadia-code">/Projects</p>
						<button on:click={() => (projectsReady = !projectsReady)}>
							{#if !projectsReady}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"
									></path></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM7 11H17V13H7V11Z"
									></path></svg
								>
							{/if}
						</button>
						{#if projectsReady}
							<button on:click={() => projectsTable.createNew()}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="32"
									height="32"
									fill="currentColor"
									><path
										d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM4 5V19H20V7H11.5858L9.58579 5H4ZM11 12V9H13V12H16V14H13V17H11V14H8V12H11Z"
									></path></svg
								>
							</button>
						{/if}
					</div>
					{#if projectsReady}
						<div
							in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
							out:fly={{ y: 100, duration: 500, easing: cubicOut }}
						>
							{#each $projectsTable as project, i (project.uid)}
								<div
									animate:flip={{ duration: 200, easing: cubicOut }}
									class="border rounded-md border-white p-3 m-2"
								>
									<div class="flex flex-row">
										<div class="flex flex-col w-full">
											<div class="flex flex-row w-full">
												<div class="link-container w-1/2" style="color : #FACC15">
													<p class="mr-2 font-cascadia-code">/</p>
													<input
														class="edit-input rounded w-full"
														style="color : #FACC15"
														type="text"
														placeholder="Name"
														bind:value={project.name}
													/>
												</div>
												<div class="link-container w-1/2">
													<p class="mr-2 font-cascadia-code">@</p>
													<input
														class="edit-input rounded w-full"
														type="text"
														placeholder="Link"
														bind:value={project.href}
													/>
												</div>
											</div>
											<div class="flex flex-col">
												<p class="font-cascadia-code">description</p>
												<textarea
													class="edit-input rounded w-full h-auto"
													bind:value={project.description}
													placeholder="Description"
													on:input={resizeTextArea}
												/>
											</div>
										</div>
										<div class="flex flex-col items-center w-min justify-center ml-2">
											<button class="mb-1" on:click={() => projectsTable.swapOrder(i, i - 1)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12V16H11V12H8L12 8L16 12H13Z"
													></path></svg
												></button
											>
											<button
												on:click={() =>
													handleDelete(() => projectsTable.deleteEntry(i), {
														name: project.name,
														href: project.href,
														description: project.description
													})}
												><svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"
													></path></svg
												></button
											>
											<button class="mt-1" on:click={() => projectsTable.swapOrder(i, i + 1)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													width="32"
													height="32"
													fill="currentColor"
													><path
														d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12H16L12 16L8 12H11V8H13V12Z"
													></path></svg
												></button
											>
										</div>
									</div>
								</div>
							{/each}
							<div class="border rounded-md border-white m-2 text-center">
								<GenericButton
									text={'+'}
									inputFunction={() => projectsTable.createNew()}
									extraClasses={'text-xl'}
								/>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if isDeleteMenuActive}
			<div
				class="bg-black bg-opacity-80 fixed w-screen h-screen z-10 top-0 left-0 text-white flex items-center justify-center"
				in:fade={{ duration: 200, easing: cubicInOut }}
				out:fade={{ duration: 200, easing: cubicInOut }}
			>
				<div class="z-20 flex flex-col font-cascadia-code text-center">
					<p class="mb-10 text-3xl z-20">Are you sure you want to delete</p>
					{#each Object.values(deleteMenuData) as value}
						<p class="my-2">{value}</p>
					{/each}
					<div class="mt-10 flex flex-row h-10 space-x-2 my-5">
						<GenericButton
							text={'No'}
							inputFunction={cancelDelete}
							extraClasses={'text-xl'}
						/><GenericButton text={'Yes'} inputFunction={doDelete} />
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex h-screen items-center justify-center overflow-hidden text-center flex-col">
			<p class="font-cascadia-code text-3xl bouncy-animation">
				NAH BRUH you aint the admin bruh GETCHO ASS OUTTA HERE <span class="emoji-font"
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
	<div class="flex h-screen items-center justify-center overflow-hidden">
		<SignIn provider="discord">
			<div slot="submitButton" class="buttonPrimary">
				<button
					class="flex items-center border-2 rounded-full border-white hover:bg-gray-900"
					style="padding: 5rem;"
				>
					<svg
						width="20rem"
						height="20rem"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						><path
							d="M19.3034 5.33716C17.9344 4.71103 16.4805 4.2547 14.9629 4C14.7719 4.32899 14.5596 4.77471 14.411 5.12492C12.7969 4.89144 11.1944 4.89144 9.60255 5.12492C9.45397 4.77471 9.2311 4.32899 9.05068 4C7.52251 4.2547 6.06861 4.71103 4.70915 5.33716C1.96053 9.39111 1.21766 13.3495 1.5891 17.2549C3.41443 18.5815 5.17612 19.388 6.90701 19.9187C7.33151 19.3456 7.71356 18.73 8.04255 18.0827C7.41641 17.8492 6.82211 17.5627 6.24904 17.2231C6.39762 17.117 6.5462 17.0003 6.68416 16.8835C10.1438 18.4648 13.8911 18.4648 17.3082 16.8835C17.4568 17.0003 17.5948 17.117 17.7434 17.2231C17.1703 17.5627 16.576 17.8492 15.9499 18.0827C16.2789 18.73 16.6609 19.3456 17.0854 19.9187C18.8152 19.388 20.5875 18.5815 22.4033 17.2549C22.8596 12.7341 21.6806 8.80747 19.3034 5.33716ZM8.5201 14.8459C7.48007 14.8459 6.63107 13.9014 6.63107 12.7447C6.63107 11.5879 7.45884 10.6434 8.5201 10.6434C9.57071 10.6434 10.4303 11.5879 10.4091 12.7447C10.4091 13.9014 9.57071 14.8459 8.5201 14.8459ZM15.4936 14.8459C14.4535 14.8459 13.6034 13.9014 13.6034 12.7447C13.6034 11.5879 14.4323 10.6434 15.4936 10.6434C16.5442 10.6434 17.4038 11.5879 17.3825 12.7447C17.3825 13.9014 16.5548 14.8459 15.4936 14.8459Z"
						></path></svg
					>
				</button>
			</div>
		</SignIn>
	</div>
{/if}

<style>
	.link-root {
		width: 28rem;
		margin-bottom: 1rem;
	}

	.projects-root {
		width: 56rem;
		margin-bottom: 1rem;
	}

	.link-container {
		display: flex;
		flex-direction: row;
		margin: 0.2rem;
	}

	.edit-input {
		font-family: 'Cascadia Code', sans-serif;
		color: white;
		background-color: black;
		border: 0.1rem solid white;
		padding-left: 0.1rem;
	}

	.bouncy-animation {
		animation: bouncy 1s linear infinite;
	}

	@keyframes bouncy {
		0% {
			transform: scale(0.5, 0.5);
		}
		50% {
			transform: scale(1, 1);
		}
		100% {
			transform: scale(0.5, 0.5);
		}
	}
</style>
