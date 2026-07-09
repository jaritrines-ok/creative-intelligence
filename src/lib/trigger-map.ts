/** Gedeelde types voor de trigger map (client + server). */

export type Funnelfase = 'TOFU' | 'MOFU' | 'BOFU';

/** Levenscyclus van een invalshoek — houdt de trigger map "levend". */
export type InvalshoekStatus = 'Nieuw' | 'In test' | 'Getest — werkt' | 'Getest — werkt niet';

export const INVALSHOEK_STATUSSEN: InvalshoekStatus[] = [
	'Nieuw',
	'In test',
	'Getest — werkt',
	'Getest — werkt niet'
];

export const FUNNELFASES: Funnelfase[] = ['TOFU', 'MOFU', 'BOFU'];

export interface Invalshoek {
	naam: string;
	omschrijving: string;
	funnelfase: Funnelfase;
	onderbouwing: string;
	/** Levenscyclus-status; ontbreekt op oudere data → behandeld als 'Nieuw'. */
	status?: InvalshoekStatus;
	/** Gearchiveerde invalshoeken tellen niet meer mee en verschijnen niet in de matrix. */
	gearchiveerd?: boolean;
}

/** Status van een invalshoek, met terugval op 'Nieuw' voor oudere data. */
export function invalshoekStatus(inv: Invalshoek): InvalshoekStatus {
	return inv.status ?? 'Nieuw';
}

export interface TriggerMapData {
	pijnpunten: string[];
	wensen: string[];
	bezwaren: string[];
	taal_doelgroep: string[];
	routines: string[];
	kansen_vs_concurrenten: string[];
	invalshoeken: Invalshoek[];
}

/** Secties met een label, in weergavevolgorde. Sleutels = kolommen in trigger_map_versions. */
export const TRIGGER_MAP_SECTIES = [
	{ key: 'pijnpunten', label: 'Pijnpunten' },
	{ key: 'wensen', label: 'Wensen' },
	{ key: 'bezwaren', label: 'Bezwaren' },
	{ key: 'taal_doelgroep', label: 'Taal van de doelgroep' },
	{ key: 'routines', label: 'Routines' },
	{ key: 'kansen_vs_concurrenten', label: 'Kansen t.o.v. concurrenten' }
] as const;

export type TekstSectieKey = (typeof TRIGGER_MAP_SECTIES)[number]['key'];

export const LEGE_TRIGGER_MAP: TriggerMapData = {
	pijnpunten: [],
	wensen: [],
	bezwaren: [],
	taal_doelgroep: [],
	routines: [],
	kansen_vs_concurrenten: [],
	invalshoeken: []
};
