import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkResetCount() {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('password_reset', true);
    
    if (error) {
        console.error(error);
        return;
    }
    console.log("Total Password Reset:", count);
}

checkResetCount();
