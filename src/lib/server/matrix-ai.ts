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
	onderbouwing: string;
}

interface TriggerMapContext {
	pijnpunten?: string[];
	wensen?: string[];
	bezwaren?: string[];
	taal_doelgroep?: string[];
	kansen_vs_concurrenten?: string[];
	personas?: Array<{
		naam?: string;
		omschrijving?: string;
		kernbehoefte?: string;
		kernbezwaar?: string;
	}>;
	invalshoeken?: Array<{
		naam?: string;
		omschrijving?: string;
		onderbouwing?: string;
		funnelfase?: string;
		status?: string;
		gearchiveerd?: boolean;
	}>;
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
					prioriteit: { type: 'string', enum: ['Hoog', 'Middel', 'Laag'] },
					onderbouwing: { type: 'string' }
				},
				required: [
					'funnelfase',
					'invalshoek',
					'format',
					'structuur',
					'creator_type',
					'hypothese',
					'variabele',
					'prioriteit',
					'onderbouwing'
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
    { "funnelfase": "TOFU/MOFU/BOFU", "invalshoek": "...", "format": "...", "structuur": "...", "creator_type": "...", "hypothese": "...", "variabele": "...", "prioriteit": "Hoog/Middel/Laag", "onderbouwing": "..." }
  ]
}

Richtlijnen:
- Maak één concept per invalshoek uit de trigger map (dek TOFU, MOFU én BOFU af); 6 tot 9 concepten.
- Testvolgorde is Invalshoek → Format → Structuur → Creator. In deze eerste opzet test je de INVALSHOEK, dus zet "variabele" bij ELK concept op "Invalshoek".
- CRUCIAAL — schoon testen: omdat je nu de invalshoek test, moeten de andere variabelen GELIJK blijven zodat het verschil alleen door de invalshoek komt. Kies daarom PER FUNNELFASE één vast "format", één vaste "structuur" en één vast "creator_type", en gebruik die identiek voor alle concepten binnen die fase. Alleen "invalshoek" (en de bijbehorende "hypothese") verschilt binnen een fase. Verschillende fases mogen wél een ander format/structuur/creator hebben.
- Kies "format" bij voorkeur uit: Video UGC, Static, Motion graphic, Carousel.
- Kies "structuur" bij voorkeur uit: GRWM, Probleem-oplossing, POV, Testimonial, Dag-in-het-leven, Benefit bullets.
- "creator_type": kort (bijv. "Micro-influencer", "Klant/UGC", "Merk zelf").
- "hypothese": concreet en toetsbaar (Wij verwachten dat ... omdat ...).
- "prioriteit" (Hoog/Middel/Laag): weeg af op (a) hoe sterk de invalshoek aansluit op een belangrijk pijnpunt/wens/kans, (b) hoeveel of hoe belangrijk het persona-segment is dat 'ie raakt, en (c) de funnelfase (warme BOFU vaak Hoog). Maak deze weging expliciet in de onderbouwing.
- "onderbouwing": 1-3 zinnen die transparant maken WAAROM dit concept in de matrix staat. Benoem concreet (a) waarom deze invalshoek kansrijk is — koppel het aan een specifiek pijnpunt, wens, bezwaar of kans uit de trigger map — en (b) waarom je deze prioriteit geeft. Dit is de verantwoording die de strateeg leest om je keuze te kunnen controleren; wees specifiek, niet generiek.
- Taal: Nederlands. Gebruik de taal van de doelgroep waar passend. Baseer je op de trigger map — geen aannames.`;

export async function genereerMatrix(tm: TriggerMapContext, richtlijnen?: string) {
	// Gearchiveerde invalshoeken tellen niet meer mee.
	const actieveInvalshoeken = (tm.invalshoeken ?? []).filter((i) => !i.gearchiveerd);
	const context = [
		'## Trigger map',
		actieveInvalshoeken.length
			? 'Invalshoeken (per funnelfase; status tussen haakjes; met onderbouwing = waarom kansrijk):\n' +
				actieveInvalshoeken
					.map(
						(i) =>
							`- [${i.funnelfase ?? '?'}] ${i.naam ?? ''} (${i.status ?? 'Nieuw'}): ${i.omschrijving ?? ''}` +
							(i.onderbouwing ? `\n    Onderbouwing: ${i.onderbouwing}` : '')
					)
					.join('\n') +
				'\n\nMaak concepten voor invalshoeken die nog NIET succesvol getest zijn (sla "Getest — werkt" over tenzij er te weinig overblijven).'
			: '',
		tm.personas?.length
			? "Persona's / doelgroep-segmenten (weeg mee bij prioriteit — een invalshoek die een belangrijk segment raakt weegt zwaarder):\n" +
				tm.personas
					.map(
						(p) =>
							`- ${p.naam ?? ''}: ${p.omschrijving ?? ''} (behoefte: ${p.kernbehoefte ?? '?'}; bezwaar: ${p.kernbezwaar ?? '?'})`
					)
					.join('\n')
			: '',
		tm.pijnpunten?.length ? `Pijnpunten: ${tm.pijnpunten.join('; ')}` : '',
		tm.wensen?.length ? `Wensen: ${tm.wensen.join('; ')}` : '',
		tm.bezwaren?.length ? `Bezwaren: ${tm.bezwaren.join('; ')}` : '',
		tm.taal_doelgroep?.length ? `Taal doelgroep: ${tm.taal_doelgroep.join('; ')}` : '',
		tm.kansen_vs_concurrenten?.length
			? `Kansen t.o.v. concurrenten: ${tm.kansen_vs_concurrenten.join('; ')}`
			: '',
		richtlijnen?.trim()
			? `## Extra sturing van de strateeg (VERWERK DIT expliciet in de concepten en/of prioriteit)\n${richtlijnen.trim()}`
			: ''
	]
		.filter(Boolean)
		.join('\n\n');

	// effort 'low': de context (persona's, invalshoek-onderbouwing, sturing) is al rijk aangeleverd,
	// dus veel extra denkwerk is niet nodig. 'high'/'medium' liepen tegen ~100s/~88s aan (over de
	// Vercel-timeout van 60s); 'low' houdt de kwaliteit op peil en de duur ruim onder de limiet.
	return claudeJSON<{ concepten: VoorgesteldConcept[] }>(SYSTEM, context, SCHEMA, 16000, 'low');
}
