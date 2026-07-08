<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import {
		TRIGGER_MAP_SECTIES,
		type Invalshoek,
		type TekstSectieKey
	} from '$lib/trigger-map';
	import { saver, postJSON } from '$lib/saver.svelte';
	import { datumKort } from '$lib/format';
	import { cn } from '$lib/utils';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { data, form } = $props();
	let bezig = $state(false);

	interface VersieUI {
		id: string;
		versie_nummer: number;
		is_actief: boolean;
		created_at: string;
		pijnpunten: string[];
		wensen: string[];
		bezwaren: string[];
		taal_doelgroep: string[];
		routines: string[];
		kansen_vs_concurrenten: string[];
		invalshoeken: Invalshoek[];
	}

	function mapVersies(rows: typeof data.versies): VersieUI[] {
		return rows.map((v) => ({
			id: v.id,
			versie_nummer: v.versie_nummer,
			is_actief: v.is_actief,
			created_at: v.created_at,
			pijnpunten: (v.pijnpunten as string[] | null) ?? [],
			wensen: (v.wensen as string[] | null) ?? [],
			bezwaren: (v.bezwaren as string[] | null) ?? [],
			taal_doelgroep: (v.taal_doelgroep as string[] | null) ?? [],
			routines: (v.routines as string[] | null) ?? [],
			kansen_vs_concurrenten: (v.kansen_vs_concurrenten as string[] | null) ?? [],
			invalshoeken: (v.invalshoeken as Invalshoek[] | null) ?? []
		}));
	}

	// svelte-ignore state_referenced_locally
	let versies = $state<VersieUI[]>(mapVersies(data.versies));
	// svelte-ignore state_referenced_locally
	let geselecteerdId = $state<string | null>(
		data.versies.find((v) => v.is_actief)?.id ?? data.versies[0]?.id ?? null
	);

	// Herlaad lokale state wanneer de serverdata verandert (na nieuwe generatie).
	$effect(() => {
		versies = mapVersies(data.versies);
		geselecteerdId = data.versies.find((v) => v.is_actief)?.id ?? data.versies[0]?.id ?? null;
	});

	let geselecteerd = $derived(versies.find((v) => v.id === geselecteerdId) ?? null);
	let bewerkbaar = $derived(!!geselecteerd?.is_actief);

	const funnelKleur: Record<string, string> = {
		TOFU: 'border-blue-300 bg-blue-100 text-blue-800',
		MOFU: 'border-amber-300 bg-amber-100 text-amber-800',
		BOFU: 'border-brand-lime/50 bg-brand-lime/20 text-brand-green'
	};

	function saveSectie(key: TekstSectieKey) {
		if (!geselecteerd) return;
		return postJSON('/api/trigger-map', {
			type: 'sectie',
			versieId: geselecteerd.id,
			key,
			items: geselecteerd[key]
		});
	}
	function saveInvalshoeken() {
		if (!geselecteerd) return;
		return postJSON('/api/trigger-map', {
			type: 'invalshoeken',
			versieId: geselecteerd.id,
			invalshoeken: geselecteerd.invalshoeken
		});
	}
	function itemToevoegen(key: TekstSectieKey) {
		geselecteerd?.[key].push('');
	}
	function itemVerwijderen(key: TekstSectieKey, i: number) {
		geselecteerd?.[key].splice(i, 1);
		saveSectie(key);
	}
	function invalshoekToevoegen() {
		geselecteerd?.invalshoeken.push({
			naam: '',
			omschrijving: '',
			funnelfase: 'TOFU',
			onderbouwing: ''
		});
	}
	function invalshoekVerwijderen(i: number) {
		geselecteerd?.invalshoeken.splice(i, 1);
		saveInvalshoeken();
	}
	async function activeer(id: string) {
		await postJSON('/api/trigger-map', {
			type: 'activeer',
			clientId: data.client.id,
			versieId: id
		});
		versies.forEach((v) => (v.is_actief = v.id === id));
		geselecteerdId = id;
	}
</script>

<div class="space-y-6">
	<!-- Kop + genereerknop -->
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h2 class="text-lg font-semibold">Trigger map</h2>
			<p class="text-sm text-muted-foreground">
				{#if versies.length}
					{versies.length}
					{versies.length === 1 ? 'versie' : 'versies'} · bewerk de actieve versie of maak een oudere
					weer actief.
				{:else}
					Nog geen trigger map gegenereerd.
				{/if}
			</p>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-1.5 text-xs">
				{#if saver.fout}
					<TriangleAlert class="size-3.5 text-destructive" />
					<span class="text-destructive">Opslaan mislukt</span>
				{:else if saver.actief > 0}
					<LoaderCircle class="size-3.5 animate-spin text-muted-foreground" />
					<span class="text-muted-foreground">Opslaan…</span>
				{:else if saver.laatstOpgeslagen}
					<Check class="size-3.5 text-brand-green" />
					<span class="text-muted-foreground">Opgeslagen</span>
				{/if}
			</div>

			<form
				method="POST"
				action="?/genereren"
				use:enhance={({ cancel }) => {
					if (versies.length && !confirm('Een nieuwe versie genereren? De huidige blijft bewaard.')) {
						cancel();
						return;
					}
					bezig = true;
					return async ({ update }) => {
						await update();
						bezig = false;
					};
				}}
			>
				<Button type="submit" disabled={bezig || !data.bron1Compleet}>
					{#if bezig}
						<LoaderCircle class="size-4 animate-spin" />
						Genereren…
					{:else if versies.length}
						<RefreshCw class="size-4" />
						Opnieuw genereren
					{:else}
						<Sparkles class="size-4" />
						Trigger map genereren
					{/if}
				</Button>
			</form>
		</div>
	</div>

	{#if !data.bron1Compleet}
		<div
			class="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
		>
			<TriangleAlert class="size-4 shrink-0" />
			Vul eerst de kern van Bron 1 (Klantgesprek) in — minimaal een handvol vragen — voordat je de
			trigger map genereert.
		</div>
	{/if}

	{#if form?.foutmelding}
		<div class="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
			<TriangleAlert class="size-4 shrink-0" />
			{form.foutmelding}
		</div>
	{/if}

	{#if bezig}
		<div
			class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-16 text-center"
		>
			<LoaderCircle class="size-6 animate-spin text-primary" />
			<p class="text-sm font-medium">Claude analyseert de intake…</p>
			<p class="text-xs text-muted-foreground">Dit kan een halve minuut duren.</p>
		</div>
	{:else if geselecteerd}
		<!-- Versie-selector + status -->
		<div class="flex flex-wrap items-center gap-3">
			<select
				bind:value={geselecteerdId}
				class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				{#each versies as v (v.id)}
					<option value={v.id}>
						Versie {v.versie_nummer} — {datumKort(v.created_at)}{v.is_actief ? ' (actief)' : ''}
					</option>
				{/each}
			</select>

			{#if bewerkbaar}
				<Badge variant="outline" class="border-brand-lime/50 bg-brand-lime/20 text-brand-green">
					Actieve versie — bewerkbaar
				</Badge>
			{:else}
				<span class="text-sm text-muted-foreground">Alleen-lezen (oude versie)</span>
				<Button size="sm" variant="outline" onclick={() => activeer(geselecteerd!.id)}>
					Maak deze versie actief
				</Button>
			{/if}
		</div>

		<!-- Tekstsecties -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each TRIGGER_MAP_SECTIES as sectie (sectie.key)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">{sectie.label}</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-2">
						{#if bewerkbaar}
							{#each geselecteerd[sectie.key] as _, i (i)}
								<div class="flex items-start gap-2">
									<Input
										bind:value={geselecteerd[sectie.key][i]}
										onblur={() => saveSectie(sectie.key)}
										placeholder="Item…"
									/>
									<Button
										variant="ghost"
										size="sm"
										class="shrink-0 text-muted-foreground hover:text-destructive"
										onclick={() => itemVerwijderen(sectie.key, i)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							{/each}
							<Button variant="outline" size="sm" onclick={() => itemToevoegen(sectie.key)}>
								<Plus class="size-4" />
								Item toevoegen
							</Button>
						{:else if geselecteerd[sectie.key].length}
							<ul class="space-y-1.5">
								{#each geselecteerd[sectie.key] as item (item)}
									<li class="flex gap-2 text-sm">
										<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-lime"></span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">Geen items.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Invalshoeken -->
		<div>
			<div class="mb-3 flex items-center justify-between">
				<h3 class="text-base font-semibold">Invalshoeken (gesorteerd op kans)</h3>
				{#if bewerkbaar}
					<Button variant="outline" size="sm" onclick={invalshoekToevoegen}>
						<Plus class="size-4" />
						Invalshoek toevoegen
					</Button>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{#each geselecteerd.invalshoeken as inv, i (i)}
					<Card.Root>
						{#if bewerkbaar}
							<Card.Content class="space-y-3 pt-6">
								<div class="flex items-center gap-2">
									<span class="text-sm font-semibold text-muted-foreground">{i + 1}.</span>
									<Input
										bind:value={inv.naam}
										onblur={saveInvalshoeken}
										placeholder="Naam invalshoek"
									/>
									<Button
										variant="ghost"
										size="sm"
										class="shrink-0 text-muted-foreground hover:text-destructive"
										onclick={() => invalshoekVerwijderen(i)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
								<div>
									<span class="mb-1 block text-xs font-medium text-muted-foreground">Funnelfase</span>
									<select
										bind:value={inv.funnelfase}
										onchange={saveInvalshoeken}
										class="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										<option value="TOFU">TOFU</option>
										<option value="MOFU">MOFU</option>
										<option value="BOFU">BOFU</option>
									</select>
								</div>
								<div>
									<span class="mb-1 block text-xs font-medium text-muted-foreground">Omschrijving</span>
									<Textarea bind:value={inv.omschrijving} onblur={saveInvalshoeken} rows={3} />
								</div>
								<div>
									<span class="mb-1 block text-xs font-medium text-muted-foreground">Onderbouwing</span>
									<Textarea bind:value={inv.onderbouwing} onblur={saveInvalshoeken} rows={3} />
								</div>
							</Card.Content>
						{:else}
							<Card.Header>
								<div class="flex items-center justify-between gap-2">
									<Card.Title class="text-base">{i + 1}. {inv.naam}</Card.Title>
									<Badge
										variant="outline"
										class={cn('shrink-0 font-medium', funnelKleur[inv.funnelfase])}
									>
										{inv.funnelfase}
									</Badge>
								</div>
							</Card.Header>
							<Card.Content class="space-y-3 text-sm">
								<p>{inv.omschrijving}</p>
								<div>
									<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Onderbouwing
									</p>
									<p class="mt-0.5 text-muted-foreground">{inv.onderbouwing}</p>
								</div>
							</Card.Content>
						{/if}
					</Card.Root>
				{/each}
			</div>
		</div>
	{:else}
		<div class="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
			<p class="text-sm font-medium text-foreground">Nog geen trigger map</p>
			<p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
				Genereer een trigger map op basis van de intake. Claude analyseert alle beschikbare bronnen
				en stelt pijnpunten, wensen, taal van de doelgroep en 3 invalshoeken voor.
			</p>
		</div>
	{/if}
</div>
