import React from 'react';
import { 
  X,
  ChevronLeft
} from 'lucide-react';
import { memories2025 } from '../../data/memories2025';
import MemoriesMarquee from '../../components/media/MemoriesMarquee';

const OfficialMediaTab = ({ onOpenMedia }) => {
  const getDriveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

  // FOTOS EM TEMPO REAL (II CIECC 2026)
  const livePhotos = [
    { id: '1hARrE4k2CfTM43whKs2J1cqNScrA93IN', label: 'AO VIVO: Credenciamento', url: getDriveUrl('1hARrE4k2CfTM43whKs2J1cqNScrA93IN') },
    { id: '1bGzCaUZpCaaIVWH7OA0i1HBNrgPYvYqj', label: 'AO VIVO: Auditório Lotado', url: getDriveUrl('1bGzCaUZpCaaIVWH7OA0i1HBNrgPYvYqj') },
    { id: '1W2B8z36PPgHHoZn4EMVF9Sjf8vCZB7G-', label: 'AO VIVO: Palestra Principal', url: getDriveUrl('1W2B8z36PPgHHoZn4EMVF9Sjf8vCZB7G-') },
    { id: '1Ix2iHhnBRaOgFgZMcl97rsNi3Mwh_COx', label: 'AO VIVO: Coffee Break', url: getDriveUrl('1Ix2iHhnBRaOgFgZMcl97rsNi3Mwh_COx') }
  ];

  // MEMÓRIAS (I CIECC 2025) - Agora usa a base completa via MemoriesMarquee

  const openGallery = (index, source) => {
    const gallery = source === 'live' ? livePhotos : memories2025;
    const title = source === 'live' ? 'II CIECC • AO VIVO' : 'I CIECC • Memórias 2025';
    const id = `gallery-${source}`;
    
    onOpenMedia({
      id,
      type: 'gallery',
      photos: gallery,
      startIndex: index,
      title: title
    });
  };

  const interviews = [
    { id: 'story5', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Dr. Schlect', type: 'story' },
    { id: 'story10', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop', videoUrl: 'https://www.youtube.com/embed/fcqS1WTO9ds', title: 'Thiago Dutra', type: 'story' },
    { id: 'story12', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', videoUrl: 'https://www.w3schools.com/html/movie.mp4', title: 'Ana Paula', type: 'story' },
  ];

  const podcasts = [
    { id: 'pod201', title: 'Artes Liberais', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop', type: 'podcast' },
    { id: 'pod202', title: 'Educação Clássica', url: 'https://images.unsplash.com/photo-1491843331657-f050bc7013d2?w=200&h=200&fit=crop', type: 'podcast' },
  ];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '90px' }}>
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
        background: 'var(--primary)', 
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>CIECC <span style={{ color: 'var(--gold)' }}>Hub VIP</span></h2>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.7 }}>Acompanhe tudo do II CIECC em tempo real.</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        
        {/* 1. FLASHES DO II CIECC 2026 (CARROSSEL) */}
        <div style={{ marginBottom: '50px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)' }}>Flashes do Momento</h3>
             <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', background: 'var(--accent)', padding: '4px 10px', borderRadius: '20px' }}>COBERTURA 2026</span>
           </div>
           
           <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '10px' }}>
              {livePhotos.map((img, index) => (
                <div 
                  key={img.id} 
                  onClick={() => openGallery(index, 'live')} 
                  className="clickable" 
                  style={{ 
                    minWidth: '120px', 
                    height: '120px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    flexShrink: 0,
                    background: 'rgba(107, 20, 26, 0.08)',
                    border: '1.5px solid rgba(107, 20, 26, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={img.url} 
                    alt="" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      padding: '4px' 
                    }} 
                  />
                </div>
              ))}
           </div>
        </div>

        {/* 2. ENTREVISTAS (CARROSSEL BOLINHAS) */}
        <div style={{ marginBottom: '40px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '16px' }}>Entrevistas Exclusivas</h3>
           <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '10px' }}>
              {interviews.map(item => (
                <div key={item.id} onClick={() => onOpenMedia(item)} className="clickable" style={{ textAlign: 'center', minWidth: '95px', flexShrink: 0 }}>
                  <div style={{ width: '85px', height: '85px', borderRadius: '50%', padding: '3px', background: 'var(--gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: '2px' }}>
                      <img src={item.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)' }}>{item.title}</span>
                </div>
              ))}
           </div>
        </div>

        {/* 3. PODCASTS (CARROSSEL BOLINHAS) */}
        <div style={{ marginBottom: '40px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '16px' }}>CIECC Podcasts</h3>
           <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '10px' }}>
              {podcasts.map(item => (
                <div key={item.id} onClick={() => onOpenMedia(item)} className="clickable" style={{ textAlign: 'center', minWidth: '95px', flexShrink: 0 }}>
                  <div style={{ width: '85px', height: '85px', borderRadius: '50%', padding: '3px', background: 'var(--secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: '2px' }}>
                      <img src={item.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)' }}>{item.title}</span>
                </div>
              ))}
           </div>
        </div>

        {/* 4. MEMÓRIAS I CIECC 2025 (CARROSSEL INFINITO) */}
        <div style={{ marginTop: '50px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
           <MemoriesMarquee 
             photos={memories2025} 
             onOpenMedia={(media, index) => onOpenMedia({
               ...media,
               type: 'gallery',
               photos: memories2025,
               startIndex: index,
               title: 'I CIECC • Memórias 2025'
             })}
           />
        </div>
      </div>

    </div>
  );
};

export default OfficialMediaTab;
