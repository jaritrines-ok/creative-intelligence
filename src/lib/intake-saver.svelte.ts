/** Intake-specifieke wrapper rond de generieke saver-helper. */
import { saver, postJSON } from './saver.svelte';

export { saver };

/** POST naar de intake-API. Werkt de gedeelde saver-status bij. */
export function postIntake<T = unknown>(body: unknown): Promise<T> {
	return postJSON<T>('/api/intake', body);
}
