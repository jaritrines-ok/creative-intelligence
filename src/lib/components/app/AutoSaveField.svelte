<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';

	let {
		value = '',
		onsave,
		placeholder = '',
		multiline = true,
		rows = 3,
		id
	}: {
		value?: string | null;
		onsave: (waarde: string) => Promise<unknown>;
		placeholder?: string;
		multiline?: boolean;
		rows?: number;
		id?: string;
	} = $props();

	const DEBOUNCE = 700;
	// svelte-ignore state_referenced_locally
	let lokaal = $state(value ?? '');
	// svelte-ignore state_referenced_locally
	let laatst = $state(value ?? '');
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function bewaar() {
		clearTimeout(timer);
		if (lokaal === laatst) return;
		const teBewaren = lokaal;
		try {
			await onsave(teBewaren);
			laatst = teBewaren;
		} catch {
			// Fout wordt centraal getoond via de saver-status.
		}
	}

	function opInput() {
		clearTimeout(timer);
		timer = setTimeout(bewaar, DEBOUNCE);
	}
</script>

{#if multiline}
	<Textarea
		{id}
		{rows}
		{placeholder}
		bind:value={lokaal}
		oninput={opInput}
		onblur={bewaar}
	/>
{:else}
	<Input {id} {placeholder} bind:value={lokaal} oninput={opInput} onblur={bewaar} />
{/if}
