<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import {
		TRIGGER_MAP_SECTIES,
		FUNNELFASES,
		INVALSHOEK_STATUSSEN,
		invalshoekStatus,
		type Invalshoek,
		type Funnelfase,
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
	import Archive from '@lucide/svelte/icons/archive';
	import ArchiveRestore from '@lucide/svelte/icons/archive-restore';

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
	let toonGearchiveerd = $state(false);

	// Invalshoeken gegroepeerd per funnelfase; behoudt referentie naar het originele object voor binding.
	let invalshoekenPerFase = $derived(
		FUNNELFASES.map((fase) => ({
			fase,
			items: (geselecteerd?.invalshoeken ?? []).filter(
				(inv) => inv.funnelfase === fase && (toonGearchiveerd || !inv.gearchiveerd)
			)
		}))
	);
	let aantalGearchiveerd = $derived(
		(geselecteerd?.invalshoeken ?? []).filter((inv) => inv.gearchiveerd).length
	);

	const funnelKleur: Record<string, string> = {
		TOFU: 'border-blue-300 bg-blue-100 text-blue-800',
		MOFU: 'border-amber-300 bg-amber-100 text-amber-800',
		BOFU: 'border-brand-lime/50 bg-brand-lime/20 text-brand-green'
	};
	const statusKleur: Record<string, string> = {
		Nieuw: 'border-border bg-muted text-muted-foreground',
		'In test': 'border-amber-300 bg-amber-100 text-amber-800',
		'Getest — werkt': 'border-brand-lime/50 bg-brand-lime/20 text-brand-green',
		'Getest — werkt niet': 'border-red-300 bg-red-100 text-red-700'
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
	function invalshoekToevoegen(fase: Funnelfase) {
		geselecteerd?.invalshoeken.push({
			naam: '',
			omschrijving: '',
			funnelfase: fase,
			onderbouwing: '',
			status: 'Nieuw',
			gearchiveerd: false
		});
	}
	function invalshoekVerwijderen(inv: Invalshoek) {
		if (!geselecteerd) return;
		const i = geselecteerd.invalshoeken.indexOf(inv);
		if (i >= 0) geselecteerd.invalshoeken.splice(i, 1);
		saveInvalshoeken();
	}
	function invalshoekArchiveer(inv: Invalshoek, waarde: boolean) {
		inv.gearchiveerd = waarde;
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

		<!-- Invalshoeken per funnelfase -->
		<div class="space-y-5">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h3 class="text-base font-semibold">Invalshoeken per funnelfase</h3>
					<p class="text-sm text-muted-foreground">
						Deze test je als eerste. Geef per invalshoek de status door zodra je 'm getest hebt.
					</p>
				</div>
				{#if aantalGearchiveerd > 0}
					<button
						type="button"
						class="text-sm font-medium text-muted-foreground hover:text-foreground"
						onclick={() => (toonGearchiveerd = !toonGearchiveerd)}
					>
						{toonGearchiveerd ? 'Verberg' : 'Toon'} gearchiveerd ({aantalGearchiveerd})
					</button>
				{/if}
			</div>

			{#each invalshoekenPerFase as groep (groep.fase)}
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<Badge variant="outline" class={cn('font-medium', funnelKleur[groep.fase])}>
							{groep.fase}
						</Badge>
						<span class="text-xs text-muted-foreground">
							{groep.items.length}
							{groep.items.length === 1 ? 'invalshoek' : 'invalshoeken'}
						</span>
						{#if bewerkbaar}
							<Button
								variant="ghost"
								size="sm"
								class="ml-auto text-muted-foreground"
								onclick={() => invalshoekToevoegen(groep.fase)}
							>
								<Plus class="size-4" />
								Toevoegen
							</Button>
						{/if}
					</div>

					{#if groep.items.length === 0}
						<p class="rounded-md border border-dashed bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
							Nog geen invalshoeken voor {groep.fase}.
						</p>
					{:else}
						<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
							{#each groep.items as inv (inv)}
								<Card.Root class={cn(inv.gearchiveerd && 'opacity-60')}>
									{#if bewerkbaar}
										<Card.Content class="space-y-3 pt-6">
											<div class="flex items-center gap-2">
												<Input bind:value={inv.naam} onblur={saveInvalshoeken} placeholder="Naam invalshoek" />
												<Button
													variant="ghost"
													size="sm"
													class="shrink-0 text-muted-foreground hover:text-destructive"
													title="Verwijderen"
													onclick={() => invalshoekVerwijderen(inv)}
												>
													<Trash2 class="size-4" />
												</Button>
											</div>
											<div class="grid grid-cols-2 gap-2">
												<div>
													<span class="mb-1 block text-xs font-medium text-muted-foreground">Fase</span>
													<select
														bind:value={inv.funnelfase}
														onchange={saveInvalshoeken}
														class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
													>
														{#each FUNNELFASES as f (f)}<option value={f}>{f}</option>{/each}
													</select>
												</div>
												<div>
													<span class="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
													<select
														value={invalshoekStatus(inv)}
														onchange={(e) => {
															inv.status = e.currentTarget.value as Invalshoek['status'];
															saveInvalshoeken();
														}}
														class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
													>
														{#each INVALSHOEK_STATUSSEN as s (s)}<option value={s}>{s}</option>{/each}
													</select>
												</div>
											</div>
											<div>
												<span class="mb-1 block text-xs font-medium text-muted-foreground">Omschrijving</span>
												<Textarea bind:value={inv.omschrijving} onblur={saveInvalshoeken} rows={3} />
											</div>
											<div>
												<span class="mb-1 block text-xs font-medium text-muted-foreground">Onderbouwing</span>
												<Textarea bind:value={inv.onderbouwing} onblur={saveInvalshoeken} rows={2} />
											</div>
											<Button
												variant="ghost"
												size="sm"
												class="text-muted-foreground"
												onclick={() => invalshoekArchiveer(inv, !inv.gearchiveerd)}
											>
												{#if inv.gearchiveerd}
													<ArchiveRestore class="size-4" /> Herstellen
												{:else}
													<Archive class="size-4" /> Archiveren
												{/if}
											</Button>
										</Card.Content>
									{:else}
										<Card.Header>
											<div class="flex flex-wrap items-center justify-between gap-2">
												<Card.Title class="text-base">{inv.naam}</Card.Title>
												<Badge
													variant="outline"
													class={cn('shrink-0 font-medium', statusKleur[invalshoekStatus(inv)])}
												>
													{invalshoekStatus(inv)}
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
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
			<p class="text-sm font-medium text-foreground">Nog geen trigger map</p>
			<p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
				Genereer een trigger map op basis van de intake. Claude analyseert alle beschikbare bronnen
				en stelt pijnpunten, wensen, taal van de doelgroep en invalshoeken per funnelfase voor.
			</p>
		</div>
	{/if}
</div>
