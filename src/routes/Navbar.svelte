<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	const items = [
		{
			icon: 'material-symbols:dashboard-outline',
			name: 'Dashboard',
			href: '/'
		},
		{
			icon: 'mdi:plus',
			name: 'Create',
			href: '/create'
		}
	];
</script>

<div class="flex md:flex-col border-t md:border-r md:h-full">
	<div class="flex-center max-md:hidden">
		<h1 class="text-xl font-semibold p-3">Go</h1>
		<div class="font-thin text-xs grid grid-cols-1 flex-col">
			<div class="grid grid-cols-2 gap-1">
				<p>The</p>
				<p>Link</p>
			</div>
			<p>Shortener</p>
		</div>
	</div>
	<hr />

	<!-- Items -->
	<div class="w-full flex max-md:justify-between md:flex-col">
		{#each items as item}
			<Button
				variant="ghost"
				class="flex gap-2 px-7 max-md:w-full rounded-none justify-start max-md:justify-center {$page
					.url.pathname === item.href
					? 'bg-orange-600 hover:bg-orange-700'
					: ''}"
				href={item.href}
			>
				<Icon icon={item.icon} />
				<div class="max-md:text-xs">
					{item.name}
				</div>
			</Button>
		{/each}
	</div>
</div>
