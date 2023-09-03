<script>
	import LoginCard from '$lib/components/LoginCard.svelte';
	import CreateCard from './CreateCard.svelte';

	export let data;
</script>

<div class="px-4 md:px-7 py-4 w-full min-h-full">
	{#if data.session}
		<CreateCard />
	{:else}
		<LoginCard />
	{/if}
</div>
