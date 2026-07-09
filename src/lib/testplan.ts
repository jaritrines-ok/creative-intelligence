/** Types voor het AI-gegenereerde stap-voor-stap testplan (onder de matrix). */

/** Eén sprint/stap in het testplan. */
export interface TestplanSprint {
	titel: string;
	focus: string;
	concepten: string[];
	wat_testen: string;
	succescriterium: string;
	budget: string;
	duur: string;
}

/** Volledig testplan: korte toelichting op de aanpak + de sprints op volgorde. */
export interface Testplan {
	toelichting: string;
	sprints: TestplanSprint[];
}

/** Labels + rendervolgorde voor de sprint-velden. */
export const SPRINT_VELDEN: Array<{ key: keyof TestplanSprint; label: string }> = [
	{ key: 'focus', label: 'Focus' },
	{ key: 'wat_testen', label: 'Wat testen we' },
	{ key: 'succescriterium', label: 'Succescriterium' },
	{ key: 'budget', label: 'Budget' },
	{ key: 'duur', label: 'Duur' }
];
