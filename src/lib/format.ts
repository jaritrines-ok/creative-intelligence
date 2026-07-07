/** Nederlandse relatieve tijdsaanduiding, bijv. "3 dagen geleden". */
export function relatieveTijd(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso).getTime();
	const sec = Math.round((Date.now() - d) / 1000);

	if (sec < 60) return 'zojuist';
	const min = Math.round(sec / 60);
	if (min < 60) return `${min} ${min === 1 ? 'minuut' : 'minuten'} geleden`;
	const uur = Math.round(min / 60);
	if (uur < 24) return `${uur} ${uur === 1 ? 'uur' : 'uur'} geleden`;
	const dag = Math.round(uur / 24);
	if (dag < 7) return `${dag} ${dag === 1 ? 'dag' : 'dagen'} geleden`;
	const week = Math.round(dag / 7);
	if (week < 5) return `${week} ${week === 1 ? 'week' : 'weken'} geleden`;
	const maand = Math.round(dag / 30);
	if (maand < 12) return `${maand} ${maand === 1 ? 'maand' : 'maanden'} geleden`;
	const jaar = Math.round(dag / 365);
	return `${jaar} ${jaar === 1 ? 'jaar' : 'jaar'} geleden`;
}

/** Datum als "7 jul 2026". */
export function datumKort(iso: string | null | undefined): string {
	if (!iso) return '—';
	return new Date(iso).toLocaleDateString('nl-NL', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/** Datum + tijd als "7 jul 2026 14:32". */
export function datumTijd(iso: string | null | undefined): string {
	if (!iso) return '—';
	return new Date(iso).toLocaleString('nl-NL', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
