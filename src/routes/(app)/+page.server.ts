import type { PageServerLoad } from './$types';
import { berekenIntakeProgress, heeftInhoud, bron2Ingevuld } from '$lib/progress';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: clients } = await supabase
		.from('clients')
		.select('*')
		.order('updated_at', { ascending: false });

	const lijst = clients ?? [];
	if (lijst.length === 0) {
		return { clients: [] };
	}

	const [b1, b2, b3, b4, b5] = await Promise.all([
		supabase.from('intake_bron1').select('client_id, antwoord'),
		supabase.from('intake_bron2').select('client_id, vraag_nummer, antwoord'),
		supabase.from('intake_bron3_concurrenten').select('client_id'),
		supabase.from('intake_bron4').select('client_id, ruwe_tekst'),
		supabase
			.from('intake_bron5')
			.select(
				'client_id, beste_advertenties, best_verkopende_producten, search_console, organische_posts'
			)
	]);

	const telInhoud = (rows: Array<Record<string, unknown>> | null, veld: string) => {
		const m = new Map<string, number>();
		for (const r of rows ?? []) {
			if (heeftInhoud(r[veld] as string)) {
				const id = r.client_id as string;
				m.set(id, (m.get(id) ?? 0) + 1);
			}
		}
		return m;
	};

	const telRijen = (rows: Array<{ client_id: string }> | null) => {
		const m = new Map<string, number>();
		for (const r of rows ?? []) m.set(r.client_id, (m.get(r.client_id) ?? 0) + 1);
		return m;
	};

	const b1m = telInhoud(b1.data, 'antwoord');
	const b3m = telRijen(b3.data);

	// Bron 2 per klant groeperen (i.v.m. "niet beschikbaar"-sentinel op vraag_nummer 0).
	const b2groepen = new Map<string, Array<{ vraag_nummer: number; antwoord: string | null }>>();
	for (const r of b2.data ?? []) {
		const arr = b2groepen.get(r.client_id) ?? [];
		arr.push({ vraag_nummer: r.vraag_nummer, antwoord: r.antwoord });
		b2groepen.set(r.client_id, arr);
	}
	const b4m = telInhoud(b4.data, 'ruwe_tekst');

	const b5m = new Map<string, number>();
	for (const r of b5.data ?? []) {
		const n = [
			r.beste_advertenties,
			r.best_verkopende_producten,
			r.search_console,
			r.organische_posts
		].filter((v) => heeftInhoud(v as string)).length;
		b5m.set(r.client_id, n);
	}

	const clientsMetProgress = lijst.map((c) => ({
		...c,
		progress: berekenIntakeProgress({
			bron1Ingevuld: b1m.get(c.id) ?? 0,
			bron2Ingevuld: bron2Ingevuld(b2groepen.get(c.id) ?? []),
			bron3Aantal: b3m.get(c.id) ?? 0,
			bron4Ingevuld: b4m.get(c.id) ?? 0,
			bron5Ingevuld: b5m.get(c.id) ?? 0
		})
	}));

	return { clients: clientsMetProgress };
};
