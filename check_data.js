
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  const { count: membersCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
  const { count: speakersCount } = await supabase.from('speakers').select('*', { count: 'exact', head: true });
  const { count: sessionsCount } = await supabase.from('agenda_sessions').select('*', { count: 'exact', head: true });
  const { count: postsCount } = await supabase.from('social_posts').select('*', { count: 'exact', head: true });

  console.log('--- DATA COUNTS ---');
  console.log('Members:', membersCount);
  console.log('Speakers:', speakersCount);
  console.log('Sessions:', sessionsCount);
  console.log('Social Posts:', postsCount);
}

checkData();
