import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const [b1, b2, b3, b4, b5] = await Promise.all([
		supabase.from('intake_bron1').select('vraag_nummer, antwoord').eq('client_id', id),
		supabase.from('intake_bron2').select('vraag_nummer, antwoord').eq('client_id', id),
		supabase
			.from('intake_bron3_concurrenten')
			.select('*')
			.eq('client_id', id)
			.order('created_at', { ascending: true }),
		supabase
			.from('intake_bron4')
			.select('*')
			.eq('client_id', id)
			.order('created_at', { ascending: true }),
		supabase.from('intake_bron5').select('*').eq('client_id', id).maybeSingle()
	]);

	return {
		bron1: b1.data ?? [],
		bron2: b2.data ?? [],
		bron3: b3.data ?? [],
		bron4: b4.data ?? [],
		bron5: b5.data ?? null
	};
};
