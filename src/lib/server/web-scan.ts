import { claudeJSON } from './claude';

/** Max. hoeveelheid paginatekst die we aan Claude voeren (tekens) — kostenbeheersing. */
const MAX_TEKST = 40_000;

/** Verwijdert HTML en geeft de leesbare tekst terug (best-effort, geen dependency). */
function stripHtml(html: string): string {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#39;|&rsquo;|&apos;/g, "'")
		.replace(/&quot;|&ldquo;|&rdquo;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Haalt de zichtbare tekst van een publieke pagina op (server-side fetch, best-effort).
 * Werkt goed voor server-gerenderde sites; JS-only sites of sites met bot-detectie kunnen
 * weinig/niets teruggeven — dan volgt een duidelijke foutmelding.
 */
export async function haalPaginaTekst(url: string): Promise<string> {
	let doel = url.trim();
	if (!/^https?:\/\//i.test(doel)) doel = 'https://' + doel;

	let parsed: URL;
	try {
		parsed = new URL(doel);
	} catch {
		throw new Error('ongeldige URL');
	}
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error('alleen http(s)-URLs zijn toegestaan');
	}

	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 15_000);
	let res: Response;
	try {
		res = await fetch(doel, {
			redirect: 'follow',
			signal: ctrl.signal,
			headers: {
				// Realistische browser-UA: veel sites blokkeren onbekende clients.
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
			}
		});
	} catch (e) {
		if (e instanceof Error && e.name === 'AbortError') {
			throw new Error('de pagina reageerde niet op tijd');
		}
		throw new Error('kon de pagina niet ophalen' + (e instanceof Error ? ` (${e.message})` : ''));
	} finally {
		clearTimeout(timer);
	}

	if (res.status === 403 || res.status === 401 || res.status === 429) {
		throw new Error(
			`de site blokkeert geautomatiseerd ophalen (status ${res.status}) — kopieer de reviewtekst en plak 'm handmatig in het samenvattingsveld`
		);
	}
	if (!res.ok) throw new Error(`de pagina gaf status ${res.status}`);

	const html = await res.text();
	const tekst = stripHtml(html);
	if (tekst.length < 60) {
		throw new Error(
			'de pagina bevatte nauwelijks leesbare tekst (mogelijk JavaScript-only of geblokkeerd) — vul de velden handmatig'
		);
	}
	return tekst.slice(0, MAX_TEKST);
}

// ---------------- Concurrent-website-scan ----------------

export interface ConcurrentScan {
	invalshoeken: string;
	website_taal: string;
	kansen: string;
}

const CONCURRENT_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		invalshoeken: { type: 'string' },
		website_taal: { type: 'string' },
		kansen: { type: 'string' }
	},
	required: ['invalshoeken', 'website_taal', 'kansen']
};

const CONCURRENT_SYSTEM = `Je bent een Social Ads Strateeg bij Online Klik. Je krijgt de ruwe tekst van de website/landingspagina van een CONCURRENT. Analyseer die als voorbereiding op advertentie-onderzoek.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "invalshoeken": "Welke invalshoeken, beloften en USP's gebruikt deze concurrent? (bullets met '- ')",
  "website_taal": "Opvallende woorden/claims/toon uit hun copy — citeer letterlijke termen waar kan.",
  "kansen": "Wat laten zij liggen of doen ze zwak? Concrete kansen voor ons om ons te onderscheiden. (bullets)"
}

Strikte regels:
- Baseer je UITSLUITEND op de aangeleverde paginatekst. Verzin niets; als iets er niet in staat, benoem het niet.
- Nederlands. Bondig en concreet, in bullets waar passend.
- Dit is een VOORSTEL dat de strateeg daarna controleert en bijstelt.`;

/** Analyseert de opgehaalde websitetekst van een concurrent → voorstel voor Bron 3-velden. */
export async function scanConcurrentWebsite(paginaTekst: string, concurrentNaam?: string | null) {
	const prompt =
		(concurrentNaam ? `Concurrent: ${concurrentNaam}\n\n` : '') +
		`## Websitetekst\n${paginaTekst}`;
	// effort 'low': extractie/samenvatting, geen zware strategie.
	return claudeJSON<ConcurrentScan>(CONCURRENT_SYSTEM, prompt, CONCURRENT_SCHEMA, 16000, 'low');
}

// ---------------- Reviews-scan ----------------

export interface ReviewScan {
	samenvatting: string;
}

const REVIEW_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		samenvatting: { type: 'string' }
	},
	required: ['samenvatting']
};

const REVIEW_SYSTEM = `Je bent een Social Ads Strateeg bij Online Klik. Je krijgt de ruwe tekst van een review-/beoordelingspagina (bijv. Trustpilot, Kiyoh, Google). Vat de reviews samen.

Geef output ALLEEN als valide JSON in dit formaat:
{
  "samenvatting": "Positief: terugkerende complimenten…\\nNegatief: klachten/frustraties…\\nGaps/kansen: wat opvalt en wat wij kunnen benutten…"
}

Strikte regels:
- Structureer de samenvatting exact in drie kopjes: "Positief:", "Negatief:", "Gaps/kansen:" — elk met korte bullets ('- ').
- Citeer waar mogelijk de letterlijke woorden van klanten (taal van de doelgroep).
- Baseer je UITSLUITEND op de aangeleverde tekst; verzin geen reviews. Staat er weinig bruikbaars, zeg dat eerlijk.
- Nederlands. Dit is een VOORSTEL dat de strateeg controleert.`;

/** Vat een opgehaalde review-pagina samen → voorstel voor het Bron 4-samenvattingsveld. */
export async function scanReviews(paginaTekst: string) {
	return claudeJSON<ReviewScan>(REVIEW_SYSTEM, `## Reviewpagina\n${paginaTekst}`, REVIEW_SCHEMA, 16000, 'low');
}
