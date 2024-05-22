<script lang="ts">
	export let text: string = 'None';
	export let tailwindcss: string = '';

	let containerWidth = 0;
	let textWidth = 0;
	let duration = 10;
	let isOverflowing = false;

	$: {
		if (textWidth > containerWidth) {
			isOverflowing = true;
			duration = (textWidth / containerWidth) * 10; // Adjust duration based on text length
		} else {
			isOverflowing = false;
		}
	}
</script>

<div class="scrolling-container" bind:clientWidth={containerWidth}>
	<div
		class={`scrolling-text ${isOverflowing ? 'is-overflowing' : ''} ${tailwindcss}`}
		bind:clientWidth={textWidth}
		style="animation-duration: {duration}s;"
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
		transition: transform 0.5s ease;
	}

	.is-overflowing {
		animation: scroll linear infinite;
	}

	@keyframes scroll {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
</style>
