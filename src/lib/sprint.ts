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

/** Labels + rendervolgorde voor de brief-secties. */
export const BRIEF_SECTIES: Array<{ key: keyof Brief; label: string }> = [
	{ key: 'hypothese', label: 'Hypothese' },
	{ key: 'wie', label: 'Wie + fase + bewustzijn' },
	{ key: 'gedrag', label: 'Gewenst gedrag' },
	{ key: 'format', label: 'Format' },
	{ key: 'structuur', label: 'Structuur' },
	{ key: 'hook', label: 'Hook (0–3 sec)' },
	{ key: 'kern', label: 'Kern' },
	{ key: 'cta', label: 'CTA' },
	{ key: 'variabele', label: 'Variabele die getest wordt' },
	{ key: 'succes', label: 'Succescriterium' }
];

/** Metric-velden voor de sprint-resultaten (kolommen op concepts). */
export const METRIC_VELDEN = [
	{ key: 'hook_rate' as const, label: 'Hook rate', suffix: '%', hoogGoed: true },
	{ key: 'hold_rate' as const, label: 'Hold rate', suffix: '%', hoogGoed: true },
	{ key: 'ctr' as const, label: 'CTR', suffix: '%', hoogGoed: true },
	{ key: 'roas' as const, label: 'ROAS', suffix: '×', hoogGoed: true },
	{ key: 'cpa' as const, label: 'CPA', suffix: '€', hoogGoed: false }
];

export type MetricKey = (typeof METRIC_VELDEN)[number]['key'];
