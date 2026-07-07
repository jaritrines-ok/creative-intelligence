<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import StatusBadge from '$lib/components/app/StatusBadge.svelte';
	import FaseStepper from '$lib/components/app/FaseStepper.svelte';
	import IntakeProgress from '$lib/components/app/IntakeProgress.svelte';
	import { relatieveTijd } from '$lib/format';
	import { cn } from '$lib/utils';
	import { APP_NAAM } from '$lib/config';
	import Plus from '@lucide/svelte/icons/plus';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';

	let { data } = $props();
</script>

<svelte:head>
	<title>Klanten · {APP_NAAM}</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-8 py-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Klanten</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Overzicht van al je klanten en hun voortgang.
			</p>
		</div>
		<Button href="/klanten/nieuw">
			<Plus class="size-4" />
			Nieuwe klant
		</Button>
	</div>

	<div class="mt-8">
		{#if data.clients.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-16 text-center"
			>
				<p class="text-sm font-medium text-foreground">Nog geen klanten</p>
				<p class="mt-1 max-w-sm text-sm text-muted-foreground">
					Maak je eerste klant aan om te starten met de intake en de creatieve flow.
				</p>
				<Button href="/klanten/nieuw" class="mt-4">
					<Plus class="size-4" />
					Nieuwe klant
				</Button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each data.clients as klant (klant.id)}
					<Card.Root
						class={cn(
							'transition-shadow hover:shadow-md',
							klant.status === 'gearchiveerd' && 'opacity-60'
						)}
					>
						<Card.Header>
							<div class="flex items-start justify-between gap-2">
								<div class="min-w-0">
									<Card.Title class="truncate">
										<a href={`/klanten/${klant.id}`} class="hover:text-primary hover:underline">
											{klant.naam}
										</a>
									</Card.Title>
									<Card.Description class="truncate">
										{klant.sector || 'Geen sector'}
									</Card.Description>
								</div>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="sm" class="-mr-2 shrink-0">
												<EllipsisVertical class="size-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a href={`/klanten/${klant.id}`} {...props}>Openen</a>
											{/snippet}
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a href={`/klanten/${klant.id}/bewerken`} {...props}>Bewerken</a>
											{/snippet}
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</Card.Header>

						<Card.Content class="space-y-4">
							<div class="flex items-center justify-between gap-2">
								<StatusBadge status={klant.status} />
								<FaseStepper fase={klant.huidige_fase} />
							</div>
							<div>
								<p class="mb-1.5 text-xs font-medium text-muted-foreground">Intake-voortgang</p>
								<IntakeProgress progress={klant.progress} compact />
							</div>
						</Card.Content>

						<Card.Footer>
							<p class="text-xs text-muted-foreground">
								Laatst bijgewerkt {relatieveTijd(klant.updated_at)}
							</p>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</div>
</div>
