<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { datumTijd } from '$lib/format';
	import { cn } from '$lib/utils';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { data } = $props();
	let open = $state<string | null>(null);

	function toggle(id: string) {
		open = open === id ? null : id;
	}
</script>

{#if data.logs.length === 0}
	<div class="rounded-lg border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
		Nog geen AI-activiteit. Zodra er een trigger map wordt gegenereerd, verschijnt die hier.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<table class="w-full min-w-[820px] text-sm">
			<thead>
				<tr class="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
					<th class="w-8 p-2"></th>
					<th class="p-2">Datum</th>
					<th class="p-2">Klant</th>
					<th class="p-2">Gebruiker</th>
					<th class="p-2">Module</th>
					<th class="p-2">Model</th>
					<th class="p-2 text-right">Tokens (in / uit)</th>
					<th class="p-2 text-right">Duur</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logs as log (log.id)}
					<tr
						class="cursor-pointer border-b hover:bg-muted/40"
						onclick={() => toggle(log.id)}
					>
						<td class="p-2 text-muted-foreground">
							<ChevronRight
								class={cn('size-4 transition-transform', open === log.id && 'rotate-90')}
							/>
						</td>
						<td class="whitespace-nowrap p-2 text-muted-foreground">{datumTijd(log.created_at)}</td>
						<td class="p-2">{log.klantNaam}</td>
						<td class="p-2 text-muted-foreground">{log.gebruikerNaam}</td>
						<td class="p-2"><Badge variant="outline">{log.module ?? '—'}</Badge></td>
						<td class="p-2 text-muted-foreground">{log.model ?? '—'}</td>
						<td class="whitespace-nowrap p-2 text-right text-muted-foreground">
							{log.tokens_input ?? '—'} / {log.tokens_output ?? '—'}
						</td>
						<td class="whitespace-nowrap p-2 text-right text-muted-foreground">
							{log.duur_ms != null ? Math.round(log.duur_ms / 100) / 10 + ' s' : '—'}
						</td>
					</tr>
					{#if open === log.id}
						<tr class="border-b bg-muted/20">
							<td colspan="8" class="p-4">
								<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
									<div>
										<p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Prompt
										</p>
										<pre
											class="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border bg-background p-3 text-xs">{log.prompt ?? '—'}</pre>
									</div>
									<div>
										<p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Response
										</p>
										<pre
											class="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border bg-background p-3 text-xs">{log.response ?? '—'}</pre>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-xs text-muted-foreground">Meest recente 200 AI-calls.</p>
{/if}
