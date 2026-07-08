import { claudeJSON } from './claude';
import type { Brief, Analyse } from '$lib/sprint';

interface ConceptContext {
	funnelfase: string | null;
	invalshoek: string | null;
	format: string | null;
	structuur: string | null;
	creator_type: string | null;
	hypothese: string | null;
	variabele: string | null;
}

interface TriggerMapContext {
	pijnpunten?: string[];
	wensen?: string[];
	bezwaren?: string[];
	taal_doelgroep?: string[];
	invalshoeken?: Array<{ naam?: string; omschrijving?: string }>;
}

const BRIEF_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		hypothese: { type: 'string' },
		wie: { type: 'string' },
		gedrag: { type: 'string' },
		format: { type: 'string' },
		structuur: { type: 'string' },
		hook: { type: 'string' },
		kern: { type: 'string' },
		cta: { type: 'string' },
		variabele: { type: 'string' },
		succes: { type: 'string' }
	},
	required: ['hypothese', 'wie', 'gedrag', 'format', 'structuur', 'hook', 'kern', 'cta', 'variabele', 'succes']
};

const ANALYSE_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		wat_werkte: { type: 'string' },
		volgende_stap: { type: 'string' }
	},
	required: ['wat_werkte', 'volgende_stap']
};

const BRIEF_SYSTEM = `Je bent een Creative Social Ads Strateeg bij Online Klik. Schrijf een concrete, uitvoerbare creative brief voor één advertentieconcept, gebaseerd op het concept en de trigger map.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "hypothese": "Wij geloven dat ... omdat ...",
  "wie": "doelgroep + funnelfase + bewustzijnsniveau",
  "gedrag": "welk gedrag je wilt uitlokken (na 3 sec / na volledig zien)",
  "format": "concreet formaat (bijv. verticale video 9:16, 15-25 sec, UGC)",
  "structuur": "opbouw van de creative",
  "hook": "de eerste 0-3 seconden — letterlijk uitgeschreven",
  "kern": "wat er in het midden gebeurt",
  "cta": "de call-to-action",
  "variabele": "welke variabele in deze test wordt geïsoleerd en waarom",
  "succes": "meetbaar succescriterium (concrete drempel + termijn)"
}

Richtlijnen:
- Taal: Nederlands
- Concreet en uitvoerbaar — een creator moet er direct mee aan de slag kunnen
- Gebruik de taal van de doelgroep uit de trigger map waar passend
- Baseer je op het concept en de trigger map; verzin geen cijfers die er niet zijn`;

const ANALYSE_SYSTEM = `Je bent een Creative Social Ads Strateeg bij Online Klik. Analyseer de testresultaten van één advertentieconcept en bepaal wat werkte en de beste volgende stap.

Houd rekening met de testvolgorde: Invalshoek → Format → Structuur → Creator. Test steeds één variabele per keer.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "wat_werkte": "wat de cijfers en observatie laten zien (2-4 zinnen)",
  "volgende_stap": "de concrete aanbevolen volgende test of actie (2-4 zinnen)"
}

Richtlijnen:
- Taal: Nederlands
- Wees concreet en beslissend
- Benchmarks als richtlijn: hook rate >45% sterk, CTR >2% goed, ROAS >4x goed, lage CPA is beter
- Als een concept wint: adviseer de volgende variabele in de testvolgorde te testen op dit concept
- Baseer je alleen op de aangeleverde cijfers en observatie — geen aannames`;

function conceptTekst(c: ConceptContext): string {
	return [
		`Funnelfase: ${c.funnelfase ?? '—'}`,
		`Invalshoek: ${c.invalshoek ?? '—'}`,
		`Format: ${c.format ?? '—'}`,
		`Structuur: ${c.structuur ?? '—'}`,
		`Creator type: ${c.creator_type ?? '—'}`,
		`Hypothese: ${c.hypothese ?? '—'}`,
		`Te testen variabele: ${c.variabele ?? '—'}`
	].join('\n');
}

export async function genereerBrief(concept: ConceptContext, tm: TriggerMapContext) {
	const context = [
		'## Concept',
		conceptTekst(concept),
		'',
		'## Trigger map (context)',
		tm.pijnpunten?.length ? `Pijnpunten: ${tm.pijnpunten.join('; ')}` : '',
		tm.wensen?.length ? `Wensen: ${tm.wensen.join('; ')}` : '',
		tm.bezwaren?.length ? `Bezwaren: ${tm.bezwaren.join('; ')}` : '',
		tm.taal_doelgroep?.length ? `Taal doelgroep: ${tm.taal_doelgroep.join('; ')}` : '',
		tm.invalshoeken?.length
			? `Invalshoeken: ${tm.invalshoeken.map((i) => `${i.naam ?? ''} — ${i.omschrijving ?? ''}`).join(' | ')}`
			: ''
	]
		.filter(Boolean)
		.join('\n');

	return claudeJSON<Brief>(BRIEF_SYSTEM, context, BRIEF_SCHEMA);
}

export async function analyseerResultaat(
	concept: ConceptContext,
	metrics: { hook_rate?: number | null; hold_rate?: number | null; ctr?: number | null; roas?: number | null; cpa?: number | null },
	observatie: string | null
) {
	const context = [
		'## Concept',
		conceptTekst(concept),
		'',
		'## Testresultaten',
		`Hook rate: ${metrics.hook_rate ?? '—'}%`,
		`Hold rate: ${metrics.hold_rate ?? '—'}%`,
		`CTR: ${metrics.ctr ?? '—'}%`,
		`ROAS: ${metrics.roas ?? '—'}x`,
		`CPA: €${metrics.cpa ?? '—'}`,
		'',
		`## Kwalitatieve observatie\n${observatie?.trim() || '(geen)'}`
	].join('\n');

	return claudeJSON<Analyse>(ANALYSE_SYSTEM, context, ANALYSE_SCHEMA);
}
