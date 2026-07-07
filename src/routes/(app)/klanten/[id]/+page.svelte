<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import IntakeProgress from '$lib/components/app/IntakeProgress.svelte';
	import { STATUSSEN, STATUS_LABELS, FASE_LABELS } from '$lib/config';
	import { datumKort, relatieveTijd } from '$lib/format';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();
	let client = $derived(data.client);
	let base = $derived(`/klanten/${client.id}`);
	let andereStatussen = $derived(STATUSSEN.filter((s) => s !== client.status));
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Intake-voortgang -->
	<Card.Root class="lg:col-span-2">
		<Card.Header>
			<Card.Title>Intake-voortgang</Card.Title>
			<Card.Description>Voortgang per bron. Niet elke bron hoeft ingevuld te zijn.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-5">
			<IntakeProgress progress={data.progress} />
			<Button href={`${base}/intake`}>
				Naar de intake
				<ArrowRight class="size-4" />
			</Button>
		</Card.Content>
	</Card.Root>

	<!-- Details + acties -->
	<div class="space-y-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>Gegevens</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Huidige fase</span>
					<span class="font-medium">{FASE_LABELS[client.huidige_fase]}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Status</span>
					<span class="font-medium">{STATUS_LABELS[client.status]}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Aangemaakt</span>
					<span class="font-medium">{datumKort(client.created_at)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Laatst bijgewerkt</span>
					<span class="font-medium">{relatieveTijd(client.updated_at)}</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Status wijzigen</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2">
				{#each andereStatussen as s (s)}
					<form method="POST" action="?/status" use:enhance>
						<input type="hidden" name="status" value={s} />
						<Button type="submit" variant="outline" size="sm">
							Markeer als {STATUS_LABELS[s].toLowerCase()}
						</Button>
					</form>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-destructive/30">
			<Card.Header>
				<Card.Title class="text-destructive">Klant verwijderen</Card.Title>
				<Card.Description>
					Dit verwijdert de klant en alle bijbehorende intake, trigger maps en concepten. Overweeg
					in plaats daarvan archiveren.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/verwijderen"
					use:enhance={({ cancel }) => {
						if (!confirm(`Weet je zeker dat je "${client.naam}" definitief wilt verwijderen?`)) {
							cancel();
						}
					}}
				>
					<Button type="submit" variant="destructive" size="sm">Definitief verwijderen</Button>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
</div>
