import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { STATUSSEN, type Status } from '$lib/config';

export const actions: Actions = {
	default: async ({ request, locals: { supabase, user } }) => {
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

		const { data, error } = await supabase
			.from('clients')
			.insert({ naam, sector: sector || null, status, eigenaar_id: user!.id })
			.select('id')
			.single();

		if (error || !data) {
			return fail(500, {
				naam,
				sector,
				status,
				foutmelding: 'Opslaan mislukt: ' + (error?.message ?? 'onbekende fout')
			});
		}

		throw redirect(303, `/klanten/${data.id}`);
	}
};
