import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { DEFAULT_CLAUDE_MODEL } from '$lib/config';

/** Server-only Anthropic-client. Nooit in client-code importeren ($lib/server). */
export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

/** Actief model; overschrijfbaar via ANTHROPIC_MODEL env var. */
export const CLAUDE_MODEL = env.ANTHROPIC_MODEL || DEFAULT_CLAUDE_MODEL;

export interface ClaudeJSONResultaat<T> {
	data: T;
	model: string;
	prompt: string;
	response: string;
	tokensInput: number;
	tokensOutput: number;
	duurMs: number;
}

/** Denk-effort voor de generaties; hoger = grondiger maar langzamer. */
export type ClaudeEffort = 'low' | 'medium' | 'high' | 'max';

/**
 * Roept Claude aan met structured outputs (gegarandeerd valide JSON volgens schema)
 * en geeft het resultaat + metadata terug voor ai_logs.
 *
 * Adaptive thinking staat aan: het model bepaalt zelf hoeveel het nadenkt (gestuurd
 * door `effort`). De denk-tokens tellen mee in max_tokens, vandaar de ruime default.
 */
export async function claudeJSON<T>(
	system: string,
	prompt: string,
	schema: object,
	maxTokens = 16000,
	effort: ClaudeEffort = 'high'
): Promise<ClaudeJSONResultaat<T>> {
	const start = Date.now();
	const response = await anthropic.messages.create({
		model: CLAUDE_MODEL,
		max_tokens: maxTokens,
		thinking: { type: 'adaptive' },
		system,
		messages: [{ role: 'user', content: prompt }],
		output_config: { effort, format: { type: 'json_schema', schema } }
	} as Anthropic.Messages.MessageCreateParamsNonStreaming);

	const duurMs = Date.now() - start;
	const tekst = response.content
		.filter((b): b is Anthropic.TextBlock => b.type === 'text')
		.map((b) => b.text)
		.join('');

	let data: T;
	try {
		data = JSON.parse(tekst) as T;
	} catch {
		throw new Error('Claude gaf geen valide JSON terug.');
	}

	return {
		data,
		model: response.model,
		prompt,
		response: tekst,
		tokensInput: response.usage.input_tokens,
		tokensOutput: response.usage.output_tokens,
		duurMs
	};
}
