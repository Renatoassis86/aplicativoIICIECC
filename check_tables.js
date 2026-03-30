import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqnbxxawbnfcyqzujpqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("--- CHECKING TABLES ---");
  
  // Test social_posts
  const { data: posts, error: postErr } = await supabase.from('social_posts').select('*').limit(1);
  if (postErr) console.log("social_posts error:", postErr.message);
  else console.log("social_posts OK. Columns:", Object.keys(posts[0] || {}));

  // Test social_engagements
  const { data: eng, error: engErr } = await supabase.from('social_engagements').select('*').limit(1);
  if (engErr) console.log("social_engagements error:", engErr.message);
  else console.log("social_engagements OK.");

  // Test user_favorites (guessing)
  const { data: favs, error: favErr } = await supabase.from('user_favorites').select('*').limit(1);
  if (favErr) console.log("user_favorites error:", favErr.message);
  else console.log("user_favorites OK.");

  // Try to find any other tables by trying common names
  const commonTables = ['members', 'profiles', 'sponsors', 'bookmarks', 'favorites'];
  for (const t of commonTables) {
    const { error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (!error) console.log(`Table ${t} exists.`);
    else if (error.code !== '42P01') console.log(`Table ${t} error:`, error.message);
  }
}

check();
