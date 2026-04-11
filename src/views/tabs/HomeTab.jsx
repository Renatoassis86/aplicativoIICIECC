import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  QrCode, 
  Ticket, 
  Star, 
  ArrowRight,
  Bell,
  HelpCircle,
  PlayCircle,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Camera,
  Search,
  Award,
  Megaphone,
  Bookmark,
  Heart,
  ScanLine
} from 'lucide-react';
import CountdownTimer from '../../components/home/CountdownTimer';
import SpeakerDetailModal from '../../components/networking/SpeakerDetailModal';
import SponsorDetailModal from '../../components/networking/SponsorDetailModal';
import { useCMS } from '../../hooks/useCMS';
import { useContent } from '../../hooks/useContent';
import { supabase } from '../../lib/supabase';

const HomeTab = ({ 
  userName, userType, userAvatar, unreadCount, 
  onOpenNotifications, onOpenTicket, onOpenScanner, onOpenBroadcast, onNavigate,
  onOpenFAQ, onOpenSponsors, onOpenMap, onOpenProfile, onOpenMedia
}) => {
  const { content: shortcutsData } = useContent('home', 'home_shortcuts');
  const { content: confirmedSpeakersData } = useContent('home', 'home_confirmed_speakers');
  const { content: homeBadge } = useContent('home', 'home_badge_text');
  const { content: homeTitle } = useContent('home', 'home_title');
  const { content: homeSubtitle } = useContent('home', 'home_subtitle');
  const { content: homeLocation } = useContent('home', 'home_location');
  const { content: homeDateRange } = useContent('home', 'home_date_range');
  const { content: homeVideoUrl } = useContent('home', 'home_video_url');
  const { content: homeCountdownDate } = useContent('home', 'home_countdown_date');
  
  const [sponsors, setSponsors] = React.useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = React.useState(null);
  const [selectedSponsor, setSelectedSponsor] = React.useState(null);

  useEffect(() => {
    async function fetchSponsors() {
      const { data } = await supabase.from('sponsors').select('*').eq('active', true).order('order_index');
      if (data) setSponsors(data);
    }
    fetchSponsors();
  }, []);

  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = (userName && typeof userName === 'string') ? userName.charAt(0) : 'C';

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'admin') return 'Organizador';
    if (type === 'staff') return 'Staff';
    if (type.includes('patrocinador')) return 'Patrocinador';
    if (type === 'palestrante') return 'Palestrante';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Ícones dinâmicos para atalhos
  const getIcon = (iconName) => {
    const icons = { Calendar, Star, Briefcase, Award, QrCode, Ticket, MapPin, HelpCircle };
    const IconComp = icons[iconName] || HelpCircle;
    return <IconComp size={24} color="var(--primary)" />;
  };

  const getAction = (key) => {
    const actions = {
      agenda: () => onNavigate('agenda'),
      speakers: () => onNavigate('speakers'),
      sponsors: onOpenSponsors,
      ticket: onOpenTicket,
      map: onOpenMap,
      faq: onOpenFAQ
    };
    return actions[key] || (() => {});
  };

  const shortcuts = shortcutsData || [];
  const confirmedSpeakers = confirmedSpeakersData || [];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. Cabeçalho Institucional & 2. Banner Principal */}
      <section style={{ 
        padding: 'calc(env(safe-area-inset-top, 20px) + 60px) 20px 48px', 
        background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern - Símbolo Acadêmico (Coluna) */}
        <div style={{ position: 'absolute', top: '10%', right: '-5%', opacity: 0.1, transform: 'rotate(15deg)' }}>
          <img src="/logo.png" alt="" style={{ height: '280px', filter: 'invert(1)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* TOP BAR: MENU MAIS & CIRECLE-AVATAR */}
          {/* TOP BAR: PERFIL (ESQUERDA) & AÇÕES (DIREITA) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            {/* LOGO (ESQUERDA) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="/logo.png" 
                alt="CIECC" 
                style={{ 
                  height: '42px', 
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }} 
              />
            </div>

            {/* AÇÕES (DIREITA) */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={onOpenNotifications} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                <Bell size={20} color="white" />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#E53E3E', color: 'white',
                    fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>
              <button 
                onClick={() => onNavigate('more')}
                style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ width: '20px', height: '2px', background: 'white', borderRadius: '1px' }}></div>
                  <div style={{ width: '14px', height: '2px', background: 'white', borderRadius: '1px' }}></div>
                  <div style={{ width: '18px', height: '2px', background: 'white', borderRadius: '1px' }}></div>
                </div>
              </button>
            </div>
          </div>

          {/* Removido o logo centralizado para dar espaço ao vídeo */}

          <div style={{ marginBottom: '12px' }}>
            <span className="badge-official" style={{ background: 'var(--gold)', color: 'var(--secondary)', fontWeight: '900', fontSize: '9px' }}>{homeBadge}</span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '22px', 
            fontWeight: '800', 
            lineHeight: '1.2',
            marginBottom: '16px',
            color: 'white'
          }}>
            {homeTitle} <br/>
            <span style={{ color: 'var(--gold)', fontSize: '20px', fontWeight: '800' }}>{homeSubtitle}</span>
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <MapPin size={12} color="var(--gold)" /> {homeLocation}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <Calendar size={12} color="var(--gold)" /> {homeDateRange}
            </div>
          </div>

          {/* VÍDEO INTRODUTÓRIO OTIMIZADO (POO - Preview On-load) */}
          <div style={{ 
            width: '100%', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            marginBottom: '24px', 
            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
            background: 'black',
            aspectRatio: '16/9',
            position: 'relative',
            cursor: 'pointer'
          }} onClick={() => {
            const container = document.getElementById('video-container');
            if (container) {
              container.innerHTML = `<iframe width="100%" height="100%" src="${homeVideoUrl}?autoplay=1&modestbranding=1&rel=0" title="II CIECC 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`;
            }
          }} id="video-container">
            <img 
              src={homeVideoUrl ? `https://img.youtube.com/vi/${homeVideoUrl.split('/').pop()}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop'} 
              alt="Preview II CIECC" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
            />
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary)'
            }}>
              <PlayCircle size={32} />
            </div>
            <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: 'white', fontSize: '12px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              ASSISTIR VÍDEO PROMOCIONAL
            </div>
          </div>

          <div style={{ padding: '0 0px', margin: '16px 0 24px' }}>
            <CountdownTimer targetDate={homeCountdownDate} />
          </div>

          <button 
            onClick={() => onNavigate('agenda')} 
            className="btn-primary" 
            style={{ 
              background: 'white', 
              color: 'var(--primary)', 
              border: 'none', 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '900', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
            }}>
            EXPLORAR PROGRAMAÇÃO <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 3. Comunicados Oficiais */}
      <section style={{ padding: '0 20px', marginTop: '-20px', position: 'relative', zIndex: 20 }}>
        <div 
           onClick={onOpenNotifications}
           className="card" 
           style={{ borderLeft: '4px solid var(--gold)', display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}
        >
          <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
            <Bell size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {unreadCount > 0 ? `Novo Comunicado (${unreadCount})` : 'Central de Mensagens'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {unreadCount > 0 ? 'Toque para abrir a notificação.' : 'Acompanhe os avisos da organização.'}
            </p>
          </div>
          <ChevronRight size={18} color="var(--border)" />
        </div>

        {(userType === 'staff' || userType === 'admin' || userType === 'organizador') && (
          <button 
            onClick={onOpenBroadcast}
            style={{ 
              width: '100%', padding: '12px', marginTop: '12px', borderRadius: '10px',
              background: 'white', border: '1px solid var(--primary)', color: 'var(--primary)',
              fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Megaphone size={16} /> Disparar Novo Alarme (Staff)
          </button>
        )}
      </section>

      {/* PARTICIPANTES CONFIRMADOS - AUTO MARQUEE */}
      <section style={{ padding: '32px 0 0 0' }}>
        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <h4 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
            Participantes Confirmados
          </h4>
        </div>
        
        <div className="marquee-container" style={{ background: 'transparent', border: 'none', padding: '0' }}>
          <div className="marquee-content" style={{ animationDuration: '25s', gap: '20px' }}>
            {confirmedSpeakers.map((p, idx) => (
              <div key={`${p.name}-${idx}`}
                onClick={() => setSelectedSpeaker(p)}
                style={{ 
                  minWidth: '150px', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}>
                <div style={{ 
                  width: '90px', height: '90px', 
                  borderRadius: '50%', 
                  border: '3px solid var(--gold)',
                  padding: '4px',
                  marginBottom: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.2', marginBottom: '4px' }}>{p.name}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.2' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Acessos Rápidos */}
      <section style={{ padding: '24px 20px' }}>
        <h4 className="section-title">Acesso Rápido</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {shortcuts.map(item => (
            <div 
              key={item.label} 
              onClick={getAction(item.key)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{ 
                background: item.bg || 'white', 
                width: '64px', height: '64px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                {getIcon(item.icon)}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', textAlign: 'center', color: 'var(--text-main)', opacity: 0.8 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Acontecendo Agora removida por solicitação */}

      {/* 6. Carrossel de Patrocinadores Master - FULL WIDTH & FAST */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px 0',
          border: '2px solid var(--gold)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: '20px' }}>
             NOSSOS PATROCINADORES MASTER
          </p>
          
          <div className="marquee-container" style={{ height: '140px' }}>
             <div className="marquee-content" style={{ animationDuration: '20s' }}>
                 {[...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
                   <div 
                     key={`${s.id}-${idx}`} 
                     onClick={() => setSelectedSponsor(s)}
                     className="marquee-item"
                     style={{ 
                       cursor: 'pointer', 
                       display: 'flex', 
                       flexDirection: 'column', 
                       alignItems: 'center',
                       gap: '8px',
                       minWidth: '150px'
                     }}
                   >
                     <div style={{
                       width: '100px', height: '100px', 
                       background: 'white', borderRadius: '16px',
                       padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                       border: '1px solid #f0f0f0'
                     }}>
                        <img src={s.logo_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                     </div>
                     <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)' }}>{s.name}</span>
                   </div>
                 ))}
             </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', padding: '0 20px' }}>
             <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '900', letterSpacing: '0.5px', marginBottom: '16px' }}>TOQUE PARA VER DETALHES</p>
             <button 
               onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/patrocinio/index.html', '_blank')}
               style={{ 
                 width: '100%', padding: '14px', borderRadius: '12px', 
                 background: 'var(--primary)', color: 'white', border: '1px solid var(--gold)',
                 fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
               }}
             >
               QUERO SER UM PATROCINADOR <ExternalLink size={16} />
             </button>
          </div>
        </div>
      </section>

      {/* 7. Seção de Favoritos Personalizada */}
      <section style={{ padding: '24px 20px' }}>
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} fill="var(--gold)" color="var(--gold)" /> Seus Favoritos
        </h4>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '24px', 
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          border: '1px dashed var(--border)'
        }}>
           <div style={{ background: '#F8F9FA', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bookmark size={20} color="var(--text-muted)" />
           </div>
           <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '4px' }}>Nada salvo ainda?</p>
           <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Salve publicações, palestras e parceiros para vê-los aqui rapidamente.</p>
           <button style={{ background: 'var(--accent)', color: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
              EXPLORAR EVENTO
           </button>
        </div>
      </section>

      {/* Rodapé da Home (Placeholder Institucional) */}
      <footer style={{ marginTop: '60px', padding: '32px 20px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'white' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>II CIECC 2026</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Criado por</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path d="M8 32L20 8L32 32" stroke="var(--primary)" strokeWidth="3" />
              <path d="M4 21H36" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="20" cy="6" r="3" fill="var(--primary)" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px' }}>ARKOS</span>
          </div>
        </div>
      </footer>

      {/* MODAL DETALHE PALESTRANTE */}
      {selectedSpeaker && (
        <SpeakerDetailModal 
          speaker={selectedSpeaker} 
          onClose={() => setSelectedSpeaker(null)} 
          onSaveFavorite={(s) => {
            const stored = localStorage.getItem('ciecc_favorite_speakers');
            let favs = stored ? JSON.parse(stored) : [];
            if (favs.includes(s.id)) favs = favs.filter(id => id !== s.id);
            else favs.push(s.id);
            localStorage.setItem('ciecc_favorite_speakers', JSON.stringify(favs));
          }}
        />
      )}

      {selectedSponsor && (
        <SponsorDetailModal 
          sponsor={selectedSponsor} 
          onClose={() => setSelectedSponsor(null)} 
          onSaveFavorite={(s) => {
            const stored = localStorage.getItem('ciecc_favorite_sponsors');
            let favs = stored ? JSON.parse(stored) : [];
            if (favs.includes(s.id)) favs = favs.filter(id => id !== s.id);
            else favs.push(s.id);
            localStorage.setItem('ciecc_favorite_sponsors', JSON.stringify(favs));
          }}
        />
      )}

    </div>
  );
};

export default HomeTab;
