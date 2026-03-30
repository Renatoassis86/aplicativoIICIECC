
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runFixes() {
  console.log('--- Iniciando Correções de Banco (Direct) ---');

  // Reset Renato
  console.log('Limpando dados antigos do CPF 05875164450...');
  await supabase.from('profiles').delete().eq('cpf', '05875164450');
  await supabase.from('members').delete().eq('cpf', '05875164450');

  // Criar Membro
  console.log('Criando membro Renato...');
  const { error: memErr } = await supabase.from('members').insert({
    cpf: '05875164450',
    name: 'Renato Assis',
    email: 'renato@fiecc.com.br'
  });
  if (memErr) console.error('Erro ao criar membro:', memErr);

  // Criar Perfil Staff
  console.log('Criando perfil de Organizador...');
  const { error: profErr } = await supabase.from('profiles').insert({
    cpf: '05875164450',
    name: 'Renato Assis',
    user_type: 'staff',
    psw: 'admin'
  });
  if (profErr) console.error('Erro ao criar perfil:', profErr);

  console.log('--- Perfil de Organizador Criado com Sucesso ---');
  console.log('CPF: 05875164450 | Senha: admin');
}

runFixes();
