import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const tables = ['favorites', 'bookmarks', 'sponsors'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log(`Table ${t} columns:`, Object.keys(data[0] || {}));
    } else {
      console.log(`Table ${t} error:`, error.message);
    }
  }
}

check();
