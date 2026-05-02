import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkRecentUpdates() {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error(error);
        return;
    }
    console.log("Recent updates:");
    console.table(data);
    console.log("Current Time (UTC):", new Date().toISOString());
}

checkRecentUpdates();
