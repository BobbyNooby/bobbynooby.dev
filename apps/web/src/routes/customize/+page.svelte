<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CustomizeState } from '$lib/admin/customize.svelte';
	import DiscordLoginBall from '$lib/components/DiscordLoginBall.svelte';
	import GenericButton from '$lib/components/GenericButton.svelte';
	import GridPane from '$lib/components/customize/GridPane.svelte';
	import LinksPane from '$lib/components/customize/LinksPane.svelte';
	import ProjectsPane from '$lib/components/customize/ProjectsPane.svelte';
	import SaveControls from '$lib/components/customize/SaveControls.svelte';
	import SteamPane from '$lib/components/customize/SteamPane.svelte';
	import '$lib/components/customize/customize.css';
	import '$lib/components/os/os.css';
	import { SignOut } from '@auth/sveltekit/components';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { SvelteSet } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	type Tab = 'links' | 'projects' | 'grid' | 'steam';
	const TABS: [Tab, string][] = [
		['links', '1 links'],
		['projects', '2 projects'],
		['grid', '3 3x3'],
		['steam', '4 steam']
	];

	// The editor owns its copy of the data from here on; reloads after a save
	// only refresh the covers and the Steam list.
	const cz = new CustomizeState(data);
	const hidden = new SvelteSet<number>(data.steamHidden);
	let tab = $state<Tab>('links');
	let saving = $state(false);
	const payload = $derived(cz.payload());

	let dialog = $state<HTMLDialogElement>();
	let pendingLeave: (() => void) | null = null;
	let leaving = false;

	function confirmLeave(go: () => void) {
		pendingLeave = go;
		dialog?.showModal();
	}

	function leaveAnyway() {
		dialog?.close();
		leaving = true;
		pendingLeave?.();
	}

	beforeNavigate((nav) => {
		if (leaving || cz.unsaved === 0) return;
		// Closing the tab or reloading: cancelling asks the browser to show its own prompt.
		if (nav.type === 'leave') return nav.cancel();
		const to = nav.to?.url;
		if (!to || to.pathname === page.url.pathname) return;
		nav.cancel();
		confirmLeave(() => goto(to));
	});

	const save: SubmitFunction = ({ cancel }) => {
		if (cz.unsaved === 0 || cz.problems > 0) return cancel();
		saving = true;
		return async ({ result, update }) => {
			saving = false;
			if (result.type === 'success') {
				cz.markSaved();
				cz.notify('saved');
				// Picks up covers for any new AniList ids the save just cached.
				await update({ reset: false });
			} else if (result.type === 'failure') {
				cz.notify(String(result.data?.message ?? 'save failed'), { bad: true });
			} else if (result.type === 'error') {
				cz.notify('save failed: ' + (result.error?.message ?? 'server error'), { bad: true });
			}
		};
	};

	const signOut: SubmitFunction = ({ cancel, formElement }) => {
		if (leaving || cz.unsaved === 0) return;
		cancel();
		confirmLeave(() => formElement.requestSubmit());
	};

	function onkeydown(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey || e.altKey || dialog?.open) return;
		const target = e.target as HTMLElement;
		if (target.closest('input, textarea, select, [contenteditable]')) return;
		const next = TABS[Number(e.key) - 1];
		if (next) tab = next[0];
	}
</script>

<svelte:window {onkeydown} />

{#if data.isSessionValid}
	<div class="os cz">
		<header class="bar">
			<a class="brand" href="/">&gt;bobbynooby<b>.dev</b></a>
			<span class="cz-crumb">~/customize</span>
			<nav class="ws" aria-label="Sections">
				{#each TABS as [key, label] (key)}
					<button type="button" class="wsb" aria-pressed={tab === key} onclick={() => (tab = key)}
						>{label}</button
					>
				{/each}
			</nav>
			<div class="cz-right">
				<div class="cz-save">
					<SaveControls
						unsaved={cz.unsaved}
						problems={cz.problems}
						{saving}
						ondiscard={() => cz.discard()}
					/>
				</div>
				<div class="cz-acct">
					<span class="mut">{page.data.session?.user?.name ?? 'admin'}</span>
					<a href="/">home</a>
					<form method="POST" action="/signout" use:enhance={signOut}>
						<button type="submit" class="cz-linkbtn">sign out</button>
					</form>
				</div>
			</div>
		</header>

		<main class="cz-main">
			{#if tab === 'links'}
				<LinksPane {cz} />
			{:else if tab === 'projects'}
				<ProjectsPane {cz} />
			{:else if tab === 'grid'}
				<GridPane {cz} covers={data.covers} />
			{:else}
				<SteamPane
					games={data.steam.games}
					lastRefresh={data.steam.lastRefresh}
					{hidden}
					notify={(text, options) => cz.notify(text, options)}
				/>
			{/if}
		</main>

		<div class="cz-mbar">
			<SaveControls
				unsaved={cz.unsaved}
				problems={cz.problems}
				{saving}
				ondiscard={() => cz.discard()}
			/>
		</div>

		<form id="cz-save" method="POST" action="?/update" hidden use:enhance={save}>
			<input type="hidden" name="linksTable" value={payload.linksTable} />
			<input type="hidden" name="projectsTable" value={payload.projectsTable} />
			<input type="hidden" name="all3x3Data" value={payload.all3x3Data} />
		</form>

		<div class="cz-toasts" aria-live="polite">
			{#if cz.toast}
				<div class="cz-toast" class:bad={cz.toast.bad} transition:fly={{ y: 8, duration: 180 }}>
					<span>{cz.toast.text}</span>
					{#if cz.toast.undo}
						<button type="button" onclick={() => cz.undo()}>undo</button>
					{/if}
				</div>
			{/if}
		</div>

		<dialog class="cz-dialog" bind:this={dialog} aria-labelledby="cz-leave">
			<p id="cz-leave">
				You have {cz.unsaved} unsaved change{cz.unsaved === 1 ? '' : 's'}. Leave without saving?
			</p>
			<div>
				<button type="button" class="btn" onclick={() => dialog?.close()}>stay</button>
				<button type="button" class="btn" onclick={leaveAnyway}>leave anyway</button>
			</div>
		</dialog>
	</div>
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
