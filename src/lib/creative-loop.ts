import type { ClientFase } from './supabase/database.types';

/** Eén stap in de Creative Loop (het eigen model van Online Klik). */
export interface LoopStap {
	nummer: number;
	kort: string;
	lang: string;
	/** Op welke databasefase deze stap oplicht. */
	fase: ClientFase;
}

/**
 * De 7 stappen van de Creative Loop, gekoppeld aan de 4 databasefases:
 * intake -> stap 1, trigger_map -> stap 2, matrix -> stap 3+4, sprint -> stap 5+6+7.
 */
export const LOOP_STAPPEN: LoopStap[] = [
	{ nummer: 1, kort: 'Inzicht klant', lang: 'Bepaal wat je concept-parameters zijn', fase: 'intake' },
	{ nummer: 2, kort: 'Hypothese', lang: 'Baseer je hypothese op nieuwe concepten', fase: 'trigger_map' },
	{ nummer: 3, kort: 'Productie', lang: 'Productie', fase: 'matrix' },
	{ nummer: 4, kort: 'Naamgeving', lang: 'Geef je advertenties de juiste naam', fase: 'matrix' },
	{ nummer: 5, kort: 'Succes bepalen', lang: 'Bepaal wat een succesvolle advertentie is', fase: 'sprint' },
	{ nummer: 6, kort: 'Testen', lang: 'Test je advertenties', fase: 'sprint' },
	{ nummer: 7, kort: 'Vastleggen', lang: 'Leg vast wat je hebt geleerd', fase: 'sprint' }
];

export function stappenVoorFase(fase: ClientFase): LoopStap[] {
	return LOOP_STAPPEN.filter((s) => s.fase === fase);
}
