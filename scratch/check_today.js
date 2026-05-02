import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTodayUpdates() {
    const today = new Date().toISOString().split('T')[0];
    const { data, count, error } = await supabase
        .from('profiles')
        .select('user_id, updated_at', { count: 'exact' })
        .gte('updated_at', today + 'T00:00:00Z');
    
    if (error) {
        console.error(error);
        return;
    }
    console.log("Count for today:", count);
    console.table(data);
}

checkTodayUpdates();
