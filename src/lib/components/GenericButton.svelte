<script lang="ts">
	export let text: string,
		inputFunction: () => any = () => {},
		buttonType: 'submit' | 'reset' | 'button' = 'button',
		extraClasses: string = '';
</script>

<button
	type={buttonType}
	style="border-width: 0.1rem;"
	class="{extraClasses} p-1 font-cascadia-code w-full h-full bg-black hover:bg-gray-800 border-white rounded-md"
	on:click={inputFunction}>{text}</button
>
