import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { DEFAULT_CLAUDE_MODEL } from '$lib/config';

/** Server-only Anthropic-client. Nooit in client-code importeren ($lib/server). */
export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

/** Actief model; overschrijfbaar via ANTHROPIC_MODEL env var. */
export const CLAUDE_MODEL = env.ANTHROPIC_MODEL || DEFAULT_CLAUDE_MODEL;
