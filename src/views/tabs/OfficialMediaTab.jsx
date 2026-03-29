import React from 'react';
import { 
  Play, 
  Camera, 
  Mic, 
  ChevronRight, 
  PlayCircle, 
  FileText,
  Video,
  ExternalLink,
  Award
} from 'lucide-react';

const OfficialMediaTab = () => {
  const sections = [
    {
      title: 'Fotos em Tempo Real',
      subtitle: 'Acompanhe a cobertura oficial do II CIECC',
      type: 'photos',
      items: [
        { id: 1, url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop', label: 'Cerimônia de Abertura' },
        { id: 2, url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop', label: 'Auditório Principal' },
        { id: 3, url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop', label: 'Networking Coffee' },
        { id: 4, url: 'https://images.unsplash.com/photo-1523580494863-6f30312248d5?w=300&h=200&fit=crop', label: 'Workshops Acadêmicos' },
      ]
    },
    {
      title: 'Entrevistas Exclusivas',
      subtitle: 'Conversas com palestrantes e organizadores',
      type: 'videos',
      items: [
        { 
          id: 5, 
          url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=400&fit=crop', 
          title: 'Dr. Christopher Schlect',
          tag: 'Entrevista',
          duration: '12:45'
        },
        { 
          id: 6, 
          url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=400&fit=crop', 
          title: 'Bastidores Organizadores',
          tag: 'Talk',
          duration: '08:20'
        },
      ]
    },
    {
      title: 'Espaço do Patrocinador',
      subtitle: 'Mensagens e soluções dos nossos parceiros',
      type: 'sponsor',
      items: [
        { 
          id: 7, 
          title: 'Mensagem OIKOS Educação', 
          desc: 'Como a tecnologia auxilia na CCD',
          logo: '/logo.png', 
          action: 'Ver Mais'
        },
        { 
          id: 8, 
          title: 'Editora Trinitas', 
          desc: 'Lançamentos exclusivos no evento',
          logo: '/logo.png', 
          action: 'Acesse'
        },
      ]
    }
  ];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header Customizado Mídia */}
      <header style={{ 
        padding: 'env(safe-area-inset-top, 40px) 20px 24px', 
        background: 'var(--secondary)', 
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
            <Video size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>CIECC <span style={{ color: 'var(--gold)' }}>Mídia</span></h2>
        </div>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>O hub oficial de conteúdo do II Congresso Internacional de Educação Cristã Clássica.</p>
      </header>

      {/* Grid de Seções */}
      <div style={{ padding: '0 20px' }}>
        
        {/* Banner de Destaque - Mensagem do Palestrante */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #4A101D 100%)', 
          borderRadius: '20px', 
          padding: '24px', 
          color: 'white', 
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
             <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>Destaque do Dia</span>
             <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '12px', marginBottom: '8px' }}>A Mensagem do Dr. Christopher</h3>
             <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px', lineHeight: '1.5' }}>Confira o recado especial deixado para os congressistas sobre o futuro da CCD.</p>
             <button style={{ background: 'var(--gold)', color: '#111', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlayCircle size={18} /> ASSISTIR AGORA
             </button>
          </div>
          <PlayCircle size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, color: 'white' }} />
        </div>

        {sections.map((section, sIndex) => (
          <div key={section.title} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{section.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{section.subtitle}</p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Ver Ver</span>
            </div>

            {section.type === 'photos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {section.items.map(img => (
                  <div key={img.id} style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '3/2' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '8px 12px' }}>
                       <span style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'videos' && (
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                {section.items.map(vid => (
                  <div key={vid.id} style={{ minWidth: '160px', position: 'relative' }}>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4' }}>
                      <img src={vid.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.4)' }}>
                         <Play size={16} fill="white" color="white" />
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px' }}>
                        {vid.tag}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px', color: 'var(--secondary)' }}>{vid.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Duração: {vid.duration}</p>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'sponsor' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {section.items.map(item => (
                  <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                    <div style={{ background: 'var(--accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Award size={24} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <button style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '800', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '8px' }}>
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Podcast / Audio Section */}
        <div style={{ background: '#F8F9FA', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
              <Mic size={24} color="var(--gold)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>CIECC Podcasts</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ouça os insights onde estiver</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Play size={14} fill="var(--primary)" color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: '700' }}>O Futuro das Artes Liberais</p>
              <div style={{ height: '4px', background: '#eee', borderRadius: '2px', marginTop: '6px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>12:00</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficialMediaTab;
