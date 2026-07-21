import { claudeJSON } from './claude';
import { BRON1_VRAGEN, BRON2_VRAGEN, type Vraag } from '$lib/intake-vragen';

/** Eén door Claude uit het document gehaald antwoord op een genummerde intake-vraag (Bron 1/2). */
export interface GeparseerdAntwoord {
	vraag_nummer: number;
	antwoord: string;
}

/** Een uit het document afgeleide concurrent (Bron 3). */
export interface GeparseerdeConcurrent {
	naam: string;
	url: string;
	invalshoeken: string;
	website_taal: string;
	kansen: string;
}

/** Een uit het document afgeleide reviewbron (Bron 4). */
export interface GeparseerdeReview {
	platform: string;
	bron_naam: string;
	samenvatting: string;
}

export interface IntakeParseResultaat {
	bron1: GeparseerdAntwoord[];
	bron2: GeparseerdAntwoord[];
	bron3: GeparseerdeConcurrent[];
	bron4: GeparseerdeReview[];
}

const ANTWOORD_ITEMS = {
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
};

const SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		bron1: ANTWOORD_ITEMS,
		bron2: ANTWOORD_ITEMS,
		bron3: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					naam: { type: 'string' },
					url: { type: 'string' },
					invalshoeken: { type: 'string' },
					website_taal: { type: 'string' },
					kansen: { type: 'string' }
				},
				required: ['naam', 'url', 'invalshoeken', 'website_taal', 'kansen']
			}
		},
		bron4: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				properties: {
					platform: { type: 'string' },
					bron_naam: { type: 'string' },
					samenvatting: { type: 'string' }
				},
				required: ['platform', 'bron_naam', 'samenvatting']
			}
		}
	},
	required: ['bron1', 'bron2', 'bron3', 'bron4']
};

/** Bouwt een genummerde vragenlijst voor in de prompt. */
function vragenlijst(vragen: Vraag[]): string {
	return vragen
		.map((v) => `${v.nummer}. [${v.categorie ?? 'Overig'}] ${v.tekst}`)
		.join('\n');
}

const SYSTEM = `Je bent een intake-assistent bij Social Ads agency Online Klik. Je krijgt een document en moet de inhoud naar de JUISTE intake-bron routeren. Er zijn vier bronnen:

- Bron 1 = Klantgesprek: antwoorden op genummerde vragen over de EINDKLANT (doelgroep, koopmotivatie, problemen, twijfels, taal van de klant).
- Bron 2 = Interne interviews: signalen van klantenservice/sales (vragen van klanten, afhaakredenen, misverstanden).
- Bron 3 = Concurrentie: informatie OVER concurrenten (hun invalshoeken/beloften, opvallende website-taal, kansen die zij laten liggen).
- Bron 4 = Reviews: beoordelingen/reviews (van eigen klanten óf van concurrenten), samengevat in positief/negatief/gaps.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "bron1": [ { "vraag_nummer": 1, "antwoord": "..." } ],
  "bron2": [ { "vraag_nummer": 1, "antwoord": "..." } ],
  "bron3": [ { "naam": "concurrent", "url": "", "invalshoeken": "", "website_taal": "", "kansen": "" } ],
  "bron4": [ { "platform": "Trustpilot/Kiyoh/Google/...", "bron_naam": "", "samenvatting": "Positief: ...\\nNegatief: ...\\nGaps/kansen: ..." } ]
}

ROUTEER ZO:
- Gaat het document (of een deel) over REVIEWS/beoordelingen? → zet dat in "bron4" (per platform/bron een samenvatting met kopjes "Positief:", "Negatief:", "Gaps/kansen:"). NIET in bron1/bron2 stoppen.
- Gaat het over CONCURRENTEN? → zet dat in "bron3" (per concurrent een item; vul alleen de velden die het document dekt, laat andere leeg "").
- Gaat het over de EINDKLANT (interview/gesprek)? → map op de genummerde vragen van Bron 1, of Bron 2 als het duidelijk klantenservice/sales-signalen zijn.

Strikte regels:
- Neem alleen op wat het document ECHT bevat. Verzin NIETS en vul niet aan met aannames. Twijfel je? Weglaten.
- Voor Bron 1/2: gebruik het juiste "vraag_nummer" uit de lijsten hieronder; verzin geen nummers.
- Voor Bron 3: "naam" is verplicht (de concurrent). Laat velden zonder dekking op "".
- Voor Bron 4: vul "samenvatting" met de drie kopjes; citeer waar mogelijk de letterlijke woorden van klanten. "platform"/"bron_naam" op "" als onbekend.
- Als een bron niet in het document voorkomt, geef een lege array voor die bron.
- Taal: Nederlands, in de woorden van de klant waar dat kan.`;

/**
 * Laat Claude een vrij document routeren naar de vier intake-bronnen (Bron 1-4).
 * Schrijft niets weg — geeft een voorstel terug dat de gebruiker eerst beoordeelt.
 */
export async function parseIntakeDocument(documentTekst: string) {
	const prompt = `## Vragenlijst Bron 1 (klantgesprek)\n${vragenlijst(BRON1_VRAGEN)}\n\n## Vragenlijst Bron 2 (interne interviews)\n${vragenlijst(BRON2_VRAGEN)}\n\n## Document\n${documentTekst}`;

	// Extractie (geen strategie): effort 'low' = sneller + minder denk-tokens.
	// Ruime max_tokens zodat de (soms lange) JSON niet afknapt door de denk-tokens.
	return claudeJSON<IntakeParseResultaat>(SYSTEM, prompt, SCHEMA, 16000, 'low');
}
