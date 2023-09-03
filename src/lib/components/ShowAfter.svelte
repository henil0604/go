<script lang="ts">
	import { onMount } from 'svelte';

	export let after: number;

	let show = false;

	onMount(() => {
		setTimeout(() => {
			show = true;
		}, after);
	});
</script>

{#if show === true}
	<slot />
{/if}
