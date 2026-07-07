import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { berekenIntakeProgress, heeftInhoud, bron2Ingevuld } from '$lib/progress';
import { STATUSSEN, type Status } from '$lib/config';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const [b1, b2, b3, b4, b5] = await Promise.all([
		supabase.from('intake_bron1').select('antwoord').eq('client_id', id),
		supabase.from('intake_bron2').select('vraag_nummer, antwoord').eq('client_id', id),
		supabase.from('intake_bron3_concurrenten').select('id').eq('client_id', id),
		supabase.from('intake_bron4').select('ruwe_tekst').eq('client_id', id),
		supabase
			.from('intake_bron5')
			.select('beste_advertenties, best_verkopende_producten, search_console, organische_posts')
			.eq('client_id', id)
			.maybeSingle()
	]);

	const b5row = b5.data;
	const bron5Ingevuld = b5row
		? [
				b5row.beste_advertenties,
				b5row.best_verkopende_producten,
				b5row.search_console,
				b5row.organische_posts
			].filter((v) => heeftInhoud(v)).length
		: 0;

	const progress = berekenIntakeProgress({
		bron1Ingevuld: (b1.data ?? []).filter((r) => heeftInhoud(r.antwoord)).length,
		bron2Ingevuld: bron2Ingevuld(b2.data),
		bron3Aantal: (b3.data ?? []).length,
		bron4Ingevuld: (b4.data ?? []).filter((r) => heeftInhoud(r.ruwe_tekst)).length,
		bron5Ingevuld
	});

	return { progress };
};

export const actions: Actions = {
	status: async ({ request, params, locals: { supabase } }) => {
		const fd = await request.formData();
		const status = String(fd.get('status') ?? '') as Status;
		if (!STATUSSEN.includes(status)) {
			return fail(400, { foutmelding: 'Ongeldige status.' });
		}
		const { error } = await supabase.from('clients').update({ status }).eq('id', params.id);
		if (error) return fail(500, { foutmelding: error.message });
		return { ok: true };
	},

	verwijderen: async ({ params, locals: { supabase } }) => {
		const { error } = await supabase.from('clients').delete().eq('id', params.id);
		if (error) return fail(500, { foutmelding: error.message });
		throw redirect(303, '/');
	}
};
