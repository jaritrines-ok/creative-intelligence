import type { PageServerLoad } from './$types';
import type { Invalshoek } from '$lib/trigger-map';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const [concepten, tm] = await Promise.all([
		// Nieuwste eerst: een learning ontstaat wanneer een test resultaten/observatie/analyse krijgt.
		supabase.from('concepts').select('*').eq('client_id', id).order('updated_at', { ascending: false }),
		supabase
			.from('trigger_map_versions')
			.select('invalshoeken')
			.eq('client_id', id)
			.eq('is_actief', true)
			.maybeSingle()
	]);

	return {
		concepten: concepten.data ?? [],
		invalshoeken: (tm.data?.invalshoeken as Invalshoek[] | null) ?? []
	};
};
