<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { signIn } from '@auth/sveltekit/client';

	export let text = 'Before you continue...';

	function handleLogin(method: string) {
		signIn(method, {
			callbackUrl: location.href
		});
	}
</script>

<div class="flex-center flex-col w-full">
	<h2 class="text-lg font-semibold">{text}</h2>
	<div class="my-3" />
	<div class="grid grid-cols-1 gap-2">
		<Button on:click={() => handleLogin('github')} variant="outline" class="gap-2">
			<Icon icon="mdi:github" class="text-2xl" />
			Continue with Github
		</Button>
		<Button on:click={() => handleLogin('google')} variant="outline" class="gap-2">
			<Icon icon="mdi:google" class="text-2xl" />
			Continue with Google
		</Button>
	</div>
</div>
