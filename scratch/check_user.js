import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkUser() {
    const cpf = '07745261490';
    const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', cpf)
        .single();
    
    if (pErr) {
        console.error("Profile Error:", pErr);
    } else {
        console.log("Profile:", profile);
    }

    const { data: member, error: mErr } = await supabase
        .from('members')
        .select('*')
        .eq('cpf', cpf)
        .single();

    if (mErr) {
        console.error("Member Error:", mErr);
    } else {
        console.log("Member:", member);
    }
}

checkUser();
