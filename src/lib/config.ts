/** Applicatie-brede constanten voor de Creative Intelligence App. */

export const APP_NAAM = 'Creative Intelligence';
export const ORGANISATIE = 'Online Klik';

/** Standaard Claude-model; overschrijfbaar via ANTHROPIC_MODEL env var. */
export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-5';

/** Klantfases (komt overeen met clients.huidige_fase in de database). */
export const FASES = ['intake', 'trigger_map', 'matrix', 'sprint'] as const;
export type Fase = (typeof FASES)[number];

export const FASE_LABELS: Record<Fase, string> = {
	intake: 'Intake',
	trigger_map: 'Trigger Map',
	matrix: 'Matrix',
	sprint: 'Sprint'
};

/** Volgorde-index van een fase (0-gebaseerd). */
export function faseIndex(fase: Fase): number {
	return FASES.indexOf(fase);
}

/** Klantstatussen (komt overeen met clients.status). */
export const STATUSSEN = ['actief', 'gepauzeerd', 'gearchiveerd'] as const;
export type Status = (typeof STATUSSEN)[number];

export const STATUS_LABELS: Record<Status, string> = {
	actief: 'Actief',
	gepauzeerd: 'Gepauzeerd',
	gearchiveerd: 'Gearchiveerd'
};
