import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] CRITICAL: URL or Anon Key missing in environment.');
}

if (!supabaseServiceKey) {
  console.warn('[Supabase] ADMIN: Service Role Key missing. Admin features will use Anon Key with RLS.');
} else {
  console.log('[Supabase] ADMIN: Service Role Key detected. Admin features will bypass RLS.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
