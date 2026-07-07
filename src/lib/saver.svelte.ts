/** Gedeelde auto-save status + generieke POST-helper. */

class Saver {
	actief = $state(0);
	fout = $state<string | null>(null);
	laatstOpgeslagen = $state<number | null>(null);
}

export const saver = new Saver();

/** POST JSON naar een endpoint en werk de gedeelde saver-status bij. */
export async function postJSON<T = unknown>(url: string, body: unknown): Promise<T> {
	saver.actief++;
	saver.fout = null;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			const tekst = await res.text().catch(() => '');
			throw new Error(tekst || `Opslaan mislukt (${res.status})`);
		}
		saver.laatstOpgeslagen = Date.now();
		return (await res.json().catch(() => ({}))) as T;
	} catch (e) {
		saver.fout = e instanceof Error ? e.message : 'Opslaan mislukt';
		throw e;
	} finally {
		saver.actief--;
	}
}
