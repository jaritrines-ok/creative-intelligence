<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { APP_NAAM } from '$lib/config';

	let { children } = $props();
	let pad = $derived(page.url.pathname);

	const tabs = [
		{ label: 'Gebruikers', href: '/instellingen' },
		{ label: 'AI-logs', href: '/instellingen/logs' }
	];
</script>

<svelte:head>
	<title>Instellingen · {APP_NAAM}</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-8 py-8">
	<h1 class="text-2xl font-bold text-foreground">Instellingen</h1>
	<p class="mt-1 text-sm text-muted-foreground">Beheer gebruikers en bekijk AI-activiteit.</p>

	<div class="mt-6 border-b">
		<nav class="flex gap-1">
			{#each tabs as t (t.href)}
				<a
					href={t.href}
					class={cn(
						'-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
						pad === t.href
							? 'border-primary text-primary'
							: 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
					)}
				>
					{t.label}
				</a>
			{/each}
		</nav>
	</div>

	<div class="mt-6">
		{@render children()}
	</div>
</div>
