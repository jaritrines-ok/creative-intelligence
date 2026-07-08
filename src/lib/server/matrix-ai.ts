import { claudeJSON } from './claude';
import type { Funnelfase, Prioriteit } from '$lib/supabase/database.types';

export interface VoorgesteldConcept {
	funnelfase: Funnelfase;
	invalshoek: string;
	format: string;
	structuur: string;
	creator_type: string;
	hypothese: string;
	variabele: string;
	prioriteit: Prioriteit;
}

interface TriggerMapContext {
	pijnpunten?: string[];
	wensen?: string[];
	bezwaren?: string[];
	taal_doelgroep?: string[];
	kansen_vs_concurrenten?: string[];
	invalshoeken?: Array<{ naam?: string; omschrijving?: string; funnelfase?: string }>;
}

const SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		concepten: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					funnelfase: { type: 'string', enum: ['TOFU', 'MOFU', 'BOFU'] },
					invalshoek: { type: 'string' },
					format: { type: 'string' },
					structuur: { type: 'string' },
					creator_type: { type: 'string' },
					hypothese: { type: 'string' },
					variabele: { type: 'string' },
					prioriteit: { type: 'string', enum: ['Hoog', 'Middel', 'Laag'] }
				},
				required: [
					'funnelfase',
					'invalshoek',
					'format',
					'structuur',
					'creator_type',
					'hypothese',
					'variabele',
					'prioriteit'
				]
			}
		}
	},
	required: ['concepten']
};

const SYSTEM = `Je bent een Creative Social Ads Strateeg bij Online Klik. Op basis van de trigger map stel je een variabelenmatrix (testopzet) voor: een set advertentieconcepten om te gaan testen.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "concepten": [
    { "funnelfase": "TOFU/MOFU/BOFU", "invalshoek": "...", "format": "...", "structuur": "...", "creator_type": "...", "hypothese": "...", "variabele": "...", "prioriteit": "Hoog/Middel/Laag" }
  ]
}

Richtlijnen:
- Stel 6 tot 9 concepten voor.
- Bouw voort op de 3 invalshoeken uit de trigger map en dek TOFU, MOFU én BOFU af.
- Testvolgorde is Invalshoek → Format → Structuur → Creator. In deze eerste opzet test je de INVALSHOEK, dus zet "variabele" op "Invalshoek".
- Kies "format" bij voorkeur uit: Video UGC, Static, Motion graphic, Carousel.
- Kies "structuur" bij voorkeur uit: GRWM, Probleem-oplossing, POV, Testimonial, Dag-in-het-leven, Benefit bullets.
- "creator_type": kort (bijv. "Micro-influencer", "Klant/UGC", "Merk zelf").
- "hypothese": concreet en toetsbaar (Wij verwachten dat ... omdat ...).
- "prioriteit": op basis van kans en funnelfase (warme BOFU vaak Hoog).
- Taal: Nederlands. Gebruik de taal van de doelgroep waar passend. Baseer je op de trigger map — geen aannames.`;

export async function genereerMatrix(tm: TriggerMapContext) {
	const context = [
		'## Trigger map',
		tm.invalshoeken?.length
			? 'Invalshoeken:\n' +
				tm.invalshoeken
					.map(
						(i) =>
							`- ${i.naam ?? ''} (${i.funnelfase ?? '?'}): ${i.omschrijving ?? ''}`
					)
					.join('\n')
			: '',
		tm.pijnpunten?.length ? `Pijnpunten: ${tm.pijnpunten.join('; ')}` : '',
		tm.wensen?.length ? `Wensen: ${tm.wensen.join('; ')}` : '',
		tm.bezwaren?.length ? `Bezwaren: ${tm.bezwaren.join('; ')}` : '',
		tm.taal_doelgroep?.length ? `Taal doelgroep: ${tm.taal_doelgroep.join('; ')}` : '',
		tm.kansen_vs_concurrenten?.length
			? `Kansen t.o.v. concurrenten: ${tm.kansen_vs_concurrenten.join('; ')}`
			: ''
	]
		.filter(Boolean)
		.join('\n\n');

	return claudeJSON<{ concepten: VoorgesteldConcept[] }>(SYSTEM, context, SCHEMA, 4000);
}
