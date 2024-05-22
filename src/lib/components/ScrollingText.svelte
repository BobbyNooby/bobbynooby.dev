<script lang="ts">
	export let text: string = 'None';
	export let tailwindcss: string = '';
	export let rightToLeft: boolean = false;

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
		class={`scrolling-text ${isOverflowing ? (rightToLeft ? 'is-overflowing-right-to-left' : 'is-overflowing-left-to-right') : ''} ${tailwindcss}`}
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
