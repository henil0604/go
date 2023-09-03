<script lang="ts">
	export let value = '';
	export let width = 200; // Default width
	export let height = 200; // Default height
	let qrCodeDataURL = '';

	import QRCode from 'qrcode';

	async function generateQRCode() {
		try {
			const dataURL = await QRCode.toDataURL(value, {
				errorCorrectionLevel: 'L',
				type: 'image/png',
				margin: 2,
				scale: 100
			});
			qrCodeDataURL = dataURL;
		} catch (error) {
			console.error('QR code generation error:', error);
		}
	}

	// Generate the QR code when the component is first initialized or when props change
	$: {
		generateQRCode();
	}
</script>

<main>
	{#if qrCodeDataURL}
		<img src={qrCodeDataURL} alt="QR Code" {width} {height} />
	{:else}
		<p>Generating QR code...</p>
	{/if}
</main>
