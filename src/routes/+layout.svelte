<script>
	import { navigating } from '$app/stores';
	import Icon from '@iconify/svelte';
	import '../app.postcss';
	import Navbar from './Navbar.svelte';
	import ShowAfter from '$lib/components/ShowAfter.svelte';
	import { Button } from '$lib/components/ui/button';

	let loading = true;

	$: loading = Boolean($navigating);
</script>

{#if loading}
	<div class="fixed top-0 left-0 w-full h-full flex-center flex-col backdrop-blur-md z-[3]">
		<Icon class="text-3xl" icon="svg-spinners:6-dots-rotate" />
		<ShowAfter after={5000}>
			<div class="flex flex-col my-3 gap-2">
				<p class="text-muted-foreground text-sm">Taking too much time?</p>
				<Button size="sm" on:click={() => location.reload()}>Reload</Button>
			</div>
		</ShowAfter>
	</div>
{/if}

<div class="flex w-full min-h-screen flex-row-reverse max-md:flex-col">
	<div class="flex-grow overflow-auto">
		<slot />
	</div>
	<div class="sticky bottom-0">
		<Navbar />
	</div>
</div>
