<script lang="ts">
	import { goto } from '$app/navigation';
	import LoginCard from '$lib/components/LoginCard.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { trpc } from '$lib/trpc/client.js';
	import { decryptAES, hash } from '$lib/utils';

	export let data;

	$: console.log(data);

	let link = data.link;
	let user = data.session?.user;

	let passwordInput: string = '';
	let authCheck = false;
	let passwordCheck = false;

	console.log('link?', link);
	$: {
		authCheck = link?.requiresAuth === false ? true : Boolean(user);
		passwordCheck =
			link?.passwordProtection === true ? link.password === hash(passwordInput) : true;
	}

	$: console.log('authCheck?', authCheck);
	$: console.log('passwordCheck?', passwordCheck);

	$: {
		(async () => {
			if (authCheck && passwordCheck) {
				const decryptedURL = await trpc().decryptURL.query(link!.url!);

				console.log('decryptedURL?', decryptedURL);

				console.log('redirecting...');

				await trpc().registerRedirect.query({
					linkId: link!.id
				});
				window.location.href = decryptedURL!;
			}
		})();
	}
</script>

<div class="px-8 py-8 flex-center flex-col w-full min-h-full">
	{#if !link}
		<p>Not Found</p>
	{:else}
		{#if !authCheck}
			<LoginCard />
		{/if}

		{#if authCheck && !passwordCheck}
			<div class="flex flex-col w-full max-w-sm">
				<h1 class="font-semibold text-xl text-center underline">Link is protected</h1>

				<div class="my-2" />

				<div class="grid w-full items-center gap-1.5">
					<Label for="password">Password</Label>
					<Input bind:value={passwordInput} type="password" id="password" aria-required="true" />
				</div>
			</div>
		{/if}

		{#if authCheck && passwordCheck}
			<p>Redirecting...</p>
		{/if}
	{/if}
</div>
