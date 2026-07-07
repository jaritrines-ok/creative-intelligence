import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Database } from '$lib/supabase/database.types';

type Bron5Insert = Database['public']['Tables']['intake_bron5']['Insert'];

const BRON3_VELDEN = [
	'naam',
	'url',
	'meta_ad_library',
	'invalshoeken',
	'website_taal',
	'tiktok_observaties',
	'kansen'
];
const BRON4_VELDEN = ['platform', 'bron_naam', 'ruwe_tekst'];
const BRON5_VELDEN = [
	'beste_advertenties',
	'best_verkopende_producten',
	'search_console',
	'organische_posts'
];

/** Beperkt een patch-object tot toegestane velden. */
function schoonPatch(patch: unknown, toegestaan: string[]): Record<string, string | null> {
	const uit: Record<string, string | null> = {};
	if (patch && typeof patch === 'object') {
		for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
			if (toegestaan.includes(k)) uit[k] = v == null ? null : String(v);
		}
	}
	return uit;
}

export const POST: RequestHandler = async ({ request, locals: { supabase, user } }) => {
	if (!user) error(401, 'Niet ingelogd');

	const body = await request.json().catch(() => null);
	if (!body || typeof body.type !== 'string') error(400, 'Ongeldig verzoek');

	const { type } = body;
	const sb = supabase;

	switch (type) {
		case 'bron1':
		case 'bron2': {
			const tabel = type === 'bron1' ? 'intake_bron1' : 'intake_bron2';
			const clientId = String(body.clientId ?? '');
			const vraagNummer = Number(body.vraagNummer);
			const max = type === 'bron1' ? 12 : 5;
			const min = type === 'bron1' ? 1 : 0; // bron2: 0 = "niet beschikbaar"-sentinel
			if (!clientId || !Number.isInteger(vraagNummer) || vraagNummer < min || vraagNummer > max) {
				error(400, 'Ongeldige vraag');
			}
			const antwoord = body.antwoord == null ? null : String(body.antwoord);
			const { error: dbFout } = await sb
				.from(tabel)
				.upsert(
					{ client_id: clientId, vraag_nummer: vraagNummer, antwoord },
					{ onConflict: 'client_id,vraag_nummer' }
				);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'bron5': {
			const clientId = String(body.clientId ?? '');
			const veld = String(body.veld ?? '');
			if (!clientId || !BRON5_VELDEN.includes(veld)) error(400, 'Ongeldig veld');
			const waarde = body.waarde == null ? null : String(body.waarde);
			const payload = { client_id: clientId } as Bron5Insert;
			(payload as Record<string, unknown>)[veld] = waarde;
			const { error: dbFout } = await sb
				.from('intake_bron5')
				.upsert(payload, { onConflict: 'client_id' });
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'bron3.insert':
		case 'bron4.insert': {
			const tabel = type === 'bron3.insert' ? 'intake_bron3_concurrenten' : 'intake_bron4';
			const clientId = String(body.clientId ?? '');
			if (!clientId) error(400, 'Ontbrekende klant');
			const { data, error: dbFout } = await sb
				.from(tabel)
				.insert({ client_id: clientId })
				.select('id')
				.single();
			if (dbFout || !data) error(500, dbFout?.message ?? 'Aanmaken mislukt');
			return json({ id: data.id });
		}

		case 'bron3.update':
		case 'bron4.update': {
			const tabel = type === 'bron3.update' ? 'intake_bron3_concurrenten' : 'intake_bron4';
			const velden = type === 'bron3.update' ? BRON3_VELDEN : BRON4_VELDEN;
			const id = String(body.id ?? '');
			if (!id) error(400, 'Ontbrekend id');
			const patch = schoonPatch(body.patch, velden);
			if (Object.keys(patch).length === 0) return json({ ok: true });
			const { error: dbFout } = await sb.from(tabel).update(patch as never).eq('id', id);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'bron3.delete':
		case 'bron4.delete': {
			const tabel = type === 'bron3.delete' ? 'intake_bron3_concurrenten' : 'intake_bron4';
			const id = String(body.id ?? '');
			if (!id) error(400, 'Ontbrekend id');
			const { error: dbFout } = await sb.from(tabel).delete().eq('id', id);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		default:
			error(400, 'Onbekend type');
	}
};
