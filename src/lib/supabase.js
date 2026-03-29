import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hCqXbKVj6YodWp0hELpuVA_dPehOz9J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
