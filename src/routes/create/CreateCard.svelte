<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { REGEX } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import type { TRPCError } from '@trpc/server';
	import { debounce } from 'lodash-es';
	import { Flame, Loader2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { form, field } from 'svelte-forms';
	import { required, url, pattern } from 'svelte-forms/validators';
	import { slide } from 'svelte/transition';

	let in_progress = false;

	function minLength(n: number) {
		return (val: string) => {
			return {
				valid: val.length >= n,
				name: 'minLength'
			};
		};
	}
	function maxLength(n: number) {
		return (val: string) => {
			return {
				valid: val.length <= n,
				name: 'maxLength'
			};
		};
	}

	let creation_error: string | null = null;
	let custom_errors: string[] = [];

	const aliasAvailableCheck = debounce(async () => {
		function resolve(valid: boolean) {
			if (valid) {
				custom_errors = custom_errors.filter((e) => e != 'alias_unavailable');
				$aliasField.valid = true;
			} else {
				custom_errors = [...custom_errors, 'alias_unavailable'];
				$aliasField.valid = false;
			}

			return valid;
		}

		const alias = $aliasField.value;

		if (!alias) {
			return resolve(true);
		}

		if (!$aliasField.valid && $aliasField.dirty) {
			return;
		}

		const available = await trpc().isAliasAvailable.query(alias);

		return resolve(available);
	}, 600);

	const urlField = field('url', 'https://google.com', [url(), required()], {
		checkOnInit: true
	});
	const aliasField = field('alias', '', [pattern(REGEX.URL_FRIENDLY)], {
		checkOnInit: true
	});
	const selfBurnField = field('self_burn', false, [], {
		checkOnInit: true
	});
	const passwordProtectionField = field('password_protection', false, [], {
		checkOnInit: true
	});
	const passwordField = field('password', '', [], {
		checkOnInit: true
	});
	const requiresAuthField = field('requires_auth', false, [], {
		checkOnInit: true
	});

	const createForm = form(
		urlField,
		aliasField,
		selfBurnField,
		passwordProtectionField,
		passwordField,
		requiresAuthField
	);

	async function handleCreate() {
		function resolve() {
			in_progress = false;
			return;
		}

		if (!$createForm.valid) {
			return resolve();
		}

		in_progress = true;

		await aliasAvailableCheck();
		await aliasAvailableCheck.flush();

		if (custom_errors.includes('alias_unavailable')) {
			return resolve();
		}

		const data = {
			url: $urlField.value,
			alias: $aliasField.value,
			selfBurn: $selfBurnField.value,
			passwordProtection: $passwordProtectionField.value,
			password: $passwordField.value,
			requiresAuth: $requiresAuthField.value
		};

		// pre validation
		if (data.passwordProtection && !data.password) {
			alert('Please enter Password');
			return resolve();
		}

		try {
			const response = await trpc().createLink.query({
				...data
			});

			if (response.error) {
				creation_error = response.message;
				setTimeout(() => {
					creation_error = null;
				}, 10 * 1000);
				return resolve();
			}

			console.log('response?', response);

			goto(`/l/${response.data.id}`);

			return resolve();
		} catch (error) {
			console.log((error as TRPCError).code);
			return resolve();
		}
	}

	onMount(() => {
		aliasAvailableCheck();
	});
</script>

<div>
	<h1 class="text-xl font-bold">Create Link</h1>
	<p class="text-xs text-muted-foreground">Shorten a link</p>
	<hr class="my-4" />
	<div class="max-w-md">
		<div class="flex flex-col gap-5">
			{#if creation_error}
				<div in:slide out:slide>
					<Alert.Root class="relative border-red-500 text-white z-[1]">
						<div class="absolute top-0 left-0 w-full h-full bg-red-600 z-[0] opacity-5" />
						<Icon icon="material-symbols:error-outline" class="text-xl" />
						<Alert.Title>Heads up!</Alert.Title>
						<Alert.Description>{creation_error}</Alert.Description>
					</Alert.Root>
				</div>
			{/if}

			<!-- Url -->
			<div class="grid w-full items-center gap-1.5">
				<Label for="url">URL</Label>
				<Input
					bind:value={$urlField.value}
					disabled={in_progress}
					type="url"
					id="url"
					placeholder="https://google.com"
					aria-required="true"
				/>
			</div>

			<!-- Alias -->
			<div class="grid w-full items-center gap-1.5">
				<Label for="alias">Alias (Optional)</Label>
				<Input
					bind:value={$aliasField.value}
					disabled={in_progress}
					type="text"
					id="alias"
					placeholder="my_alias"
					aria-required="false"
					on:input={aliasAvailableCheck}
					class={custom_errors.includes('alias_unavailable') ? 'border-red-500' : ''}
				/>
				{#if browser && $aliasField.value && !custom_errors.includes('alias_unavailable') && $aliasField.valid}
					<p class="text-xs text-muted-foreground">
						{location.origin}/{$aliasField.value}
					</p>
				{/if}

				{#if $createForm.hasError('alias.pattern')}
					<p class="text-xs text-red-500">
						Invalid character (Should only contain A-Z, a-z, 0-9, - and _)
					</p>
				{/if}

				{#if custom_errors.includes('alias_unavailable')}
					<p class="text-red-500 text-xs">This alias has already been taken</p>
				{/if}
			</div>

			<!-- Password Protection -->
			<div class="flex flex-col rounded-md border p-4">
				<div class="flex items-center space-x-4">
					<Icon icon="mdi:lock" class="text-2xl" />
					<div class="flex-1 space-y-1">
						<p class="text-sm font-medium leading-none">Password Protection</p>
						<p class="text-xs text-muted-foreground">
							Visitor will be asked for password before redirect.
						</p>
					</div>
					<Switch disabled={in_progress} bind:checked={$passwordProtectionField.value} />
				</div>

				<div class="my-2" />

				<div>
					<Input
						bind:value={$passwordField.value}
						disabled={in_progress || $passwordProtectionField.value === false}
						type="password"
						id="url"
						placeholder="mySecretPassword123"
						aria-required="true"
						class={$passwordField.errors.includes('required') ? 'border !border-red-500' : ''}
					/>
				</div>
			</div>

			<!-- Self Burn -->
			<div class="flex items-center space-x-4 rounded-md border p-4">
				<Icon icon="mdi:fire" class="text-2xl" />
				<div class="flex-1 space-y-1">
					<p class="text-sm font-medium leading-none">Self Burn</p>
					<p class="text-xs text-muted-foreground">The link will be destroyed once used.</p>
				</div>
				<Switch disabled={in_progress} bind:checked={$selfBurnField.value} />
			</div>

			<!-- Requires Authentication -->
			<div class="flex items-center space-x-4 rounded-md border p-4">
				<Icon icon="mdi:people" class="text-2xl" />
				<div class="flex-1 space-y-1">
					<p class="text-sm font-medium leading-none">Require Authentication</p>
					<p class="text-xs text-muted-foreground">
						Visitor must be authenticated before redirect.
					</p>
				</div>
				<Switch disabled={in_progress} bind:checked={$requiresAuthField.value} />
			</div>
		</div>
		<div class="my-6" />
		<div class="flex w-full justify-end">
			<Button
				on:click={handleCreate}
				disabled={in_progress || (!$createForm.valid && $createForm.dirty)}
				size="sm"
			>
				{#if in_progress}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Create
			</Button>
		</div>
	</div>
</div>
