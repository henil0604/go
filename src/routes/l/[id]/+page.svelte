<script lang="ts">
	import { page } from '$app/stores';
	import QrCode from '$lib/components/QRCode.svelte';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import moment from 'moment';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client.js';

	export let data;

	let link = data.link!;

	let shorten_full_link = `${$page.url.origin}/${link.id}`;
	let alias_full_link = link.alias ? `${$page.url.origin}/${link.alias}` : null;

	let original_url = 'Decrypting...';

	onMount(async () => {
		original_url = await trpc().decryptURL.query(link.url);
	});
</script>

<div class="px-4 md:px-8 py-8 w-full min-h-full">
	<div class="flex flex-wrap gap-10">
		<!-- QR Code -->
		<div class="w-fit max-md:w-full flex-center">
			<div class="w-fit rounded-md overflow-hidden">
				<QrCode width={250} value={shorten_full_link} />
			</div>
		</div>

		<!-- info -->
		<div class="flex flex-col gap-4 max-md:px-7">
			<div class="grid w-full items-center gap-1">
				<Label class="text-xs text-muted-foreground">Original URL</Label>
				<a
					href={original_url}
					target="_blank"
					class="w-fit text-sm flex-center font-semibold hover:underline"
					>{original_url} <Icon icon="gg:external" /></a
				>
			</div>

			<div class="grid w-full items-center gap-1">
				<Label class="text-xs text-muted-foreground">Shorten URL(s)</Label>
				<a
					href={shorten_full_link}
					target="_blank"
					class="w-fit text-sm flex-center font-semibold hover:underline"
					>{shorten_full_link} <Icon icon="gg:external" /></a
				>
				{#if alias_full_link}
					<a
						href={alias_full_link}
						target="_blank"
						class="w-fit text-sm flex-center font-semibold hover:underline"
						>{alias_full_link} <Icon icon="gg:external" /></a
					>
				{/if}
			</div>
			<div class="grid w-full items-center gap-1">
				<Label class="text-xs text-muted-foreground">Created</Label>
				<p class="text-sm">{moment(link.createdAt).fromNow()}</p>
			</div>
			<div class="grid grid-cols-2 gap-6">
				<div class="grid w-full items-center justify-start gap-1">
					<Label class="text-xs text-muted-foreground flex-center gap-1">
						Redirect count
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Icon icon="ic:twotone-info" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Number of total redirects</p>
								<p class="text-muted-foreground text-xs mt-1">(Updated every few minutes)</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Label>
					<p class="text-sm">{link.redirect_count || 0}</p>
				</div>
				<div class="grid w-full items-center justify-start gap-1">
					<Label class="text-xs text-muted-foreground flex-center gap-1">
						Unique visitors
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Icon icon="ic:twotone-info" />
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Number of unique visitors</p>
								<p class="text-muted-foreground text-xs mt-1">(Updated every few minutes)</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Label>
					<p class="text-sm">{link.unique_visitor_count || 0}</p>
				</div>
			</div>
		</div>
	</div>
</div>
