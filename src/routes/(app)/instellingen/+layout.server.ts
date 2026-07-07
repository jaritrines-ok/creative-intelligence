import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/** Alleen toegankelijk voor beheerders. */
export const load: LayoutServerLoad = async ({ locals: { supabase } }) => {
	const { data: isAdmin } = await supabase.rpc('is_admin');
	if (!isAdmin) {
		error(403, 'Deze pagina is alleen voor beheerders.');
	}
	return {};
};
