import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("--- CHECKING SOCIAL COMMENTS ---");
  const { data: comments, error } = await supabase.from('social_comments').select('*').limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Columns:", Object.keys(comments[0] || {}));
  }
}

check();
