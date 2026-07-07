<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import AutoSaveField from '$lib/components/app/AutoSaveField.svelte';
	import { saver, postIntake } from '$lib/intake-saver.svelte';
	import { berekenIntakeProgress, heeftInhoud } from '$lib/progress';
	import { cn } from '$lib/utils';
	import {
		BRON1_VRAGEN,
		BRON2_VRAGEN,
		BRON4_PLATFORMS,
		BRON5_VELDEN
	} from '$lib/intake-vragen';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	let { data } = $props();
	let clientId = $derived(data.client.id);

	// ---- lokale state uit serverdata ----
	function naarMap(rows: Array<{ vraag_nummer: number; antwoord: string | null }>) {
		const m: Record<number, string> = {};
		for (const r of rows) m[r.vraag_nummer] = r.antwoord ?? '';
		return m;
	}

	// svelte-ignore state_referenced_locally
	let bron1Antw = $state(naarMap(data.bron1));
	// svelte-ignore state_referenced_locally
	let bron2Antw = $state(naarMap(data.bron2.filter((r) => r.vraag_nummer > 0)));
	// svelte-ignore state_referenced_locally
	let bron2Nvt = $state(data.bron2.some((r) => r.vraag_nummer === 0 && heeftInhoud(r.antwoord)));
	// svelte-ignore state_referenced_locally
	let bron3 = $state(data.bron3.map((r) => ({ ...r })));
	// svelte-ignore state_referenced_locally
	let bron4 = $state(data.bron4.map((r) => ({ ...r })));
	// svelte-ignore state_referenced_locally
	let bron5 = $state({
		beste_advertenties: data.bron5?.beste_advertenties ?? '',
		best_verkopende_producten: data.bron5?.best_verkopende_producten ?? '',
		search_console: data.bron5?.search_console ?? '',
		organische_posts: data.bron5?.organische_posts ?? ''
	});

	let actief = $state<'bron1' | 'bron2' | 'bron3' | 'bron4' | 'bron5'>('bron1');

	// ---- live voortgang ----
	let progress = $derived(
		berekenIntakeProgress({
			bron1Ingevuld: Object.values(bron1Antw).filter(heeftInhoud).length,
			bron2Ingevuld: bron2Nvt ? 5 : Object.values(bron2Antw).filter(heeftInhoud).length,
			bron3Aantal: bron3.length,
			bron4Ingevuld: bron4.filter((r) => heeftInhoud(r.ruwe_tekst)).length,
			bron5Ingevuld: Object.values(bron5).filter(heeftInhoud).length
		})
	);

	let tabs = $derived([
		{ key: 'bron1' as const, label: 'Klantgesprek', pct: progress.bron1 },
		{ key: 'bron2' as const, label: 'Interne interviews', pct: progress.bron2 },
		{ key: 'bron3' as const, label: 'Concurrentie', pct: progress.bron3 },
		{ key: 'bron4' as const, label: 'Reviews', pct: progress.bron4 },
		{ key: 'bron5' as const, label: 'Eigen data', pct: progress.bron5 }
	]);

	// ---- opslag-acties ----
	function bewaarBron1(nummer: number, waarde: string) {
		bron1Antw[nummer] = waarde;
		return postIntake({ type: 'bron1', clientId, vraagNummer: nummer, antwoord: waarde });
	}
	function bewaarBron2(nummer: number, waarde: string) {
		bron2Antw[nummer] = waarde;
		return postIntake({ type: 'bron2', clientId, vraagNummer: nummer, antwoord: waarde });
	}
	async function toggleNvt() {
		bron2Nvt = !bron2Nvt;
		await postIntake({ type: 'bron2', clientId, vraagNummer: 0, antwoord: bron2Nvt ? '1' : '' });
	}
	function bewaarBron5(veld: keyof typeof bron5, waarde: string) {
		bron5[veld] = waarde;
		return postIntake({ type: 'bron5', clientId, veld, waarde });
	}

	async function voegConcurrentToe() {
		if (bron3.length >= 10) return;
		const { id } = await postIntake<{ id: string }>({ type: 'bron3.insert', clientId });
		bron3.push({
			id,
			client_id: clientId,
			naam: '',
			url: '',
			meta_ad_library: '',
			invalshoeken: '',
			website_taal: '',
			tiktok_observaties: '',
			kansen: '',
			created_at: new Date().toISOString()
		});
	}
	async function verwijderConcurrent(id: string) {
		if (!confirm('Deze concurrent verwijderen?')) return;
		await postIntake({ type: 'bron3.delete', id });
		bron3 = bron3.filter((c) => c.id !== id);
	}
	function bewaarConcurrent(rij: (typeof bron3)[number], veld: string, waarde: string) {
		(rij as Record<string, unknown>)[veld] = waarde;
		return postIntake({ type: 'bron3.update', id: rij.id, patch: { [veld]: waarde } });
	}

	async function voegBron4Toe() {
		const { id } = await postIntake<{ id: string }>({ type: 'bron4.insert', clientId });
		bron4.push({
			id,
			client_id: clientId,
			platform: '',
			bron_naam: '',
			ruwe_tekst: '',
			updated_at: new Date().toISOString()
		});
	}
	async function verwijderBron4(id: string) {
		if (!confirm('Deze bron verwijderen?')) return;
		await postIntake({ type: 'bron4.delete', id });
		bron4 = bron4.filter((r) => r.id !== id);
	}
	function bewaarBron4(rij: (typeof bron4)[number], veld: string, waarde: string) {
		(rij as Record<string, unknown>)[veld] = waarde;
		return postIntake({ type: 'bron4.update', id: rij.id, patch: { [veld]: waarde } });
	}

	const bron3Velden = [
		{ key: 'meta_ad_library', label: 'Lang draaiende ad formats (Meta Ad Library)' },
		{ key: 'invalshoeken', label: 'Welke invalshoeken / beloften gebruiken zij?' },
		{ key: 'website_taal', label: 'Opvallende taal op website of landingspagina' },
		{ key: 'tiktok_observaties', label: 'TikTok Creative Center observaties (optioneel)' },
		{ key: 'kansen', label: 'Wat doen zij NIET wat een kans is?' }
	];
</script>

<!-- Auto-save statusbalk -->
<div class="mb-4 flex items-center justify-between">
	<p class="text-sm text-muted-foreground">
		Alles wordt automatisch opgeslagen. Niet elke bron hoeft ingevuld te zijn.
	</p>
	<div class="flex items-center gap-1.5 text-xs">
		{#if saver.fout}
			<TriangleAlert class="size-3.5 text-destructive" />
			<span class="text-destructive">Opslaan mislukt</span>
		{:else if saver.actief > 0}
			<LoaderCircle class="size-3.5 animate-spin text-muted-foreground" />
			<span class="text-muted-foreground">Opslaan…</span>
		{:else if saver.laatstOpgeslagen}
			<Check class="size-3.5 text-brand-green" />
			<span class="text-muted-foreground">Alle wijzigingen opgeslagen</span>
		{/if}
	</div>
</div>

<!-- Bron-tabs -->
<div class="flex flex-wrap gap-2">
	{#each tabs as t (t.key)}
		<button
			type="button"
			onclick={() => (actief = t.key)}
			class={cn(
				'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
				actief === t.key
					? 'border-primary bg-primary/5 text-primary'
					: 'border-border text-muted-foreground hover:bg-muted'
			)}
		>
			{t.label}
			<span
				class={cn(
					'rounded-full px-1.5 py-0.5 text-xs font-semibold',
					t.pct >= 100
						? 'bg-brand-lime/25 text-brand-green'
						: t.pct > 0
							? 'bg-muted text-foreground'
							: 'bg-muted text-muted-foreground'
				)}
			>
				{t.pct}%
			</span>
		</button>
	{/each}
</div>

<div class="mt-6">
	<!-- ============ BRON 1 ============ -->
	{#if actief === 'bron1'}
		<div class="space-y-6">
			{#each BRON1_VRAGEN as v, i (v.nummer)}
				{#if i === 0 || BRON1_VRAGEN[i - 1].blok !== v.blok}
					<h3 class="border-b pb-1 text-sm font-semibold uppercase tracking-wide text-brand-green">
						Blok {v.blok}
					</h3>
				{/if}
				<div class="space-y-2">
					<Label for={`b1-${v.nummer}`}>{v.nummer}. {v.tekst}</Label>
					<AutoSaveField
						id={`b1-${v.nummer}`}
						value={bron1Antw[v.nummer] ?? ''}
						onsave={(w) => bewaarBron1(v.nummer, w)}
						placeholder="Antwoord…"
					/>
				</div>
			{/each}
		</div>
	{/if}

	<!-- ============ BRON 2 ============ -->
	{#if actief === 'bron2'}
		<div class="space-y-6">
			<label
				class="flex w-fit items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
			>
				<input
					type="checkbox"
					checked={bron2Nvt}
					onchange={toggleNvt}
					class="size-4 accent-[var(--brand-green)]"
				/>
				Niet beschikbaar — deze klant heeft geen klantenservice/sales om te interviewen
			</label>

			{#if bron2Nvt}
				<p class="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
					Deze bron is gemarkeerd als niet beschikbaar en telt als afgehandeld.
				</p>
			{:else}
				{#each BRON2_VRAGEN as v (v.nummer)}
					<div class="space-y-2">
						<Label for={`b2-${v.nummer}`}>{v.nummer}. {v.tekst}</Label>
						<AutoSaveField
							id={`b2-${v.nummer}`}
							value={bron2Antw[v.nummer] ?? ''}
							onsave={(w) => bewaarBron2(v.nummer, w)}
							placeholder="Antwoord…"
						/>
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- ============ BRON 3 ============ -->
	{#if actief === 'bron3'}
		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				Voeg 3 tot 10 concurrenten toe. ({bron3.length} toegevoegd)
			</p>

			{#each bron3 as c, i (c.id)}
				<div class="rounded-lg border p-4">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-sm font-semibold">Concurrent {i + 1}</span>
						<Button variant="ghost" size="sm" onclick={() => verwijderConcurrent(c.id)}>
							<Trash2 class="size-4" />
						</Button>
					</div>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label>Naam</Label>
							<AutoSaveField
								multiline={false}
								value={c.naam ?? ''}
								onsave={(w) => bewaarConcurrent(c, 'naam', w)}
								placeholder="Naam concurrent"
							/>
						</div>
						<div class="space-y-1.5">
							<Label>URL</Label>
							<AutoSaveField
								multiline={false}
								value={c.url ?? ''}
								onsave={(w) => bewaarConcurrent(c, 'url', w)}
								placeholder="https://…"
							/>
						</div>
					</div>
					<div class="mt-3 space-y-3">
						{#each bron3Velden as veld (veld.key)}
							<div class="space-y-1.5">
								<Label>{veld.label}</Label>
								<AutoSaveField
									rows={2}
									value={(c as Record<string, string | null>)[veld.key] ?? ''}
									onsave={(w) => bewaarConcurrent(c, veld.key, w)}
								/>
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<Button variant="outline" onclick={voegConcurrentToe} disabled={bron3.length >= 10}>
				<Plus class="size-4" />
				Concurrent toevoegen
			</Button>
		</div>
	{/if}

	<!-- ============ BRON 4 ============ -->
	{#if actief === 'bron4'}
		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				Plak ruwe reviews en comments per bron. Claude verwerkt dit later bij de trigger map.
			</p>

			{#each bron4 as r, i (r.id)}
				<div class="rounded-lg border p-4">
					<div class="mb-3 flex items-center justify-between">
						<span class="text-sm font-semibold">Bron {i + 1}</span>
						<Button variant="ghost" size="sm" onclick={() => verwijderBron4(r.id)}>
							<Trash2 class="size-4" />
						</Button>
					</div>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label>Platform</Label>
							<select
								value={r.platform ?? ''}
								onchange={(e) => bewaarBron4(r, 'platform', e.currentTarget.value)}
								class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<option value="" disabled>Kies platform…</option>
								{#each BRON4_PLATFORMS as p (p)}
									<option value={p}>{p}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1.5">
							<Label>Naam van de bron</Label>
							<AutoSaveField
								multiline={false}
								value={r.bron_naam ?? ''}
								onsave={(w) => bewaarBron4(r, 'bron_naam', w)}
								placeholder="Bijv. Trustpilot Equalité"
							/>
						</div>
					</div>
					<div class="mt-3 space-y-1.5">
						<Label>Ruwe tekst</Label>
						<AutoSaveField
							rows={5}
							value={r.ruwe_tekst ?? ''}
							onsave={(w) => bewaarBron4(r, 'ruwe_tekst', w)}
							placeholder="Plak hier reviews, comments of quotes…"
						/>
					</div>
				</div>
			{/each}

			<Button variant="outline" onclick={voegBron4Toe}>
				<Plus class="size-4" />
				Bron toevoegen
			</Button>
		</div>
	{/if}

	<!-- ============ BRON 5 ============ -->
	{#if actief === 'bron5'}
		<div class="space-y-5">
			{#each BRON5_VELDEN as veld (veld.key)}
				<div class="space-y-1.5">
					<Label for={`b5-${veld.key}`}>{veld.label}</Label>
					<p class="text-xs text-muted-foreground">{veld.hint}</p>
					<AutoSaveField
						id={`b5-${veld.key}`}
						rows={4}
						value={bron5[veld.key]}
						onsave={(w) => bewaarBron5(veld.key, w)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
