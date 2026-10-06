import { env } from './env.js';

let supabaseClient = null;

if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
    });
    console.log('☁️ [Config/Supabase] Supabase Client successfully initialized');
  } catch (err) {
    console.warn('ℹ️ [Config/Supabase] Notice: @supabase/supabase-js pending npm install. Operating in resilient fallback mode.');
  }
} else {
  console.warn('ℹ️ [Config/Supabase] SUPABASE_URL or SUPABASE_ANON_KEY missing. Operating in offline mode.');
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = Boolean(supabaseClient);
export default supabase;
