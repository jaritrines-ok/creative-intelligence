/** Intake-voortgang per bron (heuristisch, 0-100%). */

/** Doelwaarden per bron waarop 100% wordt bereikt. */
export const INTAKE_DOELEN = {
	bron1: 12, // 12 vragen in het klantgesprek
	bron2: 5, // 5 vragen interne interviews
	bron3: 3, // minimaal 3 concurrenten
	bron4: 3, // minimaal 3 bronnen met tekst
	bron5: 4 // 4 velden eigen data
} as const;

export const BRON_LABELS = [
	'Klantgesprek',
	'Interne interviews',
	'Concurrentie',
	'Reviews',
	'Eigen data'
] as const;

export interface IntakeInvoer {
	bron1Ingevuld: number;
	bron2Ingevuld: number;
	bron3Aantal: number;
	bron4Ingevuld: number;
	bron5Ingevuld: number;
}

export interface IntakeProgress {
	bron1: number;
	bron2: number;
	bron3: number;
	bron4: number;
	bron5: number;
	totaal: number;
}

function pct(n: number, doel: number): number {
	if (doel <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round((n / doel) * 100)));
}

export function berekenIntakeProgress(v: IntakeInvoer): IntakeProgress {
	const bron1 = pct(v.bron1Ingevuld, INTAKE_DOELEN.bron1);
	const bron2 = pct(v.bron2Ingevuld, INTAKE_DOELEN.bron2);
	const bron3 = pct(v.bron3Aantal, INTAKE_DOELEN.bron3);
	const bron4 = pct(v.bron4Ingevuld, INTAKE_DOELEN.bron4);
	const bron5 = pct(v.bron5Ingevuld, INTAKE_DOELEN.bron5);
	const totaal = Math.round((bron1 + bron2 + bron3 + bron4 + bron5) / 5);
	return { bron1, bron2, bron3, bron4, bron5, totaal };
}

export const LEGE_PROGRESS: IntakeProgress = {
	bron1: 0,
	bron2: 0,
	bron3: 0,
	bron4: 0,
	bron5: 0,
	totaal: 0
};

/** True als een tekstveld daadwerkelijk inhoud heeft. */
export function heeftInhoud(v: string | null | undefined): boolean {
	return !!v && v.trim().length > 0;
}

/**
 * Aantal ingevulde bron 2-antwoorden, rekening houdend met de "niet beschikbaar"-sentinel
 * (vraag_nummer 0). Is die gezet, dan telt bron 2 als volledig afgehandeld.
 */
export function bron2Ingevuld(
	rows: Array<{ vraag_nummer: number; antwoord: string | null }> | null
): number {
	const lijst = rows ?? [];
	const nvt = lijst.some((r) => r.vraag_nummer === 0 && heeftInhoud(r.antwoord));
	if (nvt) return INTAKE_DOELEN.bron2;
	return lijst.filter((r) => r.vraag_nummer > 0 && heeftInhoud(r.antwoord)).length;
}
