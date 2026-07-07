import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { STATUSSEN, type Status } from '$lib/config';

export const actions: Actions = {
	default: async ({ request, params, locals: { supabase } }) => {
		const fd = await request.formData();
		const naam = String(fd.get('naam') ?? '').trim();
		const sector = String(fd.get('sector') ?? '').trim();
		const status = String(fd.get('status') ?? 'actief') as Status;

		if (!naam) {
			return fail(400, { naam, sector, status, foutmelding: 'Naam is verplicht.' });
		}
		if (!STATUSSEN.includes(status)) {
			return fail(400, { naam, sector, status: 'actief', foutmelding: 'Ongeldige status.' });
		}

		const { error } = await supabase
			.from('clients')
			.update({ naam, sector: sector || null, status })
			.eq('id', params.id);

		if (error) {
			return fail(500, { naam, sector, status, foutmelding: 'Opslaan mislukt: ' + error.message });
		}

		throw redirect(303, `/klanten/${params.id}`);
	}
};
