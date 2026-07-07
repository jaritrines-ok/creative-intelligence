import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { supabaseAdmin } from '$lib/server/supabase-admin';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: profielen } = await supabase
		.from('profiles')
		.select('id, naam, rol, created_at')
		.order('created_at', { ascending: true });

	const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
	const emailMap = new Map(authData.users.map((u) => [u.id, u.email ?? '']));

	const gebruikers = (profielen ?? []).map((p) => ({
		...p,
		email: emailMap.get(p.id) ?? ''
	}));

	return { gebruikers };
};

export const actions: Actions = {
	aanmaken: async ({ request }) => {
		const fd = await request.formData();
		const naam = String(fd.get('naam') ?? '').trim();
		const email = String(fd.get('email') ?? '').trim();
		const wachtwoord = String(fd.get('wachtwoord') ?? '');
		const rol = String(fd.get('rol') ?? 'gebruiker');

		if (!email || wachtwoord.length < 8) {
			return fail(400, {
				foutmelding: 'E-mailadres en een wachtwoord van minimaal 8 tekens zijn verplicht.'
			});
		}

		const { data, error: e } = await supabaseAdmin.auth.admin.createUser({
			email,
			password: wachtwoord,
			email_confirm: true,
			user_metadata: { naam: naam || email }
		});
		if (e || !data.user) {
			return fail(400, { foutmelding: 'Aanmaken mislukt: ' + (e?.message ?? 'onbekende fout') });
		}
		if (rol === 'admin') {
			await supabaseAdmin.from('profiles').update({ rol: 'admin' }).eq('id', data.user.id);
		}
		return { ok: true, aangemaakt: email };
	},

	rolWijzigen: async ({ request, locals: { user } }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		const rol = String(fd.get('rol') ?? '');
		if (!['admin', 'gebruiker'].includes(rol)) {
			return fail(400, { foutmelding: 'Ongeldige rol.' });
		}
		if (id === user!.id) {
			return fail(400, { foutmelding: 'Je kunt je eigen rol niet wijzigen.' });
		}
		const { error: e } = await supabaseAdmin
			.from('profiles')
			.update({ rol: rol as 'admin' | 'gebruiker' })
			.eq('id', id);
		if (e) return fail(500, { foutmelding: 'Wijzigen mislukt: ' + e.message });
		return { ok: true };
	},

	verwijderen: async ({ request, locals: { user } }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		if (id === user!.id) {
			return fail(400, { foutmelding: 'Je kunt je eigen account niet verwijderen.' });
		}
		const { error: e } = await supabaseAdmin.auth.admin.deleteUser(id);
		if (e) return fail(500, { foutmelding: 'Verwijderen mislukt: ' + e.message });
		return { ok: true };
	}
};
