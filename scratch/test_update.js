import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testUpdate() {
    const cpf = '07745261490';
    console.log("Testing update for:", cpf);
    const { data, error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', cpf)
        .select();
    
    if (error) {
        console.error("Update Error:", error);
    } else {
        console.log("Update Success:", data);
    }
}

testUpdate();
