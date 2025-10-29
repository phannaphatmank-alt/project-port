// File: src/lib/supabaseServerClient.ts
import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing SUPABASE URL (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).');
  if (!key) throw new Error('Missing SUPABASE KEY (SERVICE_ROLE or ANON).');

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}