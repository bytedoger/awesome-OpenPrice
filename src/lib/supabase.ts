import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are not provided. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Client for public / frontend usage (uses Anon Key)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
