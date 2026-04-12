import React from 'react';
import { 
  X,
  ChevronLeft,
  Radio
} from 'lucide-react';
import { memories2025 } from '../../data/memories2025';
import MemoriesMarquee from '../../components/media/MemoriesMarquee';
import { useCMS } from '../../hooks/useCMS';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../hooks/useContent';

const OfficialMediaTab = ({ onOpenMedia }) => {
  const { content: mediaTitle } = useContent('titles', 'page_media');
  const { content: mediaSubtitle } = useContent('titles', 'page_media_subtitle');
  const CarouselSection = ({ title, items, renderItem }) => (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)' }}>{title}</h3>
      </div>
      <div style={{ 
        display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 20px 10px',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory' 
      }} className="no-scrollbar">
        {items.map((item, idx) => (
          <div key={idx} style={{ scrollSnapAlign: 'start' }}>
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
    </div>
  );
  const { cms } = useCMS();
  const [mediaList, setMediaList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMedia = async () => {
      const data = await cms.getMedia();
      setMediaList(data);
      setLoading(false);
    };

    loadMedia();

    // Listener para atualizações em tempo real do painel admin
    window.addEventListener('cms-updated', loadMedia);
    return () => window.removeEventListener('cms-updated', loadMedia);
  }, [cms]);

  const getDriveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

  const getImageUrl = (item) => {
    if (item.source_type === 'link') {
      if (item.url_or_path.includes('youtube.com') || item.url_or_path.includes('youtu.be')) {
        const id = item.url_or_path.split('v=')[1] || item.url_or_path.split('/').pop();
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
      return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop'; // Default
    }
    // Para uploads, pegar URL pública do Supabase
    const { data } = supabase.storage.from('app_media').getPublicUrl(item.url_or_path);
    return data.publicUrl;
  };

  const getMediaUrl = (item) => {
    if (item.source_type === 'link') return item.url_or_path;
    const { data } = supabase.storage.from('app_media').getPublicUrl(item.url_or_path);
    return data.publicUrl;
  };

  // FOTOS EM TEMPO REAL (II CIECC 2026)
  const livePhotos = [
    { id: '1hARrE4k2CfTM43whKs2J1cqNScrA93IN', label: 'AO VIVO: Credenciamento', url: getDriveUrl('1hARrE4k2CfTM43whKs2J1cqNScrA93IN') },
    { id: '1bGzCaUZpCaaIVWH7OA0i1HBNrgPYvYqj', label: 'AO VIVO: Auditório Lotado', url: getDriveUrl('1bGzCaUZpCaaIVWH7OA0i1HBNrgPYvYqj') },
    { id: '1W2B8z36PPgHHoZn4EMVF9Sjf8vCZB7G-', label: 'AO VIVO: Palestra Principal', url: getDriveUrl('1W2B8z36PPgHHoZn4EMVF9Sjf8vCZB7G-') },
    { id: '1Ix2iHhnBRaOgFgZMcl97rsNi3Mwh_COx', label: 'AO VIVO: Coffee Break', url: getDriveUrl('1Ix2iHhnBRaOgFgZMcl97rsNi3Mwh_COx') }
  ];

  const interviews = mediaList.filter(m => m.media_type === 'video' && !m.is_live_stream).map(m => ({
    id: m.id,
    url: getImageUrl(m),
    videoUrl: getMediaUrl(m),
    title: m.title,
    type: 'video'
  }));

  const podcasts = mediaList.filter(m => m.media_type === 'audio').map(m => ({
    id: m.id,
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop',
    audioUrl: getMediaUrl(m),
    title: m.title,
    type: 'podcast'
  }));

  const liveStream = mediaList.find(m => m.is_live_stream);

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
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>{mediaTitle || 'MÍDIA'}</h2>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.7 }}>{mediaSubtitle || 'Acompanhe tudo do II CIECC em tempo real.'}</p>
      </header>

      <div style={{ padding: '0 20px' }}>
        
        {/* 1. TRANSMISSÃO AO VIVO (TOPO) */}
        <div style={{ marginBottom: '40px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="live-indicator-pulse" style={{ width: '12px', height: '12px', background: '#FF0000', borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase' }}>Transmissão Ao Vivo</h3>
           </div>
           
           <div style={{ 
             width: '100%', borderRadius: '24px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', 
             boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.05)'
           }}>
             {liveStream ? (
               <iframe 
                 width="100%" height="100%" src={liveStream.url_or_path.includes('youtube') && !liveStream.url_or_path.includes('embed') ? `https://www.youtube.com/embed/${liveStream.url_or_path.split('v=')[1]}` : liveStream.url_or_path} 
                 title="Live" frameBorder="0" allowFullScreen
               ></iframe>
             ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  <Radio size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                  <p>Nenhuma transmissão ativa no momento.</p>
               </div>
             )}
           </div>
        </div>

        {/* 2. FLASHES DO II CIECC 2026 (CARROSSEL FOTOS) */}
        <CarouselSection 
          title="Flashes 2026"
          items={livePhotos}
          renderItem={(img) => (
            <div 
              onClick={() => onOpenMedia({ type: 'image', url: img.url, title: img.label })}
              style={{ 
                width: '180px', height: '120px', borderRadius: '16px', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)'
              }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        />

        {/* 3. ENTREVISTAS (CARROSSEL) */}
        <CarouselSection 
          title="Entrevistas Exclusivas"
          items={interviews}
          renderItem={(item) => (
            <div onClick={() => onOpenMedia(item)} style={{ textAlign: 'center', width: '100px' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', padding: '3px', 
                background: 'var(--gold)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: '2px' }}>
                  <img src={item.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
            </div>
          )}
        />

        {/* 4. PODCASTS (CARROSSEL) */}
        <CarouselSection 
          title="CIECC Podcasts"
          items={podcasts}
          renderItem={(item) => (
            <div onClick={() => onOpenMedia(item)} style={{ textAlign: 'center', width: '100px' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', padding: '3px', 
                background: 'var(--secondary)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: '2px' }}>
                  <img src={item.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
            </div>
          )}
        />

        {/* 5. MEMÓRIAS I CIECC 2025 (CARROSSEL) */}
        <CarouselSection 
          title="Memórias 2025"
          items={memories2025}
          renderItem={(img, index) => (
            <div 
              onClick={() => onOpenMedia({ 
                ...img, type: 'gallery', photos: memories2025, startIndex: index, title: 'I CIECC • Memórias 2025' 
              })}
              style={{ 
                width: '180px', height: '120px', borderRadius: '16px', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)'
              }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        />
      </div>

    </div>
  );
};

export default OfficialMediaTab;
