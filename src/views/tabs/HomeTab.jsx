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
  ChevronLeft,
  Camera,
  Search,
  Award,
  Megaphone,
  Bookmark,
  Heart,
  ScanLine,
  Play
} from 'lucide-react';
import CountdownTimer from '../../components/home/CountdownTimer';
import SessionDetailModal from '../../components/agenda/SessionDetailModal';
import SpeakerDetailModal from '../../components/networking/SpeakerDetailModal';
import SponsorDetailModal from '../../components/networking/SponsorDetailModal';
import { useCMS } from '../../hooks/useCMS';
import { useContent } from '../../hooks/useContent';
import { supabase } from '../../lib/supabase';

const HomeTab = ({ 
  userName, userType, userAvatar, unreadCount, 
  onOpenNotifications, onOpenTicket, onOpenScanner, onOpenBroadcast, onNavigate,
  onOpenFAQ, onOpenSponsors, onOpenMap, onOpenProfile, onOpenMedia, onOpenWorkshops, onOpenSurvey, onOpenPreRegistration, userCpf
}) => {
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    
    // Suporte para youtube.com/watch?v=ID e youtu.be/ID
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$|\?)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url;
  };

  const displaySafe = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.text) return val.text;
    if (typeof val === 'object' && val.rendered) return val.rendered;
    return String(val);
  };
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
  const [workshops, setWorkshops] = React.useState([]);
  const [newsItems, setNewsItems] = React.useState([]);
  const [speakers, setSpeakers] = React.useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = React.useState(null);
  const [selectedSponsor, setSelectedSponsor] = React.useState(null);
  const [isOnline, setIsOnline] = React.useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSponsors() {
      const { data } = await supabase.from('sponsors').select('*').order('display_order');
      if (data && isMounted) setSponsors(data);
    }
    async function fetchWorkshops() {
      const { data } = await supabase.from('agenda_sessions').select('*').eq('category', 'Oficina').limit(10);
      if (data && isMounted) setWorkshops(data);
    }
    
    async function fetchSpeakers() {
      const { data } = await supabase.from('speakers').select('*').limit(20);
      if (data && isMounted) {
        setSpeakers(data.map(s => ({
          id: s.id,
          name: s.name,
          desc: s.institution,
          img: s.photo_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop',
          longBio: s.bio,
          category: 'Palestrante',
          websiteUrl: s.website_url
        })));
      }
    }
    
    async function fetchNews() {
      try {
        const unifiedResults = [];

        // 1. Últimas Mídias Oficiais (Fotos, Videos, Podcasts)
        const { data: media } = await supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (media) media.forEach(m => unifiedResults.push({ ...m, itemType: 'media', newsTitle: m.title }));

        // 2. Últimas Postagens do Feed Social
        const { data: posts } = await supabase
          .from('social_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (posts) posts.forEach(p => unifiedResults.push({ ...p, itemType: 'social', newsTitle: p.caption?.substring(0, 50) + (p.caption?.length > 50 ? '...' : '') }));

        // 3. Últimos Comunicados / Notificações (Notícias gerais)
        const { data: notices } = await supabase
          .from('member_inbox')
          .select('*')
          .eq('user_cpf', userCpf)
          .order('created_at', { ascending: false })
          .limit(5);
        if (notices) notices.forEach(n => unifiedResults.push({ ...n, itemType: 'notice', newsTitle: n.title }));

        if (isMounted) {
          const sorted = unifiedResults.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          setNewsItems(sorted.slice(0, 15));
        }
      } catch (err) {
        console.error("[HomeTab] Error fetching news:", err);
        if (isMounted) setNewsItems([]);
      }
    }

    async function fetchUserModality() {
      const { data: member } = await supabase.from('members').select('modality').eq('cpf', userCpf).single();
      if (member && isMounted) {
        setIsOnline((member.modality || '').toLowerCase().includes('online'));
      }
    }

    fetchSponsors();
    fetchWorkshops();
    fetchSpeakers();
    fetchNews();
    fetchUserModality();

    // REALTIME NEWS: Sincroniza quando algo novo é postado
    const newsSub = supabase
      .channel('home_news_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => fetchNews())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'media_assets' }, () => fetchNews())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'member_inbox', filter: `user_cpf=eq.${userCpf}` }, () => fetchNews())
      .subscribe();

    return () => { 
      isMounted = false; 
      supabase.removeChannel(newsSub);
    };
  }, [userCpf]);

  const CarouselSection = ({ title, items, renderItem }) => (
    <section style={{ padding: '24px 0' }}>
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{title}</h4>
        <div style={{ width: '32px', height: '2px', background: 'var(--gold)' }}></div>
      </div>
      <div style={{ 
        display: 'flex', gap: '16px', overflowX: 'auto', padding: '0 20px 10px',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory' 
      }} className="no-scrollbar">
        {items.map((item, idx) => (
          <div key={idx} style={{ scrollSnapAlign: 'start' }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );

  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = (userName && typeof userName === 'string') ? userName.charAt(0) : 'C';

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'admin') return 'Organizador';
    if (type === 'staff') return 'Equipe Staff';
    if (type === 'patrocinador_ouro') return 'Patre. Ouro';
    if (type === 'patrocinador_prata') return 'Patr. Prata';
    if (type === 'patrocinador_bronze') return 'Patr. Bronze';
    if (type.includes('patrocinador')) return 'Patrocinador';
    if (type === 'palestrante') return 'Palestrante / GT';
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
  const confirmedSpeakers = speakers && speakers.length > 0 ? speakers : (confirmedSpeakersData || []);

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. Cabeçalho Institucional & 2. Banner Principal */}
      <section style={{ 
        padding: 'calc(env(safe-area-inset-top, 20px) + 60px) 20px 48px', 
        backgroundImage: 'linear-gradient(135deg, rgba(74, 16, 29, 0.85) 0%, rgba(107, 20, 26, 0.95) 100%), url(/hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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

          <div style={{ marginBottom: '8px' }}>
            <span className="badge-official" style={{ 
              background: 'var(--gold)', 
              color: '#111111', 
              fontWeight: '900', 
              fontSize: '10px' 
            }}>
              {displaySafe(homeBadge)}
            </span>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
              Olá, {firstName}! 
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: '600', lineHeight: '1.4' }}>
              Seja bem-vindo(a) ao II Congresso de Educação Cristã Clássica
            </p>
          </div>

          {/* VÍDEO TRANSMISSÃO OFICIAL - REDESIGN PREMIUM */}
          <div style={{ 
            width: '100%', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            marginBottom: '24px', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            background: '#000',
            aspectRatio: '16/9',
            position: 'relative',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.1)'
          }} 
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => {
            const container = document.getElementById('video-container');
            if (container) {
              container.innerHTML = `<iframe width="100%" height="100%" src="${homeVideoUrl}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3" title="II CIECC 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style="pointer-events: auto;"></iframe>`;
            }
          }} id="video-container">
            {/* Overlay Gradient Dark */}
            <div style={{ 
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, #000 100%)',
              zIndex: 1
            }}></div>

            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: '#E53E3E', color: 'white', padding: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 0 40px rgba(229, 62, 62, 0.4)',
              zIndex: 2,
              transition: 'all 0.2s ease',
              animation: 'pulse-gold 2s ease-in-out infinite'
            }}>
              <Play size={40} fill="white" style={{ marginLeft: '4px' }} />
            </div>
            
            <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', textAlign: 'center', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', background: '#E53E3E', borderRadius: '50%', animation: 'pulse-red 1.5s infinite' }}></div>
                <p style={{ color: '#E53E3E', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>AO VIVO AGORA</p>
              </div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>CLIQUE PARA ASSISTIR À TRANSMISSÃO</h3>
            </div>
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

      {/* BANNER PRÉ-INSCRIÇÃO III CIECC */}
      <section style={{ padding: '24px 20px 0' }}>
        <div
          onClick={onOpenPreRegistration}
          style={{
            background: 'linear-gradient(135deg, #1A3A1A 0%, #0F2A0F 50%, #1E3A1A 100%)',
            borderRadius: '24px', padding: '20px', cursor: 'pointer',
            border: '1px solid rgba(56,161,105,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: '16px',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(56,161,105,0.08)' }} />
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(56,161,105,0.15)', border: '1px solid rgba(56,161,105,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '24px' }}>
            🎟️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: 0, fontFamily: 'Georgia, serif' }}>III CIECC 2027</p>
              <span style={{ background: '#38A169', color: 'white', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', letterSpacing: '1px' }}>ABERTO</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.4 }}>
              Garanta sua vaga! Faça sua pré-inscrição agora.
            </p>
          </div>
          <ChevronRight size={20} color="#38A169" style={{ flexShrink: 0 }} />
        </div>
      </section>

      {/* BANNER PESQUISA DE SATISFAÇÃO */}
      <section style={{ padding: '16px 20px 0' }}>
        <div
          onClick={onOpenSurvey}
          style={{
            background: 'linear-gradient(135deg, #4A101D 0%, #1E3A5F 100%)',
            borderRadius: '24px',
            padding: '20px',
            cursor: 'pointer',
            border: '1px solid rgba(212,193,156,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(212,193,156,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '60px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,193,156,0.05)' }} />
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(212,193,156,0.15)', border: '1px solid rgba(212,193,156,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '24px' }}>
            ⭐
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: 0, fontFamily: 'Georgia, serif' }}>Pesquisa de Satisfação</p>
              <span style={{ background: '#D4C19C', color: '#1A0A0D', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', letterSpacing: '1px' }}>NOVO</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.4 }}>
              Avalie o II CIECC e ajude a construir o próximo Congresso. Leva ~10 min.
            </p>
          </div>
          <ChevronRight size={20} color="#D4C19C" style={{ flexShrink: 0 }} />
        </div>
      </section>

      {/* 3. Comunicados Oficiais */}
      <section style={{ padding: '20px 20px 0', position: 'relative', zIndex: 20 }}>
        <div
           onClick={onOpenNotifications}
           style={{
             background: 'white',
             borderRadius: '24px',
             padding: '20px',
             display: 'flex',
             gap: '16px',
             alignItems: 'center',
             boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
             border: '1px solid rgba(0,0,0,0.03)',
             cursor: 'pointer',
             position: 'relative',
             overflow: 'hidden'
           }}
        >
          {/* Accent Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px', background: 'var(--primary)' }}></div>

          <div style={{
            background: 'var(--accent)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <Bell size={24} color="var(--primary)" />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: '15px',
              fontWeight: '900',
              color: 'var(--secondary)',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-serif)',
              marginBottom: '2px'
            }}>
              {unreadCount > 0 ? `NOVOS AVISOS (${unreadCount})` : 'CENTRAL DE MENSAGENS'}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {unreadCount > 0 ? 'Toque para conferir as novidades.' : 'Acompanhe os comunicados da organização.'}
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '8px', borderRadius: '50%' }}>
            <ChevronRight size={18} color="var(--primary)" />
          </div>
        </div>

        {(userType === 'staff' || userType === 'admin' || userType === 'organizador') && (
          <button
            onClick={onOpenBroadcast}
            style={{
              width: '100%', padding: '14px', marginTop: '12px', borderRadius: '16px',
              background: 'rgba(107, 20, 26, 0.05)', border: '1px dashed var(--primary)', color: 'var(--primary)',
              fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Megaphone size={16} /> Disparar Novo Alarme (Staff)
          </button>
        )}
      </section>

      {/* PALESTRANTES CONFIRMADOS - CARROSSEL */}
      <CarouselSection
         title="Palestras Principais"
         items={confirmedSpeakers}
         renderItem={(p) => (
           <div 
             onClick={() => setSelectedSpeaker(p)}
             style={{ 
               width: '140px', textAlign: 'center',
               background: 'white', padding: '16px 12px', borderRadius: '24px',
               boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.03)'
             }}>
             <div style={{ 
               width: '80px', height: '80px', 
               borderRadius: '50%', border: '2px solid var(--gold)',
               padding: '4px', margin: '0 auto 12px'
             }}>
               <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
             </div>
             <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
             <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.desc}</p>
           </div>
         )}
       />
       
        {/* CHAMADA PARA ESCOLHA DE OFICINAS - PREMIUM DESIGN */}
        {!isOnline && (
        <section style={{ padding: '0 20px', margin: '32px 0' }}>
          <div 
            onClick={onOpenWorkshops}
            style={{ 
              background: 'linear-gradient(135deg, #4A101D 0%, #1A365D 100%)',
              borderRadius: '28px',
              padding: '28px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 15px 35px rgba(26, 54, 93, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
             {/* Background graphics */}
             <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
               <Briefcase size={140} color="white" />
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ background: 'rgba(212, 193, 156, 0.2)', padding: '10px', borderRadius: '14px' }}>
                 <Star size={22} color="var(--gold)" />
               </div>
               <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold)' }}>Vagas Limitadas</span>
             </div>

             <div style={{ marginTop: '4px' }}>
               <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '6px', fontFamily: 'var(--font-serif)', lineHeight: '1.1' }}>
                 Escolha suas Oficinas
               </h3>
               <p style={{ fontSize: '14px', opacity: 0.85, lineHeight: '1.5', maxWidth: '85%' }}>
                 Garanta sua vaga nas atividades práticas mais disputadas do II CIECC.
               </p>
             </div>

             <div style={{ 
               marginTop: '12px', 
               background: 'white', 
               color: '#1A365D', 
               padding: '14px 28px', 
               borderRadius: '16px', 
               fontWeight: '900',
               fontSize: '14px',
               width: 'fit-content',
               display: 'flex',
               alignItems: 'center',
               gap: '10px',
               boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
             }}>
               ESCOLHER AGORA <ArrowRight size={18} />
             </div>
          </div>
        </section>
        )}
       

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

      {/* PATROCINADORES - CARROSSEL EM MOVIMENTO CONTÍNUO */}
      <section style={{ padding: '24px 0', overflow: 'hidden', background: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>Orgulho em Apoiar</h4>
          <div style={{ width: '32px', height: '2px', background: 'var(--gold)' }}></div>
        </div>
        
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            width: 'max-content',
            animation: 'scroll-infinite 20s linear infinite',
            padding: '0 20px'
          }}>
            {/* Duplicamos os itens para garantir o loop infinito suave */}
            {[...sponsors, ...sponsors].map((s, idx) => (
              <div 
                key={`${s.id}-${idx}`}
                onClick={() => setSelectedSponsor(s)}
                style={{ 
                  width: '100px', height: '100px', background: 'white', border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer', flexShrink: 0,
                  transition: 'transform 0.2s ease', 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={s.logo_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 7. Novidades e Comunicados (Feed em Tempo Real) */}
      <section style={{ padding: '24px 20px' }}>
        <h4 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Megaphone size={18} color="var(--primary)" /> Novidades e Comunicados
        </h4>
        
        {newsItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {newsItems.map(item => (
                <div 
                  key={`${item.itemType}-${item.id}`} 
                  onClick={() => {
                    if (item.itemType === 'media') {
                      onOpenMedia(item);
                    } else if (item.itemType === 'social') {
                      onNavigate('feed');
                    } else if (item.itemType === 'notice') {
                      onOpenNotifications();
                    }
                  }}
                  className="card"
                  style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer' }}
                >
                <div style={{ 
                  background: item.itemType === 'notice' ? 'var(--primary)' : 'var(--accent)', 
                  color: item.itemType === 'notice' ? 'white' : 'var(--primary)', 
                  padding: '10px', borderRadius: '12px', minWidth: '50px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {item.itemType === 'media' ? (
                    item.type === 'pdf' ? <ExternalLink size={20} /> : <PlayCircle size={20} />
                  ) : item.itemType === 'social' ? (
                    <Users size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {item.itemType === 'media'
                        ? (item.type === 'video' ? 'Vídeo / Entrevista' : item.type === 'pdf' ? 'PDF / Material' : item.type === 'audio' ? 'Podcast / Áudio' : 'Mídia')
                        : item.itemType === 'social' ? 'Novo Post no Feed' : 'Comunicado Oficial'}
                    </p>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.2' }}>{item.newsTitle}</p>
                </div>
                <ChevronRight size={18} color="var(--border)" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '24px', 
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            border: '1px dashed var(--border)'
          }}>
             <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>Aguardando novidades...</p>
             <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Tudo o que for postado de novo aparecerá aqui para você.</p>
          </div>
        )}
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
