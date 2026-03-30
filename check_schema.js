
const URL = 'https://iqnbxxawbnfcyqzujpqf.supabase.co/rest/v1/members?select=*&limit=1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmJ4eGF3Ym5mY3lxenVqcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzI0NDYsImV4cCI6MjA5MDM0ODQ0Nn0.zKfOQn3P997znEQcp5D6RD2KPoD7U64HWxkQnLDbFGc';

async function check() {
  const res = await fetch(URL, {
    headers: {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
