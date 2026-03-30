import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TARGET_CPF = '05875164450';

async function reset() {
  console.log(`--- RESETTING CPF ${TARGET_CPF} ---`);
  
  // 1. Delete from profiles
  const { error: profDelErr } = await supabase.from('profiles').delete().eq('cpf', TARGET_CPF);
  if (profDelErr) console.log("Profile delete error:", profDelErr.message);
  else console.log("Profile deleted successfully (or didn't exist).");

  // 2. Delete from members
  const { error: membDelErr } = await supabase.from('members').delete().eq('cpf', TARGET_CPF);
  if (membDelErr) console.log("Member delete error:", membDelErr.message);
  else console.log("Member deleted successfully (or didn't exist).");

  // 3. Insert into members (Inscrição)
  const { error: membInsErr } = await supabase.from('members').insert({
    cpf: TARGET_CPF,
    name: 'Renato Assis (Organizador)',
    email: 'renato@arkos.com.br' // Placeholder
  });
  if (membInsErr) console.log("Member insert error:", membInsErr.message);
  else console.log("Member inserted successfully.");

  // 4. Insert into profiles (Gestor/Organizador)
  const { error: profInsErr } = await supabase.from('profiles').insert({
    cpf: TARGET_CPF,
    user_type: 'organizador',
    current_password: 'admin',
    onboarding_completed: true,
    updated_at: new Date()
  });
  if (profInsErr) console.error("Profile insert error:", profInsErr.message);
  else console.log("Profile created as ORGANIZADOR successfully.");
}

reset();
