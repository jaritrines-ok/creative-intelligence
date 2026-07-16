/** Types en definities voor de Sprint-fase (Fase 4). */

/** Creative brief zoals gegenereerd door Claude. */
export interface Brief {
	hypothese: string;
	wie: string;
	gedrag: string;
	format: string;
	structuur: string;
	hook: string;
	kern: string;
	cta: string;
	variabele: string;
	succes: string;
}

/** Learning-analyse van de testresultaten. */
export interface Analyse {
	wat_werkte: string;
	volgende_stap: string;
}

/** Herkent een statisch beeld (geen video/motion) uit het vrije format-veld. */
export function isStatischFormat(format?: string | null): boolean {
	const f = (format ?? '').toLowerCase();
	return f.includes('static') || f.includes('statisch');
}

/** Herkent een carousel uit het vrije format-veld. */
export function isCarouselFormat(format?: string | null): boolean {
	const f = (format ?? '').toLowerCase();
	return f.includes('carousel') || f.includes('carrousel');
}

/**
 * Labels + rendervolgorde voor de brief-secties, aangepast aan het formaat.
 * Video/motion → "Hook (0–3 sec)" / "Kern"; statisch → "Eye-catcher" / "Boodschap";
 * carousel → "Eerste kaart" / "Volgende kaarten".
 */
export function briefSecties(format?: string | null): Array<{ key: keyof Brief; label: string }> {
	const stat = isStatischFormat(format);
	const car = isCarouselFormat(format);
	const hookLabel = stat
		? 'Eye-catcher / openingsbeeld'
		: car
			? 'Eerste kaart (scroll-stopper)'
			: 'Hook (0–3 sec)';
	const kernLabel = stat ? 'Boodschap / copy' : car ? 'Volgende kaarten' : 'Kern';
	return [
		{ key: 'hypothese', label: 'Hypothese' },
		{ key: 'wie', label: 'Wie + fase + bewustzijn' },
		{ key: 'gedrag', label: 'Gewenst gedrag' },
		{ key: 'format', label: 'Format' },
		{ key: 'structuur', label: stat ? 'Lay-out / compositie' : 'Structuur' },
		{ key: 'hook', label: hookLabel },
		{ key: 'kern', label: kernLabel },
		{ key: 'cta', label: 'CTA' },
		{ key: 'variabele', label: 'Variabele die getest wordt' },
		{ key: 'succes', label: 'Succescriterium' }
	];
}

/** Labels + rendervolgorde voor de brief-secties (video-default; gebruik briefSecties(format) waar mogelijk). */
export const BRIEF_SECTIES = briefSecties(null);

/** Zet een brief om naar Markdown (voor kopiëren/exporteren). */
export function briefNaarMarkdown(b: Brief, titel: string, format?: string | null): string {
	const secties = briefSecties(format);
	return (
		`# Creative brief — ${titel}\n\n` +
		secties.map((s) => `## ${s.label}\n${b[s.key] ?? ''}`).join('\n\n') +
		'\n'
	);
}

/** Metric-velden voor de sprint-resultaten (kolommen op concepts). */
export const METRIC_VELDEN = [
	{ key: 'hook_rate' as const, label: 'Hook rate', suffix: '%', hoogGoed: true },
	{ key: 'hold_rate' as const, label: 'Hold rate', suffix: '%', hoogGoed: true },
	{ key: 'ctr' as const, label: 'CTR', suffix: '%', hoogGoed: true },
	{ key: 'roas' as const, label: 'ROAS', suffix: '×', hoogGoed: true },
	{ key: 'cpa' as const, label: 'CPA', suffix: '€', hoogGoed: false }
];

export type MetricKey = (typeof METRIC_VELDEN)[number]['key'];
