import { createClient } from '@supabase/supabase-js';

// Configuration client Supabase
// Les clés peuvent être fournies via variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acwoxwk5cttpdwjrfikj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aCWOxWK5CtTpdwJRFikjwQ_nCocuc1t';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
