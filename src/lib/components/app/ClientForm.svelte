<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { STATUSSEN, STATUS_LABELS, type Status } from '$lib/config';

	let {
		naam = '',
		sector = '',
		status = 'actief',
		foutmelding = '',
		verzendLabel = 'Opslaan',
		annulerenHref = '/'
	}: {
		naam?: string;
		sector?: string | null;
		status?: string;
		foutmelding?: string;
		verzendLabel?: string;
		annulerenHref?: string;
	} = $props();

	let bezig = $state(false);
	// svelte-ignore state_referenced_locally
	let statusWaarde = $state<string>(status);
</script>

<form
	method="POST"
	use:enhance={() => {
		bezig = true;
		return async ({ update }) => {
			await update({ reset: false });
			bezig = false;
		};
	}}
	class="space-y-5"
>
	{#if foutmelding}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{foutmelding}</p>
	{/if}

	<div class="space-y-2">
		<Label for="naam">Naam <span class="text-destructive">*</span></Label>
		<Input id="naam" name="naam" required value={naam} placeholder="Bijv. Equalité" />
	</div>

	<div class="space-y-2">
		<Label for="sector">Sector</Label>
		<Input id="sector" name="sector" value={sector ?? ''} placeholder="Bijv. Fashion / E-commerce" />
	</div>

	<div class="space-y-2">
		<Label for="status">Status</Label>
		<input type="hidden" name="status" value={statusWaarde} />
		<Select.Root type="single" bind:value={statusWaarde}>
			<Select.Trigger id="status" class="w-full">
				{STATUS_LABELS[statusWaarde as Status]}
			</Select.Trigger>
			<Select.Content>
				{#each STATUSSEN as s (s)}
					<Select.Item value={s} label={STATUS_LABELS[s]}>{STATUS_LABELS[s]}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="flex gap-2 pt-2">
		<Button type="submit" disabled={bezig}>{bezig ? 'Bezig…' : verzendLabel}</Button>
		<Button variant="outline" href={annulerenHref}>Annuleren</Button>
	</div>
</form>
