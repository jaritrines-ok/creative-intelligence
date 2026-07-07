/** Gedeelde types voor de trigger map (client + server). */

export interface Invalshoek {
	naam: string;
	omschrijving: string;
	funnelfase: 'TOFU' | 'MOFU' | 'BOFU';
	onderbouwing: string;
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
