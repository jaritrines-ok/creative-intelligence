import type { LayoutServerLoad } from './$types';

/** Laadt de klantenlijst voor de sidebar (RLS beperkt tot eigen/admin). */
export const load: LayoutServerLoad = async ({ locals: { supabase } }) => {
	const { data: clients } = await supabase
		.from('clients')
		.select('id, naam, status, huidige_fase, updated_at')
		.order('updated_at', { ascending: false });

	return { clients: clients ?? [] };
};
