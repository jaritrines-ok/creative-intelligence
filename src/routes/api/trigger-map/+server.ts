import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TRIGGER_MAP_SECTIES } from '$lib/trigger-map';

const SECTIE_KEYS = TRIGGER_MAP_SECTIES.map((s) => s.key) as string[];
const FUNNELFASES = ['TOFU', 'MOFU', 'BOFU'];

export const POST: RequestHandler = async ({ request, locals: { supabase, user } }) => {
	if (!user) error(401, 'Niet ingelogd');

	const body = await request.json().catch(() => null);
	if (!body || typeof body.type !== 'string') error(400, 'Ongeldig verzoek');

	switch (body.type) {
		case 'sectie': {
			const versieId = String(body.versieId ?? '');
			const key = String(body.key ?? '');
			if (!versieId || !SECTIE_KEYS.includes(key)) error(400, 'Ongeldige sectie');
			const items = Array.isArray(body.items)
				? body.items.map((x: unknown) => String(x).trim()).filter(Boolean)
				: [];
			const { error: dbFout } = await supabase
				.from('trigger_map_versions')
				.update({ [key]: items } as never)
				.eq('id', versieId);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'invalshoeken': {
			const versieId = String(body.versieId ?? '');
			if (!versieId) error(400, 'Ontbrekend id');
			const raw = Array.isArray(body.invalshoeken) ? body.invalshoeken : [];
			const schoon = raw.map((x: Record<string, unknown>) => ({
				naam: String(x?.naam ?? ''),
				omschrijving: String(x?.omschrijving ?? ''),
				funnelfase: FUNNELFASES.includes(x?.funnelfase as string) ? x.funnelfase : 'TOFU',
				onderbouwing: String(x?.onderbouwing ?? '')
			}));
			const { error: dbFout } = await supabase
				.from('trigger_map_versions')
				.update({ invalshoeken: schoon } as never)
				.eq('id', versieId);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		case 'activeer': {
			const clientId = String(body.clientId ?? '');
			const versieId = String(body.versieId ?? '');
			if (!clientId || !versieId) error(400, 'Ongeldig verzoek');
			await supabase
				.from('trigger_map_versions')
				.update({ is_actief: false })
				.eq('client_id', clientId)
				.eq('is_actief', true);
			const { error: dbFout } = await supabase
				.from('trigger_map_versions')
				.update({ is_actief: true })
				.eq('id', versieId);
			if (dbFout) error(500, dbFout.message);
			return json({ ok: true });
		}

		default:
			error(400, 'Onbekend type');
	}
};
