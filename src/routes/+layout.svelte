<script>
	import '../app.postcss';
	import Navbar from './Navbar.svelte';
</script>

<div class="flex w-full h-full max-md:flex-col-reverse">
	<Navbar />
	<slot />
</div>
