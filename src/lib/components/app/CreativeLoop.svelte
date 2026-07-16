<script lang="ts">
	import { LOOP_STAPPEN } from '$lib/creative-loop';
	import { FASE_LABELS, type Fase } from '$lib/config';

	// base optioneel: als het is meegegeven worden de knooppunten klikbaar (navigeren naar de fase-tab).
	let { fase, base }: { fase: Fase; base?: string } = $props();

	/** Fase → tab-pad (segment onder de klantpagina). */
	const FASE_TAB: Record<Fase, string> = {
		intake: 'intake',
		trigger_map: 'triggermap',
		matrix: 'matrix',
		sprint: 'sprint'
	};

	const cx = 280;
	const cy = 205;
	const R = 150; // straal knooppunten
	const LR = 186; // straal labels
	const dot = 19; // straal van een knooppunt

	let nodes = $derived(
		LOOP_STAPPEN.map((stap, i) => {
			const theta = (-90 + i * (360 / 7)) * (Math.PI / 180);
			const cos = Math.cos(theta);
			const sin = Math.sin(theta);
			const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
			return {
				...stap,
				x: cx + R * cos,
				y: cy + R * sin,
				lx: cx + LR * cos,
				ly: cy + LR * sin,
				anchor,
				actief: stap.fase === fase,
				href: base ? `${base}/${FASE_TAB[stap.fase]}` : null
			};
		})
	);
</script>

<div class="flex justify-center">
	<svg viewBox="0 0 560 430" class="h-auto w-full max-w-[560px]" role="img" aria-label="Creative Loop">
		<!-- Achtergrondring -->
		<circle
			{cx}
			{cy}
			r={R}
			fill="none"
			stroke="var(--border)"
			stroke-width="10"
			stroke-linecap="round"
		/>

		<!-- Middenlabel -->
		<text x={cx} y={cy - 10} text-anchor="middle" class="fill-muted-foreground" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase">
			Creative Loop
		</text>
		<text x={cx} y={cy + 16} text-anchor="middle" class="fill-primary" style="font-size:20px; font-weight:700">
			{FASE_LABELS[fase]}
		</text>

		{#each nodes as n (n.nummer)}
			<a href={n.href ?? undefined} class={n.href ? 'cursor-pointer transition-opacity hover:opacity-70' : undefined}>
				{#if n.href}<title>Ga naar {FASE_LABELS[n.fase]}</title>{/if}
				<!-- Knooppunt -->
				<circle
					cx={n.x}
					cy={n.y}
					r={dot}
					fill={n.actief ? 'var(--brand-lime)' : 'var(--card)'}
					stroke={n.actief ? 'var(--brand-green)' : 'var(--border)'}
					stroke-width={n.actief ? 3 : 2}
				/>
				<text
					x={n.x}
					y={n.y + 5}
					text-anchor="middle"
					style={`font-size:15px; font-weight:700; fill:${n.actief ? 'var(--brand-green)' : 'var(--muted-foreground)'}`}
				>
					{n.nummer}
				</text>

				<!-- Label -->
				<text
					x={n.lx}
					y={n.ly + 4}
					text-anchor={n.anchor}
					style={`font-size:13px; font-weight:${n.actief ? 600 : 400}; fill:${n.actief ? 'var(--foreground)' : 'var(--muted-foreground)'}`}
				>
					{n.kort}
				</text>
			</a>
		{/each}
	</svg>
</div>
