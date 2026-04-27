import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("--- CHECKING TABLES ---");
  console.log("Project URL:", supabaseUrl);
  
  // Test social_posts
  const { data: posts, error: postErr } = await supabase.from('social_posts').select('*').limit(1);
  if (postErr) console.log("social_posts error:", postErr.message);
  else console.log("social_posts OK.");

  // Test members
  const { data: members, error: memErr } = await supabase.from('members').select('*').limit(1);
  if (memErr) console.log("members error:", memErr.message);
  else console.log("members OK.");

  // Test agenda_sessions
  const { data: sessions, error: sessErr } = await supabase.from('agenda_sessions').select('*').limit(1);
  if (sessErr) console.log("agenda_sessions error:", sessErr.message);
  else console.log("agenda_sessions OK.");
}

check();
