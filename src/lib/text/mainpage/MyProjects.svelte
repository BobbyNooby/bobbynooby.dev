<script lang="ts">
	const projects: { name: string; description: string; href: string }[] = [
		{
			name: 'Arcane Odyssey Tools',
			description: 'A website used to plan armor sets for a game called Arcane Odyssey on Roblox.',
			href: 'https://github.com/BobbyNooby/AOGearBuilder/'
		},
		{
			name: 'Arcane Odyssey API',
			description:
				'A simple API to allow users to interact with the database used in Arcane Odyssey Tools.',
			href: 'https://github.com/BobbyNooby/arcane-odyssey-api'
		}
	];
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
