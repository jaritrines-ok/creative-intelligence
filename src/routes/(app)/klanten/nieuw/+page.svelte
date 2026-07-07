<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ClientForm from '$lib/components/app/ClientForm.svelte';
	import { APP_NAAM } from '$lib/config';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	let { form } = $props();
</script>

<svelte:head>
	<title>Nieuwe klant · {APP_NAAM}</title>
</svelte:head>

<div class="mx-auto max-w-xl px-8 py-8">
	<a
		href="/"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
	>
		<ArrowLeft class="size-4" />
		Klanten
	</a>

	<h1 class="mt-3 text-2xl font-bold text-foreground">Nieuwe klant</h1>
	<p class="mt-1 text-sm text-muted-foreground">
		Maak een klant aan om te starten met de intake.
	</p>

	<Card.Root class="mt-6">
		<Card.Content class="pt-6">
			<ClientForm
				naam={form?.naam ?? ''}
				sector={form?.sector ?? ''}
				status={form?.status ?? 'actief'}
				foutmelding={form?.foutmelding ?? ''}
				verzendLabel="Klant aanmaken"
				annulerenHref="/"
			/>
		</Card.Content>
	</Card.Root>
</div>
