<script lang="ts">
	import GenericButton from '$lib/components/ui/GenericButton.svelte';
	import { SignOut } from '@auth/sveltekit/components';

	// Shown to someone signed in with Discord who is not on the admin list.
	let { text }: { text: string } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center overflow-hidden text-center">
	<p class="font-cascadia-code bouncy-animation text-3xl">
		{text} <span class="emoji-font">🗣🗣🗣🔥🔥🔥💯💯🤣🤣🤣🫵🫵🫵🫵</span>
	</p>
	<SignOut
		><div slot="submitButton" class="buttonPrimary">
			<GenericButton text={'Sign Out'} extraClasses={'text-2xl m-10'} />
		</div></SignOut
	>
</div>

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
