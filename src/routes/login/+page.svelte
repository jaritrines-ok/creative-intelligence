<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { APP_NAAM, ORGANISATIE } from '$lib/config';

	let { form } = $props();
	let bezig = $state(false);
</script>

<svelte:head>
	<title>Inloggen · {APP_NAAM}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-brand-mint p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header class="space-y-1 text-center">
			<span class="text-xs font-semibold uppercase tracking-widest text-accent">
				{ORGANISATIE}
			</span>
			<Card.Title class="text-2xl text-primary">{APP_NAAM}</Card.Title>
			<Card.Description>Log in om verder te gaan</Card.Description>
		</Card.Header>

		<form
			method="POST"
			use:enhance={() => {
				bezig = true;
				return async ({ update }) => {
					await update();
					bezig = false;
				};
			}}
		>
			<Card.Content class="space-y-4">
				{#if form?.error}
					<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{form.error}
					</p>
				{/if}

				<div class="space-y-2">
					<Label for="email">E-mailadres</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						placeholder="naam@onlineklik.nl"
						required
						value={form?.email ?? ''}
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Wachtwoord</Label>
					<Input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
					/>
				</div>
			</Card.Content>

			<Card.Footer>
				<Button type="submit" class="w-full" disabled={bezig}>
					{bezig ? 'Bezig met inloggen…' : 'Inloggen'}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
