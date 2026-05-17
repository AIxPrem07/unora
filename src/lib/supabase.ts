import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables! Check your .env.local file.');
}

// Export the singleton instance of the Supabase client
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);