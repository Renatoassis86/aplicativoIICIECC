import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDist() {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(100);
    
    if (error) {
        console.error(error);
        return;
    }
    const emails = data.filter(d => d.user_id.includes('@')).length;
    const cpfs = data.length - emails;
    console.log(`Sample 100: Emails=${emails}, CPFs=${cpfs}`);
}

checkDist();
