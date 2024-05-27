<script lang="ts">
	import type { projectsSchema } from '$lib/types/projectsSchema';

	export let projects: projectsSchema[];
</script>

<p class="container-title-text">/Projects</p>
{#each projects as project}
	<div class="my-4">
		<p style="text-indent: 1em;" class="text-yellow-400 text-xl">
			<a href={project.href} target="_blank">/{project.name}</a>
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
