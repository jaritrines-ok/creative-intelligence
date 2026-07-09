import { claudeJSON } from './claude';
import { BRON1_VRAGEN, BRON2_VRAGEN, type Vraag } from '$lib/intake-vragen';

/** Eén door Claude uit het document gehaald antwoord op een intake-vraag. */
export interface GeparseerdAntwoord {
	vraag_nummer: number;
	antwoord: string;
}

export interface IntakeParseResultaat {
	bron1: GeparseerdAntwoord[];
	bron2: GeparseerdAntwoord[];
}

const SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		bron1: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					vraag_nummer: { type: 'integer' },
					antwoord: { type: 'string' }
				},
				required: ['vraag_nummer', 'antwoord']
			}
		},
		bron2: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					vraag_nummer: { type: 'integer' },
					antwoord: { type: 'string' }
				},
				required: ['vraag_nummer', 'antwoord']
			}
		}
	},
	required: ['bron1', 'bron2']
};

/** Bouwt een genummerde vragenlijst voor in de prompt. */
function vragenlijst(vragen: Vraag[]): string {
	return vragen
		.map((v) => `${v.nummer}. [${v.categorie ?? 'Overig'}] ${v.tekst}`)
		.join('\n');
}

const SYSTEM = `Je bent een intake-assistent bij Social Ads agency Online Klik. Je krijgt een document (bijvoorbeeld notulen van een klantgesprek of een ingevuld intake-formulier) en twee genummerde vragenlijsten. Jouw taak: haal uit het document de antwoorden op deze vragen.

Bron 1 = het klantgesprek (vragen aan de klant over de eindklant).
Bron 2 = interne interviews met klantenservice/sales.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "bron1": [ { "vraag_nummer": 1, "antwoord": "..." } ],
  "bron2": [ { "vraag_nummer": 1, "antwoord": "..." } ]
}

Strikte regels:
- Neem een vraag ALLEEN op als het document daar echt relevante informatie over bevat. Laat vragen zonder dekking weg — verzin NOOIT antwoorden en vul niet aan met aannames.
- Gebruik het juiste "vraag_nummer" uit de lijst hieronder. Verzin geen nummers die niet in de lijst staan.
- Vat het antwoord bondig samen in het Nederlands, in de taal/woorden van de klant waar dat kan. Combineer meerdere passages als ze bij dezelfde vraag horen.
- Eén stuk informatie hoort meestal bij één vraag; plaats het bij de best passende vraag in plaats van het te herhalen.
- Als het document duidelijk over klantenservice/sales-signalen gaat, plaats dat bij Bron 2; ga anders uit van Bron 1.
- Twijfel je of iets echt in het document staat? Dan laat je het weg.`;

/**
 * Laat Claude een vrij document mappen op de intake-vragen van Bron 1 en Bron 2.
 * Schrijft niets weg — geeft een voorstel terug dat de gebruiker eerst beoordeelt.
 */
export async function parseIntakeDocument(documentTekst: string) {
	const prompt = `## Vragenlijst Bron 1 (klantgesprek)\n${vragenlijst(BRON1_VRAGEN)}\n\n## Vragenlijst Bron 2 (interne interviews)\n${vragenlijst(BRON2_VRAGEN)}\n\n## Document\n${documentTekst}`;

	// Extractie (geen strategie): effort 'low' = sneller + minder denk-tokens.
	// Ruime max_tokens zodat de (soms lange) JSON niet afknapt door de denk-tokens.
	return claudeJSON<IntakeParseResultaat>(SYSTEM, prompt, SCHEMA, 16000, 'low');
}
