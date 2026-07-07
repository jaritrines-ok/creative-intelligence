import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { Database } from '$lib/supabase/database.types';

/**
 * Server-only Supabase-client met de service role key.
 * Omzeilt RLS — gebruik uitsluitend in server-code (AI-logging, admin-taken).
 * Bestanden in $lib/server kunnen niet in client-code geïmporteerd worden.
 */
export const supabaseAdmin = createClient<Database>(
	PUBLIC_SUPABASE_URL,
	env.SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: { autoRefreshToken: false, persistSession: false }
	}
);
