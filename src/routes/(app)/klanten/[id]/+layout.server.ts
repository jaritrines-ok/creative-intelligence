import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: client } = await supabase
		.from('clients')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!client) {
		error(404, 'Klant niet gevonden');
	}

	return { client };
};
