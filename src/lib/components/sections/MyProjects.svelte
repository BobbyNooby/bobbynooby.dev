<script lang="ts">
	import type { Project } from '$lib/db/mongoTypes';

	let { projects }: { projects: Project[] } = $props();
</script>

<p class="container-title-text">/Projects</p>
{#each projects as project}
	<div class="my-4">
		<p style="text-indent: 1em;" class="text-xl text-yellow-400">
			<a href={project.href} target="_blank">/{project.title}</a>
		</p>
		<p class="mx-2">
			{project.description}
			<a
				class="text-yellow-400"
				style="text-decoration: underline;"
				href={project.href}
				target="_blank">Link</a
			>
		</p>
	</div>
{/each}
