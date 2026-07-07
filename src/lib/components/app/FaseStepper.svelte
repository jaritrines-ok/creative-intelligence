<script lang="ts">
	import { FASES, FASE_LABELS, faseIndex, type Fase } from '$lib/config';
	import { cn } from '$lib/utils';

	let { fase }: { fase: Fase } = $props();
	let idx = $derived(faseIndex(fase));
</script>

<div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
	{#each FASES as f, i (f)}
		<span
			class={cn(
				'font-medium',
				i === idx ? 'text-brand-green' : i < idx ? 'text-muted-foreground' : 'text-muted-foreground/50'
			)}
		>
			{FASE_LABELS[f]}
		</span>
		{#if i < FASES.length - 1}
			<span class="text-muted-foreground/30">›</span>
		{/if}
	{/each}
</div>
