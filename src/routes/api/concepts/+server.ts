import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Database } from '$lib/supabase/database.types';
import { FUNNELFASES, PRIORITEITEN, CONCEPT_STATUSSEN } from '$lib/matrix';

type ConceptInsert = Database['public']['Tables']['concepts']['Insert'];

const TEKST_VELDEN = ['invalshoek', 'format', 'structuur', 'creator_type', 'hypothese', 'variabele'];
const FUNNEL = FUNNELFASES as string[];
const PRIO = PRIORITEITEN as string[];
const STATUS = CONCEPT_STATUSSEN as string[];

/** Beperkt en valideert een patch tot toegestane conceptvelden. */
function schoonPatch(patch: unknown): Record<string, unknown> {
	const uit: Record<string, unknown> = {};
	if (!patch || typeof patch !== 'object') return uit;
	for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
		if (TEKST_VELDEN.includes(k)) {
			uit[k] = v == null ? null : String(v);
		} else if (k === 'funnelfase') {
			uit[k] = FUNNEL.includes(v as string) ? v : null;
		} else if (k === 'prioriteit') {
			uit[k] = PRIO.includes(v as string) ? v : null;
		} else if (k === 'status') {
			if (STATUS.includes(v as string)) uit[k] = v;
		}
	}
	return uit;
}

export const POST: RequestHandler = async ({ request, locals: { supabase, user } }) => {
	if (!user) error(401, 'Niet ingelogd');

	const body = await request.json().catch(() => null);
	if (!body || typeof body.type !== 'string') error(400, 'Ongeldig verzoek');

	switch (body.type) {
		case 'insert': {
			const clientId = String(body.clientId ?? '');
			if (!clientId) error(400, 'Ontbrekende klant');
			const rij: ConceptInsert = { client_id: clientId, ...schoonPatch(body.concept) };
			const { data, error: dbFout } = await supabase
				.from('concepts')
				.insert(rij)
				.select('*')
				.single();
			if (dbFout || !data) error(500, dbFout?.message ?? 'Aanmaken mislukt');

			// Fase laten oplichten in de Creative Loop (alleen vooruit).
			const { data: client } = await supabase
				.from('clients')
				.select('huidige_fase')
				.eq('id', clientId)
				.single();
			if (client && (client.huidige_fase === 'intake' || client.huidige_fase === 'trigger_map')) {
				await supabase.from('clients').update({ huidige_fase: 'matrix' }).eq('id', clientId);
			}
			return json({ concept: data });
		}

		case 'update': {
			const id = String(body.id ?? '');
			if (!id) error(400, 'Ontbrekend id');
			const patch = schoonPatch(body.patch);
			if (Object.keys(patch).length === 0) return json({ ok: true });
			const { error: dbFout } = await supabase
				.from('concepts')
				.update(patch as never)
				.eq('id', id);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'dupliceer': {
			const id = String(body.id ?? '');
			if (!id) error(400, 'Ontbrekend id');
			const { data: bron, error: leesFout } = await supabase
				.from('concepts')
				.select('*')
				.eq('id', id)
				.single();
			if (leesFout || !bron) error(404, 'Concept niet gevonden');
			const kopie: ConceptInsert = {
				client_id: bron.client_id,
				funnelfase: bron.funnelfase,
				invalshoek: bron.invalshoek,
				format: bron.format,
				structuur: bron.structuur,
				creator_type: bron.creator_type,
				hypothese: bron.hypothese,
				variabele: bron.variabele,
				prioriteit: bron.prioriteit,
				status: 'Idee'
			};
			const { data, error: dbFout } = await supabase
				.from('concepts')
				.insert(kopie)
				.select('*')
				.single();
			if (dbFout || !data) error(500, dbFout?.message ?? 'Dupliceren mislukt');
			return json({ concept: data });
		}

		case 'archiveer':
		case 'herstel': {
			const id = String(body.id ?? '');
			if (!id) error(400, 'Ontbrekend id');
			const { error: dbFout } = await supabase
				.from('concepts')
				.update({ gearchiveerd: body.type === 'archiveer' })
				.eq('id', id);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		default:
			error(400, 'Onbekend type');
	}
};
