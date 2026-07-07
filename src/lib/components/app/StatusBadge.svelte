<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { STATUS_LABELS, type Status } from '$lib/config';
	import { cn } from '$lib/utils';

	let { status }: { status: Status } = $props();

	const kleur: Record<Status, string> = {
		actief: 'border-brand-lime/50 bg-brand-lime/20 text-brand-green',
		gepauzeerd: 'border-yellow-300 bg-yellow-100 text-yellow-800',
		gearchiveerd: 'border-border bg-muted text-muted-foreground'
	};
</script>

<Badge variant="outline" class={cn('font-medium', kleur[status])}>
	{STATUS_LABELS[status]}
</Badge>
