<script lang="ts">
	import { BRON_LABELS, type IntakeProgress } from '$lib/progress';
	import { cn } from '$lib/utils';

	let {
		progress,
		compact = false
	}: { progress: IntakeProgress; compact?: boolean } = $props();

	let bronnen = $derived([
		progress.bron1,
		progress.bron2,
		progress.bron3,
		progress.bron4,
		progress.bron5
	]);

	function balkKleur(p: number) {
		if (p >= 100) return 'bg-brand-lime';
		if (p > 0) return 'bg-brand-green/70';
		return 'bg-muted';
	}
</script>

{#if compact}
	<div class="flex items-center gap-2" title={`Intake: ${progress.totaal}%`}>
		<div class="flex flex-1 gap-1">
			{#each bronnen as p, i (i)}
				<div
					class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
					title={`${BRON_LABELS[i]}: ${p}%`}
				>
					<div class={cn('h-full rounded-full transition-all', balkKleur(p))} style={`width:${p}%`}></div>
				</div>
			{/each}
		</div>
		<span class="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">
			{progress.totaal}%
		</span>
	</div>
{:else}
	<div class="space-y-2">
		{#each bronnen as p, i (i)}
			<div class="flex items-center gap-3">
				<span class="w-32 shrink-0 text-xs text-muted-foreground">{BRON_LABELS[i]}</span>
				<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
					<div class={cn('h-full rounded-full transition-all', balkKleur(p))} style={`width:${p}%`}></div>
				</div>
				<span class="w-9 shrink-0 text-right text-xs font-medium">{p}%</span>
			</div>
		{/each}
	</div>
{/if}
