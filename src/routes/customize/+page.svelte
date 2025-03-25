<script lang="ts">
	import { enhance } from '$app/forms';
	import 'remixicon/fonts/remixicon.css';
	import { createLinksTable } from '$lib/admin/linksTable';
	import { flip } from 'svelte/animate';
	import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { createProjectsTable } from '$lib/admin/projectsTable';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import { page } from '$app/state';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import { createThreeByThreeList } from '$lib/admin/threeByThreeList';
	import DiscordLoginBall from '$lib/components/DiscordLoginBall.svelte';

	let { data }: { data: PageServerData } = $props();

	const linksTable = createLinksTable(data.links);
	let linksReady = $state(false);

	const projectsTable = createProjectsTable(data.projects);
	let projectsReady = $state(false);

	const all3x3Data = createThreeByThreeList(data.all3x3Data);
	let all3x3Visible = $state(false);
	let allThreeData = $state(all3x3Data.getData());

	let isDeleteMenuActive = $state(false);
	let deleteMenuData: {} = $state({ none: 'None' });
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
</script>

{#if page.data.session}
	{#if data.isSessionValid}
		<div class="z-0 mt-5 flex flex-col">
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
						<input type="hidden" name="all3x3Data" value={JSON.stringify(allThreeData)} required />
						<GenericButton
							buttonType={'submit'}
							text={'Update'}
							inputFunction={() => {
								allThreeData = all3x3Data.getData();
							}}
						/>
					</form>
					<div>
						<GenericButton text={'Home'} inputFunction={() => goto('/')} />
					</div>
				</div>
				<div class="link-root">
					<div class="flex flex-row items-center">
						<p class=" container-title-text font-cascadia-code">/Links</p>
						<button onclick={() => (linksReady = !linksReady)}>
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
							<button aria-label="add" onclick={() => linksTable.createNew()}>
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
									class="link-entry m-2 rounded-md border border-white p-3"
								>
									<div class="flex flex-row">
										<div class="flex w-full flex-col">
											<div class="link-container">
												<p class="font-cascadia-code mr-2">/</p>
												<input
													style="color : {link.color}"
													class="edit-input w-full rounded"
													type="text"
													placeholder="Name"
													bind:value={link.label}
												/>
											</div>
											<div class="link-container">
												<p class="font-cascadia-code mr-2">#</p>
												<input
													class="edit-input w-full rounded"
													style="color :{link.color}"
													type="text"
													placeholder="Color"
													bind:value={link.color}
												/>
											</div>
											<div class="link-container">
												<p class="font-cascadia-code mr-2">@</p>
												<input
													placeholder="Link"
													class="edit-input w-full rounded"
													type="text"
													bind:value={link.href}
												/>
											</div>
										</div>
										<div class="ml-2 flex w-min flex-col items-center justify-center">
											<button
												aria-label="up"
												class="my-1"
												onclick={() => linksTable.swapOrder(i, i - 1)}
											>
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
												aria-label="delete"
												onclick={() =>
													handleDelete(() => linksTable.deleteEntry(i), {
														name: link.label,
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
											<button
												aria-label="down"
												class="my-1"
												onclick={() => linksTable.swapOrder(i, i + 1)}
											>
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
						<button onclick={() => (projectsReady = !projectsReady)}>
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
							<button aria-label="add" onclick={() => projectsTable.createNew()}>
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
									class="projects-entry m-2 rounded-md border border-white p-3"
								>
									<div class="flex flex-row">
										<div class="flex w-full flex-col">
											<div class="flex w-full flex-row">
												<div class="link-container w-1/2" style="color : #FACC15">
													<p class="font-cascadia-code mr-2">/</p>
													<input
														class="edit-input w-full rounded"
														style="color : #FACC15"
														type="text"
														placeholder="Name"
														bind:value={project.title}
													/>
												</div>
												<div class="link-container w-1/2">
													<p class="font-cascadia-code mr-2">@</p>
													<input
														class="edit-input w-full rounded"
														type="text"
														placeholder="Link"
														bind:value={project.href}
													/>
												</div>
											</div>
											<div class="flex flex-col">
												<p class="font-cascadia-code">Description</p>
												<textarea
													class="edit-input h-auto w-full rounded"
													bind:value={project.description}
													placeholder="Description"
													oninput={resizeTextArea}
												></textarea>
											</div>
										</div>
										<div class="ml-2 flex w-min flex-col items-center justify-center">
											<button
												aria-label="up"
												class="mb-1"
												onclick={() => projectsTable.swapOrder(i, i - 1)}
											>
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
												aria-label="delete"
												onclick={() =>
													handleDelete(() => projectsTable.deleteEntry(i), {
														name: project.title,
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
											<button
												aria-label="down"
												class="mt-1"
												onclick={() => projectsTable.swapOrder(i, i + 1)}
											>
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
							<div class="m-2 rounded-md border border-white text-center">
								<GenericButton
									text={'+'}
									inputFunction={() => projectsTable.createNew()}
									extraClasses={'text-xl'}
								/>
							</div>
						</div>
					{/if}
				</div>
				<div class="all3x3-root">
					<div class="flex flex-row items-center">
						<p class=" container-title-text font-cascadia-code">/3x3s</p>
						<button onclick={() => (all3x3Visible = !all3x3Visible)}>
							{#if !all3x3Visible}
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
					</div>
					{#if all3x3Visible}
						<div
							in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
							out:fly={{ y: 100, duration: 500, easing: cubicOut }}
						>
							{#each $all3x3Data as threeByThreeList, i (threeByThreeList)}
								<div animate:flip={{ duration: 200, easing: cubicOut }} class="m-2 p-3">
									<div class="flex flex-row items-center">
										<p class=" container-title-text font-cascadia-code">
											/{threeByThreeList.label}
										</p>
										<button onclick={() => all3x3Data.toggle(threeByThreeList.label)}>
											{#if !threeByThreeList.visible}
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
									</div>
									{#if threeByThreeList.visible}
										{#each threeByThreeList.data as entry}
											<div
												class="font-cascadia-code threebythree-entry my-4 flex flex-col space-y-2 rounded-md border border-white p-4"
											>
												<div class="flex flex-row space-x-2">
													<p>Id</p>
													<input
														class=" edit-input w-full rounded"
														bind:value={entry.id}
														placeholder="Id"
													/>
												</div>
												<div class="flex flex-row space-x-2">
													<p>Label</p>
													<input
														class=" edit-input w-full rounded"
														bind:value={entry.label}
														placeholder="Label"
													/>
												</div>
												<div class="flex flex-row space-x-2">
													<p>Score</p>
													<input
														class=" edit-input w-full rounded"
														bind:value={entry.bobscore}
														placeholder="Score"
													/>
												</div>
												<div class="flex flex-row space-x-2">
													<p>Review</p>
													<textarea
														class=" edit-input h-32 w-full rounded"
														bind:value={entry.review}
														placeholder="Review"
													></textarea>
												</div>
											</div>
										{/each}
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if isDeleteMenuActive}
			<div
				class="bg-opacity-80 fixed top-0 left-0 z-10 flex h-screen w-screen items-center justify-center bg-black text-white"
				in:fade={{ duration: 200, easing: cubicInOut }}
				out:fade={{ duration: 200, easing: cubicInOut }}
			>
				<div class="font-cascadia-code z-20 flex flex-col text-center">
					<p class="z-20 mb-10 text-3xl">Are you sure you want to delete</p>
					{#each Object.values(deleteMenuData) as value}
						<p class="my-2">{value}</p>
					{/each}
					<div class="my-5 mt-10 flex h-10 flex-row space-x-2">
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
		<div class="flex h-screen flex-col items-center justify-center overflow-hidden text-center">
			<p class="font-cascadia-code bouncy-animation text-3xl">
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
	<DiscordLoginBall />
{/if}

<style>
	.link-root {
		width: auto;
		margin-bottom: 1rem;
	}

	.link-entry {
		width: 28rem;
	}

	.projects-root {
		width: auto;
		margin-bottom: 1rem;
	}

	.projects-entry {
		width: 56rem;
	}

	.all3x3-root {
		width: auto;
		margin-bottom: 1rem;
	}

	.threebythree-entry {
		width: 56rem;
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
