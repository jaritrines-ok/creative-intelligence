<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { saver, postJSON } from '$lib/saver.svelte';
	import { cn } from '$lib/utils';
	import type { Concept } from '$lib/supabase/database.types';
	import {
		FUNNELFASES,
		FORMATS,
		STRUCTUREN,
		TEST_VARIABELEN,
		PRIORITEITEN,
		CONCEPT_STATUSSEN,
		TESTVOLGORDE,
		sorteerConcepten
	} from '$lib/matrix';
	import type { Testplan } from '$lib/testplan';
	import { SPRINT_VELDEN } from '$lib/testplan';
	import Plus from '@lucide/svelte/icons/plus';
	import Copy from '@lucide/svelte/icons/copy';
	import Archive from '@lucide/svelte/icons/archive';
	import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Check from '@lucide/svelte/icons/check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let concepten = $state<Concept[]>(data.concepten.map((c) => ({ ...c })));
	$effect(() => {
		concepten = data.concepten.map((c) => ({ ...c }));
	});
	let toonArchief = $state(false);
	let bezigGenereren = $state(false);
	let genereerFout = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	let testplan = $state<Testplan | null>((data.client.testplan as Testplan | null) ?? null);
	let bezigTestplan = $state(false);
	let testplanFout = $state<string | null>(null);
	let feedback = $state('');

	async function genereerTestplan() {
		bezigTestplan = true;
		testplanFout = null;
		try {
			const { testplan: tp } = await postJSON<{ testplan: Testplan }>('/api/testplan', {
				type: 'genereer',
				clientId: data.client.id,
				feedback
			});
			testplan = tp;
			feedback = '';
		} catch (e) {
			testplanFout = e instanceof Error ? e.message : 'Testplan genereren mislukt';
		} finally {
			bezigTestplan = false;
		}
	}

	let actief = $derived(sorteerConcepten(concepten.filter((c) => !c.gearchiveerd)));
	let archief = $derived(concepten.filter((c) => c.gearchiveerd));

	const veldClass =
		'h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none';

	function saveVeld(c: Concept, veld: keyof Concept) {
		return postJSON('/api/concepts', { type: 'update', id: c.id, patch: { [veld]: c[veld] } });
	}
	async function rijToevoegen() {
		const { concept } = await postJSON<{ concept: Concept }>('/api/concepts', {
			type: 'insert',
			clientId: data.client.id
		});
		concepten.push(concept);
	}
	async function dupliceer(c: Concept) {
		const { concept } = await postJSON<{ concept: Concept }>('/api/concepts', {
			type: 'dupliceer',
			id: c.id
		});
		concepten.push(concept);
	}
	async function archiveer(c: Concept) {
		await postJSON('/api/concepts', { type: 'archiveer', id: c.id });
		c.gearchiveerd = true;
	}
	async function herstel(c: Concept) {
		await postJSON('/api/concepts', { type: 'herstel', id: c.id });
		c.gearchiveerd = false;
	}
	let overneembareInvalshoeken = $derived(data.invalshoeken.filter((inv) => !inv.gearchiveerd));

	async function neemInvalshoekenOver() {
		for (const inv of overneembareInvalshoeken) {
			const { concept } = await postJSON<{ concept: Concept }>('/api/concepts', {
				type: 'insert',
				clientId: data.client.id,
				concept: {
					funnelfase: inv.funnelfase,
					invalshoek: inv.naam,
					hypothese: inv.omschrijving,
					variabele: 'Invalshoek',
					prioriteit: 'Hoog',
					status: 'Idee'
				}
			});
			concepten.push(concept);
		}
	}
	async function genereerMatrix() {
		if (concepten.length && !confirm('Een matrix-opzet genereren? De voorgestelde concepten worden toegevoegd aan de bestaande.')) {
			return;
		}
		bezigGenereren = true;
		genereerFout = null;
		try {
			const { concepten: nieuw } = await postJSON<{ concepten: Concept[] }>('/api/concepts', {
				type: 'genereer',
				clientId: data.client.id
			});
			concepten.push(...nieuw);
		} catch (e) {
			genereerFout = e instanceof Error ? e.message : 'Genereren mislukt';
		} finally {
			bezigGenereren = false;
		}
	}

	const statusKleur: Record<string, string> = {
		Idee: 'border-border bg-muted text-muted-foreground',
		'In productie': 'border-amber-300 bg-amber-100 text-amber-800',
		Live: 'border-brand-lime/50 bg-brand-lime/20 text-brand-green',
		Afgerond: 'border-blue-300 bg-blue-100 text-blue-800'
	};
</script>

{#snippet selectCel(c: Concept, veld: keyof Concept, opties: readonly string[], nullable: boolean)}
	<select bind:value={c[veld]} onchange={() => saveVeld(c, veld)} class={veldClass}>
		{#if nullable}<option value={null}>—</option>{/if}
		{#each opties as o (o)}<option value={o}>{o}</option>{/each}
	</select>
{/snippet}

{#snippet inputCel(c: Concept, veld: keyof Concept, placeholder: string)}
	<input
		bind:value={c[veld]}
		onblur={() => saveVeld(c, veld)}
		{placeholder}
		class={veldClass}
	/>
{/snippet}

<!-- Combobox: kies een suggestie of typ een eigen waarde -->
{#snippet comboCel(c: Concept, veld: keyof Concept, listId: string)}
	<input
		list={listId}
		bind:value={c[veld]}
		onblur={() => saveVeld(c, veld)}
		placeholder="—"
		class={veldClass}
	/>
{/snippet}

<datalist id="dl-format">
	{#each FORMATS as o (o)}<option value={o}></option>{/each}
</datalist>
<datalist id="dl-structuur">
	{#each STRUCTUREN as o (o)}<option value={o}></option>{/each}
</datalist>
<datalist id="dl-variabele">
	{#each TEST_VARIABELEN as o (o)}<option value={o}></option>{/each}
</datalist>

<div class="space-y-5">
	<!-- Kop -->
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h2 class="text-lg font-semibold">Variabelenmatrix</h2>
			<p class="text-sm text-muted-foreground">
				Bouw je concepten en bepaal per concept welke variabele je test.
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
			{#if data.heeftTriggerMap && actief.length > 0}
				<Button variant="outline" onclick={genereerMatrix} disabled={bezigGenereren}>
					{#if bezigGenereren}
						<LoaderCircle class="size-4 animate-spin" />
						Genereren…
					{:else}
						<Sparkles class="size-4" />
						Opzet genereren
					{/if}
				</Button>
			{/if}
			<Button onclick={rijToevoegen}>
				<Plus class="size-4" />
				Concept toevoegen
			</Button>
		</div>
	</div>

	{#if genereerFout}
		<div class="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
			<TriangleAlert class="size-4 shrink-0" />
			{genereerFout}
		</div>
	{/if}

	<!-- Testvolgorde-indicator -->
	<div
		class="flex flex-wrap items-center gap-2 rounded-md border border-brand-lime/40 bg-brand-mint/50 px-3 py-2 text-sm"
	>
		<span class="font-medium text-brand-green">Test eerst:</span>
		{#each TESTVOLGORDE as stap, i (stap)}
			<span class="font-medium text-foreground">{stap}</span>
			{#if i < TESTVOLGORDE.length - 1}<span class="text-muted-foreground">→</span>{/if}
		{/each}
	</div>

	<!-- Voorstel uit trigger map -->
	{#if bezigGenereren && actief.length === 0}
		<div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-16 text-center">
			<LoaderCircle class="size-6 animate-spin text-primary" />
			<p class="text-sm font-medium">Claude stelt een matrix-opzet voor…</p>
			<p class="text-xs text-muted-foreground">Dit kan een halve minuut duren.</p>
		</div>
	{:else if actief.length === 0 && data.heeftTriggerMap}
		<div class="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
			<Sparkles class="mx-auto size-6 text-accent" />
			<p class="mt-2 text-sm font-medium">Genereer een matrix-opzet uit je trigger map</p>
			<p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
				Claude stelt een set concepten voor (funnelfase, invalshoek, format, structuur, hypothese) op
				basis van je trigger map. Je kunt alles daarna vrij aanpassen.
			</p>
			<div class="mt-4 flex flex-wrap justify-center gap-2">
				<Button onclick={genereerMatrix} disabled={bezigGenereren}>
					<Sparkles class="size-4" />
					Matrix-opzet genereren
				</Button>
				{#if overneembareInvalshoeken.length > 0}
					<Button variant="outline" onclick={neemInvalshoekenOver}>
						Alleen de invalshoeken overnemen ({overneembareInvalshoeken.length})
					</Button>
				{/if}
			</div>
		</div>
	{:else if actief.length === 0}
		<div class="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
			<p class="text-sm font-medium text-foreground">Nog geen concepten</p>
			<p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
				Genereer eerst een <strong>trigger map</strong> — daaruit stelt Claude automatisch een
				matrix-opzet voor. Of voeg handmatig een concept toe.
			</p>
		</div>
	{/if}

	<!-- Tabel -->
	{#if actief.length > 0}
		<div class="overflow-x-auto rounded-lg border">
			<table class="w-full min-w-[1200px] border-collapse text-sm">
				<thead>
					<tr class="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
						<th class="w-24 p-2">Funnelfase</th>
						<th class="w-48 p-2">Invalshoek</th>
						<th class="w-36 p-2">Format</th>
						<th class="w-44 p-2">Structuur</th>
						<th class="w-36 p-2">Creator type</th>
						<th class="w-56 p-2">Hypothese</th>
						<th class="w-32 p-2">Test-variabele</th>
						<th class="w-28 p-2">Prioriteit</th>
						<th class="w-32 p-2">Status</th>
						<th class="w-20 p-2 text-right">Acties</th>
					</tr>
				</thead>
				<tbody>
					{#each actief as c (c.id)}
						<tr class={cn('border-b align-top', c.status === 'Live' && 'bg-brand-lime/5')}>
							<td class="p-2">{@render selectCel(c, 'funnelfase', FUNNELFASES, true)}</td>
							<td class="p-2">{@render inputCel(c, 'invalshoek', 'Invalshoek')}</td>
							<td class="p-2">{@render comboCel(c, 'format', 'dl-format')}</td>
							<td class="p-2">{@render comboCel(c, 'structuur', 'dl-structuur')}</td>
							<td class="p-2">{@render inputCel(c, 'creator_type', 'Bijv. micro-influencer')}</td>
							<td class="p-2">{@render inputCel(c, 'hypothese', 'Wat verwacht je?')}</td>
							<td class="p-2">{@render comboCel(c, 'variabele', 'dl-variabele')}</td>
							<td class="p-2">{@render selectCel(c, 'prioriteit', PRIORITEITEN, true)}</td>
							<td class="p-2">{@render selectCel(c, 'status', CONCEPT_STATUSSEN, false)}</td>
							<td class="p-2">
								<div class="flex justify-end gap-1">
									<Button
										variant="ghost"
										size="sm"
										title="Dupliceren"
										class="text-muted-foreground"
										onclick={() => dupliceer(c)}
									>
										<Copy class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										title="Archiveren"
										class="text-muted-foreground hover:text-destructive"
										onclick={() => archiveer(c)}
									>
										<Archive class="size-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Archief -->
	{#if archief.length > 0}
		<div>
			<button
				type="button"
				class="text-sm font-medium text-muted-foreground hover:text-foreground"
				onclick={() => (toonArchief = !toonArchief)}
			>
				{toonArchief ? 'Verberg' : 'Toon'} gearchiveerd ({archief.length})
			</button>
			{#if toonArchief}
				<div class="mt-2 space-y-2">
					{#each archief as c (c.id)}
						<div class="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
							<div class="flex items-center gap-2 text-sm">
								<Badge variant="outline" class={cn('font-medium', statusKleur[c.status])}>
									{c.status}
								</Badge>
								<span>{c.invalshoek || '(geen invalshoek)'}</span>
								{#if c.funnelfase}<span class="text-muted-foreground">· {c.funnelfase}</span>{/if}
							</div>
							<Button variant="ghost" size="sm" onclick={() => herstel(c)}>
								<ArchiveRestore class="size-4" />
								Herstellen
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Testplan -->
	{#if actief.length > 0}
		<div class="space-y-4 border-t pt-6">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 class="text-base font-semibold">Testplan</h3>
					<p class="text-sm text-muted-foreground">
						Stap-voor-stap sprintplan op basis van je matrix en persona's — waarom je met welke test
						begint en wat de vervolgstappen zijn.
					</p>
				</div>
				<Button
					variant={testplan ? 'outline' : 'default'}
					onclick={genereerTestplan}
					disabled={bezigTestplan}
				>
					{#if bezigTestplan}
						<LoaderCircle class="size-4 animate-spin" />
						Genereren…
					{:else}
						<ClipboardList class="size-4" />
						{testplan ? 'Opnieuw genereren' : 'Testplan genereren'}
					{/if}
				</Button>
			</div>

			{#if testplanFout}
				<div class="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
					<TriangleAlert class="size-4 shrink-0" />
					{testplanFout}
				</div>
			{/if}

			{#if bezigTestplan && !testplan}
				<div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 py-12 text-center">
					<LoaderCircle class="size-6 animate-spin text-primary" />
					<p class="text-sm font-medium">Claude stelt een testplan op…</p>
				</div>
			{:else if !testplan}
				<div class="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
					<ClipboardList class="mx-auto size-6 text-accent" />
					<p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
						Laat Claude een stap-voor-stap testplan opstellen op basis van de concepten hierboven en je
						persona's uit de trigger map.
					</p>
				</div>
			{/if}

			{#if testplan}
				<div class="rounded-md border border-brand-lime/40 bg-brand-mint/40 p-3 text-sm">
					{testplan.toelichting}
				</div>

				<div class="space-y-3">
					{#each testplan.sprints as s, i (i)}
						<div class="rounded-lg border p-4">
							<div class="flex items-center gap-2">
								<span
									class="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-semibold text-white"
								>
									{i + 1}
								</span>
								<h4 class="font-semibold">{s.titel}</h4>
							</div>
							<div class="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
								{#each SPRINT_VELDEN as veld (veld.key)}
									{#if s[veld.key]}
										<p>
											<span class="text-muted-foreground">{veld.label}:</span>
											{s[veld.key]}
										</p>
									{/if}
								{/each}
							</div>
							{#if s.concepten?.length}
								<div class="mt-2 flex flex-wrap gap-1.5">
									{#each s.concepten as c (c)}
										<span class="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{c}</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="space-y-2 rounded-lg border bg-muted/20 p-3">
					<span class="block text-sm font-medium">Niet mee eens of aanvullingen?</span>
					<Textarea
						bind:value={feedback}
						rows={2}
						placeholder="Bijv. 'begin met BOFU', 'voeg een aparte sprint voor persona X toe', 'lager budget in sprint 1'…"
					/>
					<Button
						variant="outline"
						size="sm"
						onclick={genereerTestplan}
						disabled={bezigTestplan || !feedback.trim()}
					>
						<Sparkles class="size-4" />
						Verfijn met feedback
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
