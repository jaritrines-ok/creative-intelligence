<script lang="ts">
	import { FASES, FASE_LABELS, faseIndex, type Fase } from '$lib/config';
	import { cn } from '$lib/utils';

	// Compacte, horizontale variant van de Creative Loop voor de werk-tabs.
	// base optioneel: als meegegeven worden de fases klikbaar (naar de fase-tab).
	let { fase, base }: { fase: Fase; base?: string } = $props();

	const FASE_TAB: Record<Fase, string> = {
		intake: 'intake',
		trigger_map: 'triggermap',
		matrix: 'matrix',
		sprint: 'sprint'
	};

	let huidigeIndex = $derived(faseIndex(fase));
</script>

<nav
	class="flex items-center gap-1 overflow-x-auto rounded-lg border bg-card px-3 py-2 text-sm"
	aria-label="Creative Loop"
>
	<span class="mr-1 hidden shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground md:inline">
		Loop
	</span>
	{#each FASES as f, i (f)}
		{@const actief = f === fase}
		{@const gedaan = i < huidigeIndex}
		<a
			href={base ? `${base}/${FASE_TAB[f]}` : undefined}
			class={cn(
				'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors',
				actief
					? 'border-brand-lime/50 bg-brand-lime/20 font-medium text-brand-green'
					: 'border-transparent text-muted-foreground hover:bg-muted'
			)}
		>
			<span
				class={cn(
					'flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
					actief
						? 'bg-brand-green text-white'
						: gedaan
							? 'bg-brand-lime/40 text-brand-green'
							: 'bg-muted text-muted-foreground'
				)}
			>
				{i + 1}
			</span>
			<span class="hidden sm:inline">{FASE_LABELS[f]}</span>
		</a>
		{#if i < FASES.length - 1}
			<span class="h-px w-3 shrink-0 bg-border sm:w-5"></span>
		{/if}
	{/each}
</nav>
