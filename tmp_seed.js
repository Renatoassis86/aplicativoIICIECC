
const URL = 'https://iqnbxxawbnfcyqzujpqf.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

async function seed() {
  const headers = {
    'apikey': KEY,
    'Authorization': 'Bearer ' + KEY,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  try {
    console.log("1. Registrar membros...");
    await fetch(`${URL}/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { cpf: '05875164450', name: 'Renato Assis', email: 'renato@ciecc.com' },
        { cpf: '71115902440', name: 'Emanuel', email: 'emanuel@ciecc.com' }
      ])
    });

    console.log("2. Criar perfis admin...");
    await fetch(`${URL}/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify([
        { cpf: '05875164450', user_type: 'admin', onboarding_completed: true, current_password: 'admin', password_reset: true },
        { cpf: '71115902440', user_type: 'admin', onboarding_completed: true, current_password: 'admin', password_reset: true }
      ])
    });

    console.log("✓ Administradores configurados com sucesso!");
    console.log("Acesse com CPF e senha: admin");
  } catch (e) {
    console.error("Erro no seeding:", e);
  }
}

seed();
