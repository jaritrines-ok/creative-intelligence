import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: logs } = await supabase
		.from('ai_logs')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(200);

	const lijst = logs ?? [];
	const clientIds = [...new Set(lijst.map((l) => l.client_id).filter(Boolean))] as string[];
	const userIds = [...new Set(lijst.map((l) => l.gebruiker_id).filter(Boolean))] as string[];

	const [clients, profs] = await Promise.all([
		clientIds.length
			? supabase.from('clients').select('id, naam').in('id', clientIds)
			: Promise.resolve({ data: [] }),
		userIds.length
			? supabase.from('profiles').select('id, naam').in('id', userIds)
			: Promise.resolve({ data: [] })
	]);

	const klantMap = new Map((clients.data ?? []).map((c) => [c.id, c.naam]));
	const userMap = new Map((profs.data ?? []).map((p) => [p.id, p.naam]));

	return {
		logs: lijst.map((l) => ({
			...l,
			klantNaam: l.client_id ? (klantMap.get(l.client_id) ?? '(verwijderd)') : '—',
			gebruikerNaam: l.gebruiker_id ? (userMap.get(l.gebruiker_id) ?? '(verwijderd)') : '—'
		}))
	};
};
