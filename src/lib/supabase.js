import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ffmcmkfbanhyidrxvsst.supabase.co';
const supabaseAnonKey = 'sb_publishable_vrCCq8JbapanQPGWYEsZtA_OjlCg5jc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Build trigger: 2026-04-27

