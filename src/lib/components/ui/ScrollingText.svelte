<script lang="ts">
	let {
		text = 'None',
		tailwindcss = '',
		rightToLeft = false
	}: {
		text?: string;
		tailwindcss?: string;
		rightToLeft?: boolean;
	} = $props();

	let containerWidth = $state(0);
	let textWidth = $state(0);
	const isOverflowing = $derived(textWidth > containerWidth);
	const duration = $derived(isOverflowing ? (textWidth / containerWidth) * 10 : 10);
</script>

<div class="scrolling-container" bind:clientWidth={containerWidth}>
	<div
		class={`scrolling-text ${isOverflowing ? (rightToLeft ? 'is-overflowing-right-to-left' : 'is-overflowing-left-to-right') : ''} ${tailwindcss}`}
		bind:clientWidth={textWidth}
		style="animation-duration: {duration}s; animation-timing-function: steps({duration * 24}, end);"
	>
		{text}
	</div>
</div>

<style>
	.scrolling-container {
		overflow: hidden;
		white-space: nowrap;
		width: 100%;
		box-sizing: border-box;
		position: relative;
	}

	.scrolling-text {
		display: inline-block;
	}

	.is-overflowing-left-to-right {
		animation: scroll-left-to-right linear infinite;
	}

	.is-overflowing-right-to-left {
		animation: scroll-right-to-left linear infinite;
	}

	@keyframes scroll-left-to-right {
		0% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(-100%);
		}
	}

	@keyframes scroll-right-to-left {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
</style>
