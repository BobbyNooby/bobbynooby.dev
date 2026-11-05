<script lang="ts">
	let {
		unsaved,
		problems,
		saving,
		ondiscard
	}: { unsaved: number; problems: number; saving: boolean; ondiscard: () => void } = $props();
</script>

<span class="cz-dirty" class:on={unsaved > 0}>
	{#if saving}
		saving…
	{:else if unsaved > 0}
		● {unsaved} unsaved
	{:else}
		all saved
	{/if}
	{#if problems > 0}<span class="bad"> · fix {problems} first</span>{/if}
</span>
<button type="button" class="btn" disabled={!unsaved || saving} onclick={ondiscard}>discard</button>
<button type="submit" form="cz-save" class="btn go" disabled={!unsaved || problems > 0 || saving}
	>save</button
>
