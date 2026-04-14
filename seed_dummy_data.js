import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log("Seeding dummy data...");

  // 1. Dummy Sponsors
  const dummySponsors = [
      { name: "Patrocinador Ouro A", tier: "ouro", logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", active: true, order_index: 0 },
      { name: "Patrocinador Ouro B", tier: "ouro", logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", active: true, order_index: 1 },
      { name: "Patrocinador Prata C", tier: "prata", logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", active: true, order_index: 2 },
      { name: "Patrocinador Prata D", tier: "prata", logo_url: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", active: true, order_index: 3 },
      { name: "Patrocinador Bronze E", tier: "bronze", logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png", active: true, order_index: 4 }
  ];

  for (const s of dummySponsors) {
      await supabase.from('sponsors').upsert(s, { onConflict: 'name' });
  }

  // 2. Dummy Media Assets (Podcasts, Interviews, Flashes)
  const dummyMedia = [
      { 
          title: "Podcast: O Futuro da Educação", 
          category: "Podcast", 
          media_type: "audio", 
          url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          description: "Um debate profundo sobre as tecnologias em 2026.",
          created_at: new Date().toISOString()
      },
      { 
          title: "Entrevista: Dr. Renato Assis sobre CIECC", 
          category: "Entrevistas Exclusivas", 
          media_type: "video", 
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          description: "Entrevista exclusiva sobre os bastidores do evento.",
          created_at: new Date(Date.now() - 3600000).toISOString()
      },
      { 
          title: "Flashes: Abertura do Congresso", 
          category: "Flash 2026", 
          media_type: "image", 
          url: "https://images.unsplash.com/photo-1540575861501-7ad0582373f3?q=80&w=800&auto=format&fit=crop",
          description: "Momentos da grande abertura.",
          created_at: new Date(Date.now() - 7200000).toISOString()
      },
      { 
          title: "Memórias: Edição 2024", 
          category: "Memórias", 
          media_type: "video", 
          url: "https://www.w3schools.com/html/movie.mp4",
          description: "Relembre o ano passado.",
          created_at: new Date(Date.now() - 86400000).toISOString()
      }
  ];

  for (const m of dummyMedia) {
      await supabase.from('media_assets').insert(m);
  }

  console.log("Done seeding!");
}

seedData();
