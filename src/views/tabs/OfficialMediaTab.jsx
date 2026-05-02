import React from 'react';
import { 
  X,
  ChevronLeft,
  Radio,
  FileText
} from 'lucide-react';
import { memories2025 } from '../../data/memories2025';
import MemoriesMarquee from '../../components/media/MemoriesMarquee';
import { useCMS } from '../../hooks/useCMS';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../hooks/useContent';
import { driveService } from '../../services/media/driveService';

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

const OfficialMediaTab = ({ onOpenMedia }) => {
  const { content: mediaTitle } = useContent('titles', 'page_media');
  const { content: mediaSubtitle } = useContent('titles', 'page_media_subtitle');

  // Helper para evitar erro #31 (objetos no JSX)
  const displaySafe = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'object') return fallback;
    return val;
  };
  const { cms } = useCMS();
  const [mediaList, setMediaList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [drivePhotos2026, setDrivePhotos2026] = React.useState([]);
  const [drivePhotos2025, setDrivePhotos2025] = React.useState([]);

  React.useEffect(() => {
    const loadMedia = async () => {
      const data = await cms.getMedia();
      setMediaList(data);
      setLoading(false);
    };

    const loadDrivePhotos = async () => {
      try {
        const configs = await driveService.getSyncConfigs();
        const conf2026 = configs.find(c => c.category === 'CIECC 2026' || c.category === 'Flashes 2026');
        const conf2025 = configs.find(c => c.category === 'Galeria Oficial' || c.category === 'Memórias');

        if (conf2026) {
          const photos = await driveService.fetchPhotosFromFolder(conf2026.folder_id);
          setDrivePhotos2026(photos.map(p => ({ id: p.id, label: p.name, url: p.url, type: 'image' })));
        }
        if (conf2025) {
          const photos = await driveService.fetchPhotosFromFolder(conf2025.folder_id);
          setDrivePhotos2025(photos.map(p => ({ id: p.id, label: p.name, url: p.url, type: 'photo' })));
        }
      } catch (e) {
        console.error('Drive load error:', e);
      }
    };

    loadMedia();
    loadDrivePhotos();

    // Listener para atualizações em tempo real do painel admin
    window.addEventListener('cms-updated', loadMedia);
    return () => window.removeEventListener('cms-updated', loadMedia);
  }, [cms]);

  const getDriveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

  const getImageUrl = (item) => {
    if (!item) return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop';
    
    // PRIORIDADE 1: Thumbnail capturada manualmente
    if (item.thumbnail_url) return item.thumbnail_url;

    // Prioridade para URL do banco
    const urlValue = item.url || item.url_or_path || '';
    
    if (item.source_type === 'link' || urlValue.startsWith('http')) {
      if (urlValue.includes('youtube.com') || urlValue.includes('youtu.be')) {
        let id = '';
        if (urlValue.includes('v=')) {
          id = urlValue.split('v=')[1].split('&')[0];
        } else {
          id = urlValue.split('/').pop();
        }
        return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
      
      // Se for um vídeo Mp4 direto (sem thumbnail capturada), retorna o default para evitar erro de imagem
      if (urlValue.toLowerCase().endsWith('.mp4') || urlValue.toLowerCase().endsWith('.mov')) {
        return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop';
      }
      
      if (item.media_type === 'pdf' || urlValue.toLowerCase().endsWith('.pdf')) {
        return 'https://cdn-icons-png.flaticon.com/512/337/337946.png'; // Ícone padrão de PDF
      }

      return urlValue || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop';
    }
    
    // Fallback para storage se não for link direto
    if (!urlValue) return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop';
    const { data } = supabase.storage.from('app_media').getPublicUrl(urlValue);
    return data.publicUrl;
  };

  const getMediaUrl = (item) => {
    if (!item) return '';
    const urlValue = item.url || item.url_or_path || '';
    
    if (item.source_type === 'link' || urlValue.startsWith('http')) {
      return urlValue;
    }
    
    if (!urlValue) return '';
    const { data } = supabase.storage.from('app_media').getPublicUrl(urlValue);
    return data.publicUrl;
  };

  // FOTOS EM TEMPO REAL (II CIECC 2026) - Prioridade para o banco, unindo com Drive
  const dbLivePhotos = mediaList.filter(m => m.category === 'Flash 2026').map(m => ({
    id: m.id,
    label: m.title || 'Flash 2026',
    url: getImageUrl(m),
    type: 'image'
  }));

  const livePhotos = [...dbLivePhotos, ...drivePhotos2026];
  
  // Se não houver nada, mantém fallbacks do ano passado ou placeholders
  const finalLivePhotos = livePhotos.length > 0 ? livePhotos : [
    { id: '1hARrE4k2CfTM43whKs2J1cqNScrA93IN', label: 'Carregando...', url: getDriveUrl('1hARrE4k2CfTM43whKs2J1cqNScrA93IN') }
  ];

  const interviews = mediaList.filter(m => m.category === 'Entrevistas Exclusivas' || (m.media_type === 'video' && !m.is_live_stream && m.category !== 'Flash 2026')).map(m => ({
    id: m.id,
    url: getImageUrl(m),
    videoUrl: getMediaUrl(m),
    title: m.title,
    type: 'video'
  }));

  const podcasts = mediaList.filter(m => m.category === 'Podcast' || m.media_type === 'audio').map(m => ({
    id: m.id,
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop',
    audioUrl: getMediaUrl(m),
    title: m.title,
    type: 'podcast'
  }));

  // Memórias: Unir hardcoded com DB e Drive
  const dbMemories = mediaList.filter(m => m.category === 'Memórias').map(m => ({
    id: m.id,
    label: m.title || 'Memória 2025',
    url: getImageUrl(m),
    type: 'photo'
  }));

  const documents = mediaList.filter(m => m.category === 'Palestras' || m.media_type === 'pdf').map(m => ({
    id: m.id,
    url: getImageUrl(m),
    mediaUrl: getMediaUrl(m),
    title: m.title,
    type: 'pdf',
    media_type: 'pdf'
  }));

  const allMemories = [...dbMemories, ...drivePhotos2025, ...memories2025];

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
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>{displaySafe(mediaTitle, 'MÍDIA')}</h2>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.7 }}>{displaySafe(mediaSubtitle, 'Acompanhe tudo do II CIECC em tempo real.')}</p>
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
                  width="100%" height="100%" 
                  src={(liveStream.url)?.includes('youtube') && !(liveStream.url)?.includes('embed') 
                    ? `https://www.youtube.com/embed/${(liveStream.url).split('v=')[1]?.split('&')[0] || (liveStream.url).split('/').pop()}` 
                    : (liveStream.url)} 
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

        {/* 1.5 DOCUMENTOS / SLIDES (NOVO) */}
        {documents.length > 0 && (
          <CarouselSection 
            title="Slides e Materiais"
            items={documents}
            renderItem={(item) => (
              <div onClick={() => onOpenMedia(item)} style={{ textAlign: 'center', width: '100px' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '20px', padding: '3px', 
                  background: '#D69E2E', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '18px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={40} color="#D69E2E" />
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
              </div>
            )}
          />
        )}

        {/* 2. FOTOS CONGRESSO 2026 (CARROSSEL FOTOS) */}
        <CarouselSection
          title="Congresso 2026"
          items={finalLivePhotos}
          renderItem={(img, index) => (
            <div
              onClick={() => onOpenMedia({
                ...img, type: 'gallery', photos: livePhotos, startIndex: index, title: 'Congresso 2026'
              })}
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

        {/* 5. CONGRESSO 2025 (CARROSSEL) */}
        <CarouselSection
          title="Congresso 2025"
          items={allMemories}
          renderItem={(img, index) => (
            <div
              onClick={() => onOpenMedia({
                ...img, type: 'gallery', photos: allMemories, startIndex: index, title: 'Congresso 2025'
              })}
              style={{ 
                width: '180px', height: '120px', borderRadius: '16px', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.05)'
              }}>
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        />

        {/* 6. OUTRAS CATEGORIAS (DINÂMICO) */}
        {Object.entries(
          mediaList.reduce((acc, m) => {
            if (!['Flash 2026', 'Entrevistas Exclusivas', 'Podcast', 'Memórias'].includes(m.category)) {
              if (!acc[m.category]) acc[m.category] = [];
              acc[m.category].push(m);
            }
            return acc;
          }, {})
        ).map(([cat, items]) => (
          <CarouselSection 
            key={cat}
            title={cat || 'Mais Conteúdo'}
            items={items}
            renderItem={(m) => (
              <div onClick={() => onOpenMedia(m)} style={{ width: '180px', height: '120px', borderRadius: '16px', background: '#000', overflow: 'hidden' }}>
                <img src={getImageUrl(m)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          />
        ))}
      </div>

    </div>
  );
};

export default OfficialMediaTab;
