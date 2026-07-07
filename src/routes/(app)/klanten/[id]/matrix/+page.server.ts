import type { PageServerLoad } from './$types';
import type { Invalshoek } from '$lib/trigger-map';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const [concepten, tm] = await Promise.all([
		supabase.from('concepts').select('*').eq('client_id', id).order('created_at', { ascending: true }),
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
