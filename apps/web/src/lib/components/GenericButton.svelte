<script lang="ts">
	let {
		text = '',
		inputFunction = () => {},
		buttonType = 'button',
		extraClasses = '',
		fontClass = 'font-cascadia-code'
	}: {
		text?: string;
		inputFunction?: () => any;
		buttonType?: 'submit' | 'reset' | 'button';
		extraClasses?: string;
		fontClass?: string;
	} = $props();
</script>

<button
	type={buttonType}
	style="border-width: 0.1rem;"
	class="{extraClasses} p-1 {fontClass} h-full w-full rounded-md border-white bg-black hover:bg-gray-800"
	onclick={inputFunction}>{text}</button
>
