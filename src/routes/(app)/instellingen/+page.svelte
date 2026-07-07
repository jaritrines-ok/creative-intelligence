<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { datumKort } from '$lib/format';
	import { cn } from '$lib/utils';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { data, form } = $props();
	let bezig = $state(false);

	const veldClass =
		'h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none';
</script>

{#if form?.foutmelding}
	<div class="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
		{form.foutmelding}
	</div>
{/if}
{#if form?.aangemaakt}
	<div class="mb-4 rounded-md bg-brand-lime/15 px-3 py-2 text-sm text-brand-green">
		Gebruiker {form.aangemaakt} is aangemaakt.
	</div>
{/if}

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
	<!-- Gebruikerslijst -->
	<div class="lg:col-span-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Gebruikers</Card.Title>
				<Card.Description>Beheer wie toegang heeft en welke rol ze hebben.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="overflow-x-auto">
					<table class="w-full min-w-[560px] text-sm">
						<thead>
							<tr class="border-b text-left text-xs font-medium text-muted-foreground">
								<th class="p-2">Naam</th>
								<th class="p-2">E-mail</th>
								<th class="p-2">Rol</th>
								<th class="p-2">Sinds</th>
								<th class="p-2 text-right">Acties</th>
							</tr>
						</thead>
						<tbody>
							{#each data.gebruikers as g (g.id)}
								<tr class="border-b align-middle">
									<td class="p-2 font-medium">{g.naam || '—'}</td>
									<td class="p-2 text-muted-foreground">{g.email}</td>
									<td class="p-2">
										<form method="POST" action="?/rolWijzigen" use:enhance>
											<input type="hidden" name="id" value={g.id} />
											<select
												name="rol"
												value={g.rol}
												onchange={(e) => e.currentTarget.form?.requestSubmit()}
												class={cn(veldClass, 'w-32')}
											>
												<option value="gebruiker">Gebruiker</option>
												<option value="admin">Admin</option>
											</select>
										</form>
									</td>
									<td class="p-2 text-muted-foreground">{datumKort(g.created_at)}</td>
									<td class="p-2 text-right">
										<form
											method="POST"
											action="?/verwijderen"
											use:enhance={({ cancel }) => {
												if (!confirm(`Gebruiker "${g.naam || g.email}" verwijderen? Dit verwijdert ook al hun klanten en data.`)) {
													cancel();
												}
											}}
										>
											<input type="hidden" name="id" value={g.id} />
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												class="text-muted-foreground hover:text-destructive"
											>
												<Trash2 class="size-4" />
											</Button>
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Nieuwe gebruiker -->
	<Card.Root class="h-fit">
		<Card.Header>
			<Card.Title>Nieuwe gebruiker</Card.Title>
			<Card.Description>Maak een account aan (direct actief).</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/aanmaken"
				use:enhance={() => {
					bezig = true;
					return async ({ update }) => {
						await update();
						bezig = false;
					};
				}}
				class="space-y-4"
			>
				<div class="space-y-1.5">
					<Label for="naam">Naam</Label>
					<Input id="naam" name="naam" placeholder="Volledige naam" />
				</div>
				<div class="space-y-1.5">
					<Label for="email">E-mailadres <span class="text-destructive">*</span></Label>
					<Input id="email" name="email" type="email" required placeholder="naam@onlineklik.nl" />
				</div>
				<div class="space-y-1.5">
					<Label for="wachtwoord">Wachtwoord <span class="text-destructive">*</span></Label>
					<Input
						id="wachtwoord"
						name="wachtwoord"
						type="text"
						required
						placeholder="Minimaal 8 tekens"
					/>
				</div>
				<div class="space-y-1.5">
					<Label for="rol">Rol</Label>
					<select id="rol" name="rol" class={cn(veldClass, 'h-9 w-full')}>
						<option value="gebruiker">Gebruiker</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<Button type="submit" class="w-full" disabled={bezig}>
					<UserPlus class="size-4" />
					{bezig ? 'Bezig…' : 'Gebruiker aanmaken'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
