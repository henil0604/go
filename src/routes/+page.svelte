<script lang="ts">
	import { goto } from '$app/navigation';
	import LoginCard from '$lib/components/LoginCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	export let data;
</script>

<div class="px-4 md:px-7 py-4 w-full min-h-full">
	{#if !data.session}
		<LoginCard text="You are not logged in!" />
	{:else if data.links && data.links.length > 0}
		<h1 class="text-xl font-semibold">Your Links</h1>
		<hr class="my-2" />
		<div class="grid your-links-list gap-3">
			{#each data.links as link}
				<Card.Root class="hover:bg-accent cursor-pointer transition-colors">
					<Card.Content on:click={() => goto(`/l/${link.id}`)} class="px-3 py-3">
						<div>{location.origin}/{link.id}</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<div class="flex-center flex-col gap-2">
			<h1 class="text-xl font-semibold">You have not created any links yet!</h1>
			<Button href="/create" size="sm">Create +</Button>
		</div>
	{/if}
</div>

<style scoped>
	.your-links-list {
		grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
	}
</style>
