/** Vraagdefinities voor de intake-bronnen. */

export interface Vraag {
	nummer: number;
	categorie?: string;
	tekst: string;
}

/**
 * Bron 1 — Klantgesprek: verdiepingsvragen over de eindklant, gesteld aan de klant.
 * Thematisch geordend. Niet alles hoeft ingevuld te zijn.
 */
export const BRON1_VRAGEN: Vraag[] = [
	// Doelgroep
	{ nummer: 1, categorie: 'Doelgroep', tekst: 'Wie is jullie belangrijkste doelgroep?' },
	{ nummer: 2, categorie: 'Doelgroep', tekst: 'Zijn er meerdere doelgroepen te onderscheiden?' },
	{ nummer: 3, categorie: 'Doelgroep', tekst: 'Hoe ziet jullie ideale klant eruit?' },
	{ nummer: 4, categorie: 'Doelgroep', tekst: 'Welke doelgroep is commercieel het meest interessant?' },
	{ nummer: 5, categorie: 'Doelgroep', tekst: 'Welke doelgroep willen jullie in de toekomst meer aantrekken?' },
	{ nummer: 6, categorie: 'Doelgroep', tekst: 'Wat weten jullie over leeftijd, geslacht, regio en type klant?' },
	{ nummer: 7, categorie: 'Doelgroep', tekst: 'Zijn er duidelijke klantgroepen die vaker terugkomen?' },
	{ nummer: 8, categorie: 'Doelgroep', tekst: 'Welke klanten leveren de meeste omzet, marge of herhaalaankopen op?' },

	// Koopmotivatie
	{ nummer: 9, categorie: 'Koopmotivatie', tekst: 'Waarom kiezen klanten volgens jullie voor jullie?' },
	{ nummer: 10, categorie: 'Koopmotivatie', tekst: "Wat zijn jullie belangrijkste USP's?" },
	{ nummer: 11, categorie: 'Koopmotivatie', tekst: "Welke USP's worden door klanten zelf vaak genoemd?" },
	{ nummer: 12, categorie: 'Koopmotivatie', tekst: 'Welke behoefte of wens zit er meestal achter de aankoop?' },
	{ nummer: 13, categorie: 'Koopmotivatie', tekst: 'Welke trigger zorgt ervoor dat klanten nú actie ondernemen?' },
	{ nummer: 14, categorie: 'Koopmotivatie', tekst: 'Waarom kiezen klanten voor jullie in plaats van een concurrent?' },
	{ nummer: 15, categorie: 'Koopmotivatie', tekst: 'Welke argumenten overtuigen twijfelende klanten het vaakst?' },

	// Problemen en frustraties
	{ nummer: 16, categorie: 'Problemen & frustraties', tekst: 'Welk probleem lossen jullie voor klanten op?' },
	{ nummer: 17, categorie: 'Problemen & frustraties', tekst: 'Waar lopen klanten tegenaan voordat ze bij jullie kopen?' },
	{ nummer: 18, categorie: 'Problemen & frustraties', tekst: 'Welke frustraties horen jullie vaak terug?' },
	{ nummer: 19, categorie: 'Problemen & frustraties', tekst: 'Waar ergeren klanten zich aan binnen jullie markt of bij concurrenten?' },
	{ nummer: 20, categorie: 'Problemen & frustraties', tekst: 'Welke klachten, retourredenen of misverstanden komen vaker voor?' },
	{ nummer: 40, categorie: 'Problemen & frustraties', tekst: 'Welke problemen ontstaan door onduidelijke informatie?' },
	{ nummer: 41, categorie: 'Problemen & frustraties', tekst: 'Welke problemen kunnen we voorkomen met betere content?' },

	// Twijfels en bezwaren
	{ nummer: 21, categorie: 'Twijfels & bezwaren', tekst: 'Waar twijfelen klanten over voordat ze kopen?' },
	{ nummer: 22, categorie: 'Twijfels & bezwaren', tekst: 'Welke bezwaren gaan over prijs?' },
	{ nummer: 23, categorie: 'Twijfels & bezwaren', tekst: 'Welke bezwaren gaan over kwaliteit, levering, service of garantie?' },
	{ nummer: 24, categorie: 'Twijfels & bezwaren', tekst: 'Welke informatie helpt klanten om vertrouwen te krijgen?' },
	{ nummer: 25, categorie: 'Twijfels & bezwaren', tekst: 'Welke reviews, voorbeelden, garanties of cases werken goed?' },
	{ nummer: 42, categorie: 'Twijfels & bezwaren', tekst: 'Welke twijfels zouden we proactief moeten wegnemen?' },

	// Alternatieven en concurrenten
	{ nummer: 26, categorie: 'Alternatieven & concurrenten', tekst: 'Welke alternatieven overwegen klanten?' },
	{ nummer: 27, categorie: 'Alternatieven & concurrenten', tekst: 'Welke concurrenten worden vaak genoemd?' },
	{ nummer: 28, categorie: 'Alternatieven & concurrenten', tekst: 'Waarom kiezen klanten soms voor een alternatief?' },
	{ nummer: 29, categorie: 'Alternatieven & concurrenten', tekst: 'Waarom stappen klanten juist over naar jullie?' },
	{ nummer: 30, categorie: 'Alternatieven & concurrenten', tekst: 'Waarin verschillen jullie volgens klanten van concurrenten?' },
	{ nummer: 43, categorie: 'Alternatieven & concurrenten', tekst: 'Welke vergelijkingen zouden we eerlijk kunnen uitleggen?' },

	// Doelen en gewenste uitkomst
	{ nummer: 31, categorie: 'Doelen & uitkomst', tekst: 'Wat willen klanten uiteindelijk bereiken?' },
	{ nummer: 32, categorie: 'Doelen & uitkomst', tekst: 'Wanneer is een klant volgens jullie écht tevreden?' },
	{ nummer: 33, categorie: 'Doelen & uitkomst', tekst: 'Welke resultaten worden vaak genoemd in reviews of klantreacties?' },
	{ nummer: 34, categorie: 'Doelen & uitkomst', tekst: 'Welke verwachtingen moeten jullie beter managen?' },

	// Interesses en context
	{ nummer: 35, categorie: 'Interesses & context', tekst: 'In welke situatie zitten klanten meestal wanneer ze bij jullie komen?' },
	{ nummer: 36, categorie: 'Interesses & context', tekst: 'Welke momenten, seizoenen of gebeurtenissen beïnvloeden koopgedrag?' },
	{ nummer: 37, categorie: 'Interesses & context', tekst: 'Waar halen klanten inspiratie of informatie vandaan?' },
	{ nummer: 38, categorie: 'Interesses & context', tekst: 'Welke onderwerpen vindt de doelgroep interessant naast jullie product of dienst?' },
	{ nummer: 39, categorie: 'Interesses & context', tekst: 'Welke woorden, termen of voorbeelden gebruiken klanten zelf vaak?' }
];

/**
 * Bron 2 — Interne interviews (klantenservice / sales): wat het team concreet hoort.
 * Optionele bron — markeer als "niet beschikbaar" als er geen klantenservice is.
 */
export const BRON2_VRAGEN: Vraag[] = [
	// Vragen van klanten
	{ nummer: 1, categorie: 'Vragen van klanten', tekst: 'Welke vragen krijgt customer service het vaakst?' },
	{ nummer: 2, categorie: 'Vragen van klanten', tekst: 'Welke vragen komen vooral vóór aankoop terug?' },
	{ nummer: 3, categorie: 'Vragen van klanten', tekst: 'Welke vragen komen vooral ná aankoop terug?' },
	{ nummer: 4, categorie: 'Vragen van klanten', tekst: 'Welke vragen gaan over prijs, kwaliteit, levering, service, garantie of gebruik?' },
	{ nummer: 5, categorie: 'Vragen van klanten', tekst: 'Welke vragen kosten customer service de meeste tijd?' },
	{ nummer: 6, categorie: 'Vragen van klanten', tekst: 'Welke vergelijkingsvragen (t.o.v. concurrenten) stellen klanten?' },

	// Afhaken, bezwaren & aankoop
	{ nummer: 7, categorie: 'Afhaken & aankoop', tekst: 'Wat zijn de meest voorkomende redenen waarom mensen afhaken?' },
	{ nummer: 8, categorie: 'Afhaken & aankoop', tekst: 'Welke bezwaren hoor je het vaakst en hoe los je die op?' },
	{ nummer: 9, categorie: 'Afhaken & aankoop', tekst: 'Wat hoort customer service vaak als reden tot aankoop?' },
	{ nummer: 10, categorie: 'Afhaken & aankoop', tekst: 'Wat zeggen blije klanten nadat ze gekocht hebben?' },

	// Misverstanden
	{ nummer: 11, categorie: 'Misverstanden', tekst: 'Wat begrijpen klanten vaak verkeerd?' },
	{ nummer: 12, categorie: 'Misverstanden', tekst: 'Welke aannames kloppen vaak niet?' },
	{ nummer: 13, categorie: 'Misverstanden', tekst: 'Welke uitleg moet customer service vaak herhalen?' },
	{ nummer: 14, categorie: 'Misverstanden', tekst: 'Welke begrippen of producteigenschappen zijn onduidelijk?' },
	{ nummer: 15, categorie: 'Misverstanden', tekst: 'Welke verkeerde verwachtingen zorgen voor extra vragen of klachten?' },

	// Taal
	{ nummer: 16, categorie: 'Taal', tekst: 'Zijn er specifieke woorden of zinnen die klanten steeds herhalen?' }
];

/** Minimaal aantal ingevulde Bron 1-antwoorden voordat de trigger map gegenereerd mag worden. */
export const BRON1_DREMPEL = 8;

/** Sentinel-vraagnummer waarmee bron 2 als "niet beschikbaar" wordt gemarkeerd. */
export const BRON2_NVT_SENTINEL = 0;

/** Platformcategorieën voor bron 4 (reviews & social listening). */
export const BRON4_PLATFORMS = [
	'Google Reviews',
	'Trustpilot',
	'Kiyoh',
	'Bol.com',
	'Instagram/TikTok comments',
	'Reddit',
	'Overige social mentions',
	'Anders'
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
