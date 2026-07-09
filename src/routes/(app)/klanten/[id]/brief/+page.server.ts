import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const id = params.id;

	const { data: concepten } = await supabase
		.from('concepts')
		.select('*')
		.eq('client_id', id)
		.eq('gearchiveerd', false)
		.order('created_at', { ascending: true });

	return {
		concepten: concepten ?? []
	};
};
