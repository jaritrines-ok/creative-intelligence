import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const [concepten, tm] = await Promise.all([
		supabase
			.from('concepts')
			.select('*')
			.eq('client_id', id)
			.eq('gearchiveerd', false)
			.order('created_at', { ascending: true }),
		supabase
			.from('trigger_map_versions')
			.select('id')
			.eq('client_id', id)
			.eq('is_actief', true)
			.maybeSingle()
	]);

	return {
		concepten: concepten.data ?? [],
		heeftTriggerMap: !!tm.data
	};
};
