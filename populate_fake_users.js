import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populate() {
  const fakeUsers = [
    { cpf: '11111111111', name: 'Fake User 1', email: 'user1@example.com' },
    { cpf: '22222222222', name: 'Fake User 2', email: 'user2@example.com' },
    { cpf: '33333333333', name: 'Fake User 3', email: 'user3@example.com' },
    { cpf: '44444444444', name: 'Fake User 4', email: 'user4@example.com' },
    { cpf: '55555555555', name: 'Fake User 5', email: 'user5@example.com' },
    { cpf: '66666666666', name: 'Fake User 6', email: 'user6@example.com' },
    { cpf: '77777777777', name: 'Fake User 7', email: 'user7@example.com' },
    { cpf: '88888888888', name: 'Fake User 8', email: 'user8@example.com' },
    { cpf: '99999999999', name: 'Fake User 9', email: 'user9@example.com' },
    { cpf: '00000000000', name: 'Fake User 10', email: 'user10@example.com' }
  ];

  console.log("Populating members...");
  const { error: membersErr } = await supabase.from('members').upsert(fakeUsers);
  if (membersErr) {
    console.log("Error populating members:", membersErr.message);
    return;
  }

  console.log("Populating profiles...");
  const profiles = fakeUsers.map(u => ({
    cpf: u.cpf,
    user_type: 'congressista',
    password_reset: true,
    onboarding_completed: true,
    current_password: 'congresso2026'
  }));
  const { error: profilesErr } = await supabase.from('profiles').upsert(profiles);
  if (profilesErr) console.log("Error populating profiles:", profilesErr.message);
  else console.log("Successfully populated 10 fake users!");
}

populate();
