<script lang="ts">
	import { enhance } from '$app/forms';
	import 'remixicon/fonts/remixicon.css';
	import { flip } from 'svelte/animate';
	import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import { page } from '$app/state';
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { toast } from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import { OrderedTable } from '$lib/admin/orderedTable.svelte';
	import { ThreeByThreeCollection } from '$lib/admin/threeByThreeList.svelte';
	import DiscordLoginBall from '$lib/components/DiscordLoginBall.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	let { data }: { data: PageServerData } = $props();

	const linksTable = new OrderedTable(data.links);
	let linksReady = $state(false);

	const projectsTable = new OrderedTable(data.projects);
	let projectsReady = $state(false);

	const all3x3Data = new ThreeByThreeCollection(data.all3x3Data);
	let all3x3Visible = $state(false);

	function addLink() {
		linksTable.createNew({ label: 'None', href: 'https://bobbynooby.dev', color: '#FFFFFF' });
	}

	function addProject() {
		projectsTable.createNew({
			title: 'None',
			description: 'None',
			href: 'https://bobbynooby.dev'
		});
	}

	// The delete is captured by uid (resolved inside the table on confirm), so
	// reordering rows while the dialog is open cannot delete the wrong one.
	let pendingDelete = $state<{ run: () => void; summary: string[] } | null>(null);

	function handleDelete(run: () => void, summary: string[]) {
		pendingDelete = { run, summary };
	}

	function doDelete() {
		pendingDelete?.run();
		pendingDelete = null;
	}

	function cancelDelete() {
		pendingDelete = null;
	}

	function resizeTextArea(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}
</script>

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
								const message =
									result.data && typeof result.data === 'object' && 'message' in result.data
										? String(result.data.message)
										: 'Error updating data!';
								toast.error(message, {
									style: "font-family : 'Cascadia Code', sans-serif;"
								});
							}
						};
					}}
				>
					<input
						type="hidden"
						name="linksTable"
						value={JSON.stringify(linksTable.items)}
						required
					/>
					<input
						type="hidden"
						name="projectsTable"
						value={JSON.stringify(projectsTable.items)}
						required
					/>
					<input
						type="hidden"
						name="all3x3Data"
						value={JSON.stringify(all3x3Data.groups)}
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
					<button onclick={() => (linksReady = !linksReady)}>
						{#if !linksReady}
							<Icon name="add-box" />
						{:else}
							<Icon name="minus-box" />
						{/if}
					</button>
					{#if linksReady}
						<button aria-label="add" onclick={addLink}>
							<Icon name="folder-add" />
						</button>
					{/if}
				</div>
				{#if linksReady}
					<div
						in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
						out:fly={{ y: 100, duration: 500, easing: cubicOut }}
					>
						{#each linksTable.items as link, i (link.uid)}
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
											<Icon name="arrow-up-circle" /></button
										>
										<button
											aria-label="delete"
											onclick={() =>
												handleDelete(
													() => linksTable.deleteByUid(link.uid),
													[link.label, link.href, link.color]
												)}><Icon name="delete-bin" /></button
										>
										<button
											aria-label="down"
											class="my-1"
											onclick={() => linksTable.swapOrder(i, i + 1)}
										>
											<Icon name="arrow-down-circle" /></button
										>
									</div>
								</div>
							</div>
						{/each}
						<GenericButton text={'+'} inputFunction={addLink} extraClasses={'text-xl'} />
					</div>
				{/if}
			</div>
			<div class="projects-root">
				<div class="flex flex-row items-center">
					<p class=" container-title-text font-cascadia-code">/Projects</p>
					<button onclick={() => (projectsReady = !projectsReady)}>
						{#if !projectsReady}
							<Icon name="add-box" />
						{:else}
							<Icon name="minus-box" />
						{/if}
					</button>
					{#if projectsReady}
						<button aria-label="add" onclick={addProject}>
							<Icon name="folder-add" />
						</button>
					{/if}
				</div>
				{#if projectsReady}
					<div
						in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
						out:fly={{ y: 100, duration: 500, easing: cubicOut }}
					>
						{#each projectsTable.items as project, i (project.uid)}
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
											<Icon name="arrow-up-circle" /></button
										>
										<button
											aria-label="delete"
											onclick={() =>
												handleDelete(
													() => projectsTable.deleteByUid(project.uid),
													[project.title, project.href, project.description]
												)}><Icon name="delete-bin" /></button
										>
										<button
											aria-label="down"
											class="mt-1"
											onclick={() => projectsTable.swapOrder(i, i + 1)}
										>
											<Icon name="arrow-down-circle" /></button
										>
									</div>
								</div>
							</div>
						{/each}
						<div class="m-2 rounded-md border border-white text-center">
							<GenericButton text={'+'} inputFunction={addProject} extraClasses={'text-xl'} />
						</div>
					</div>
				{/if}
			</div>
			<div class="all3x3-root">
				<div class="flex flex-row items-center">
					<p class=" container-title-text font-cascadia-code">/3x3s</p>
					<button onclick={() => (all3x3Visible = !all3x3Visible)}>
						{#if !all3x3Visible}
							<Icon name="add-box" />
						{:else}
							<Icon name="minus-box" />
						{/if}
					</button>
				</div>
				{#if all3x3Visible}
					<div
						in:fly={{ y: 100, duration: 500, easing: cubicOut, delay: 100 }}
						out:fly={{ y: 100, duration: 500, easing: cubicOut }}
					>
						{#each all3x3Data.groups as list, i (list.label)}
							<div animate:flip={{ duration: 200, easing: cubicOut }} class="m-2 p-3">
								<div class="flex flex-row items-center">
									<p class=" container-title-text font-cascadia-code">
										/{list.label}
									</p>
									<button onclick={() => all3x3Data.toggle(list.label)}>
										{#if !list.visible}
											<Icon name="add-box" />
										{:else}
											<Icon name="minus-box" />
										{/if}
									</button>
									{#if list.visible}
										<button aria-label="add" onclick={() => all3x3Data.createNew(list.label)}>
											<Icon name="folder-add" />
										</button>
									{/if}
								</div>
								{#if list.visible}
									{#each list.entries.items as entry, i (entry.uid)}
										<div
											class="font-cascadia-code threebythree-entry my-4 flex flex-col space-y-2 rounded-md border border-white p-4"
										>
											<div class="flex w-full flex-row">
												<div class="flex w-full flex-col space-y-2">
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
												<div class="ml-2 flex w-min flex-col items-center justify-center">
													<button
														aria-label="up"
														class="my-1"
														onclick={() => all3x3Data.swapOrder(list.label, i, i - 1)}
													>
														<Icon name="arrow-up-circle" /></button
													>
													<button
														aria-label="delete"
														onclick={() =>
															handleDelete(
																() => all3x3Data.deleteByUid(list.label, entry.uid),
																[entry.id, entry.label]
															)}><Icon name="delete-bin" /></button
													>
													<button
														aria-label="down"
														class="my-1"
														onclick={() => all3x3Data.swapOrder(list.label, i, i + 1)}
													>
														<Icon name="arrow-down-circle" /></button
													>
												</div>
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

	{#if pendingDelete}
		<div
			class="bg-opacity-80 fixed top-0 left-0 z-10 flex h-screen w-screen items-center justify-center bg-black text-white"
			in:fade={{ duration: 200, easing: cubicInOut }}
			out:fade={{ duration: 200, easing: cubicInOut }}
		>
			<div class="font-cascadia-code z-20 flex flex-col text-center">
				<p class="z-20 mb-10 text-3xl">Are you sure you want to delete</p>
				{#each pendingDelete.summary as value}
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
{:else if page.data.session}
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
