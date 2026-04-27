import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffmcmkfbanhyidrxvsst.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vrCCq8JbapanQPGWYEsZtA_OjlCg5jc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
