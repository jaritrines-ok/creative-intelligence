/** Vraagdefinities voor de intake-bronnen. */

export interface Vraag {
	nummer: number;
	blok?: string;
	tekst: string;
}

/** Bron 1 — Klantgesprek (12 vragen, 3 blokken). */
export const BRON1_VRAGEN: Vraag[] = [
	{ nummer: 1, blok: 'A — De eindklant', tekst: 'Wie is de typische koper? Beschrijf ze in eigen woorden.' },
	{ nummer: 2, blok: 'A — De eindklant', tekst: 'Wat is de situatie vlak vóórdat ze op zoek gaan naar dit product?' },
	{ nummer: 3, blok: 'A — De eindklant', tekst: 'Welke woorden of zinnen gebruiken ze zelf als ze erover praten?' },
	{ nummer: 4, blok: 'A — De eindklant', tekst: 'Wat houdt ze tegen om te kopen?' },
	{ nummer: 5, blok: 'B — Het product of de dienst', tekst: 'Wat is de #1 reden waarom iemand dit koopt boven een concurrent?' },
	{ nummer: 6, blok: 'B — Het product of de dienst', tekst: 'Welk resultaat verwacht de koper na aankoop?' },
	{ nummer: 7, blok: 'B — Het product of de dienst', tekst: 'Wat zijn de drie meest voorkomende bezwaren?' },
	{ nummer: 8, blok: 'B — Het product of de dienst', tekst: 'Zijn er bestaande klantreviews of uitspraken die je kan plakken?' },
	{ nummer: 9, blok: 'C — De markt', tekst: "Wie zijn de directe concurrenten? (namen + URL's)" },
	{ nummer: 10, blok: 'C — De markt', tekst: 'Is er een specifiek persona waar jullie als eerste mee willen starten?' },
	{ nummer: 11, blok: 'C — De markt', tekst: 'In welk seizoen of moment koopt de doelgroep het meest?' },
	{ nummer: 12, blok: 'C — De markt', tekst: 'Wat zijn jullie best verkopende producten of diensten?' }
];

/** Bron 2 — Interne interviews (klantenservice / sales). */
export const BRON2_VRAGEN: Vraag[] = [
	{ nummer: 1, tekst: 'Wat vragen (potentiële) klanten het meest vóór aankoop?' },
	{ nummer: 2, tekst: 'Wat zijn de meest voorkomende redenen waarom mensen afhaken?' },
	{ nummer: 3, tekst: 'Wat zeggen blije klanten nadat ze gekocht hebben?' },
	{ nummer: 4, tekst: 'Welke bezwaren hoor je het vaakst en hoe los je die op?' },
	{ nummer: 5, tekst: 'Zijn er specifieke woorden of zinnen die klanten steeds herhalen?' }
];

/** Sentinel-vraagnummer waarmee bron 2 als "niet beschikbaar" wordt gemarkeerd. */
export const BRON2_NVT_SENTINEL = 0;

/** Platformcategorieën voor bron 4 (reviews & social listening). */
export const BRON4_PLATFORMS = [
	'Google Reviews',
	'Trustpilot',
	'Bol.com',
	'Instagram/TikTok comments',
	'Reddit',
	'Overige social mentions'
] as const;

/** Velddefinities voor bron 5 (eigen data klant). */
export const BRON5_VELDEN = [
	{
		key: 'beste_advertenties' as const,
		label: 'Best presterende advertenties',
		hint: 'Beschrijving + wat werkte volgens de klant.'
	},
	{
		key: 'best_verkopende_producten' as const,
		label: 'Best verkopende producten/categorieën',
		hint: 'Welke producten/categorieën verkopen het best en waarom?'
	},
	{
		key: 'search_console' as const,
		label: 'Google Search Console inzichten',
		hint: 'Welke zoektermen brengen verkeer? (plakken of samenvatten)'
	},
	{
		key: 'organische_posts' as const,
		label: 'Organische posts met hoogste engagement',
		hint: 'Beschrijving + wat resoneerde.'
	}
];
