<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import ClientForm from '$lib/components/app/ClientForm.svelte';

	let { data, form } = $props();
	let client = $derived(data.client);
</script>

<Card.Root class="mx-auto max-w-xl">
	<Card.Header>
		<Card.Title>Klant bewerken</Card.Title>
		<Card.Description>Pas de gegevens van deze klant aan.</Card.Description>
	</Card.Header>
	<Card.Content>
		<ClientForm
			naam={form?.naam ?? client.naam}
			sector={form?.sector ?? client.sector ?? ''}
			status={form?.status ?? client.status}
			foutmelding={form?.foutmelding ?? ''}
			verzendLabel="Wijzigingen opslaan"
			annulerenHref={`/klanten/${client.id}`}
		/>
	</Card.Content>
</Card.Root>
