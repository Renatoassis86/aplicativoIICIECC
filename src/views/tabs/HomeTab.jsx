import React from 'react';
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

const HomeTab = ({ 
  userName, userType, userAvatar, unreadCount, 
  onOpenNotifications, onOpenTicket, onOpenScanner, onOpenBroadcast, onNavigate,
  onOpenFAQ, onOpenSponsors, onOpenMap, onOpenProfile
}) => {
  const [selectedSpeaker, setSelectedSpeaker] = React.useState(null);
  const [selectedSponsor, setSelectedSponsor] = React.useState(null);
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

  const shortcuts = [
    { label: 'Programação', icon: <Calendar color="var(--primary)" size={24} />, bg: 'var(--accent)', action: () => onNavigate('agenda') },
    { label: 'Palestrantes', icon: <Star color="#D69E2E" size={24} />, bg: '#FFFFF0', action: () => onNavigate('speakers') },
    { label: 'Parceiros', icon: <Briefcase color="#2B6CB0" size={24} />, bg: '#EBF8FF', action: onOpenSponsors },
    { label: 'Patrocinadores', icon: <Award color="#38A169" size={24} />, bg: '#F0FFF4', action: onOpenSponsors },
    { label: 'Meu QR Code', icon: <QrCode color="#E53E3E" size={24} />, bg: '#FFF5F5', action: onOpenTicket },
    { label: 'Meus Tickets', icon: <Ticket color="#805AD5" size={24} />, bg: '#FAF5FF', action: onOpenTicket },
    { label: 'Como chegar', icon: <MapPin color="#718096" size={24} />, bg: '#F7FAFC', action: onOpenMap },
    { label: 'FAQ', icon: <HelpCircle color="#D81E1E" size={24} />, bg: '#FDF2F2', action: onOpenFAQ },
  ];

  const sponsors = [
    {
      id: 1,
      name: 'OIKOS',
      tierName: 'Patrocinador Master',
      tierColor: '#B9F2FF',
      logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=400&h=400&fit=crop&q=80',
      tagline: 'Líder em gestão académica clássica.',
      bio: 'A OIKOS é a maior parceira tecnológica do movimento de educação clássica na América Latina.',
      website: 'https://oikos.com.br',
      booth: 'Pavilhão Central • Estande 01'
    },
    {
      id: 2,
      name: 'PACTUM',
      tierName: 'Patrocinador Diamante',
      tierColor: '#B9F2FF',
      logo: 'https://images.unsplash.com/photo-1543286386-713bdd54865e?w=400&h=400&fit=crop&q=80',
      tagline: 'Consultoria e Implantação.',
      bio: 'A PACTUM atua no suporte estratégico e institucional a escolas clássicas.',
      website: 'https://pactum.edu.br',
      booth: 'Pavilhão Norte • Estande 12'
    },
    {
      id: 3,
      name: 'Editora Trinitas',
      tierName: 'Patrocinador Ouro',
      tierColor: '#FFD700',
      logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&q=80',
      tagline: 'Livros e Formação.',
      bio: 'A maior editora especializada em conteúdos clássicos e cristãos do Brasil.',
      website: 'https://editoratrinitas.com.br',
      booth: 'Lounge dos Autores'
    },
    {
      id: 4,
      name: 'FICV',
      tierName: 'Parceiro Master',
      tierColor: '#B9F2FF',
      logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=400&h=400&fit=crop&q=80',
      tagline: 'Educação Superior Clássica.',
      bio: 'Pós-graduação e formação contínua de professores.',
      website: 'https://ficv.edu.br',
      booth: 'Hall de Entrada'
    },
    {
      id: 5,
      name: 'Cidade Viva',
      tierName: 'Realizador',
      tierColor: '#4A101D',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop&q=80',
      tagline: 'Educação para o Reino.',
      bio: 'Fundação Cidade Viva apoiando o II CIECC.',
      website: 'https://cidadeviva.org',
      booth: 'VIP Lounge'
    },
    {
       id: 6,
       name: 'Schola Classics',
       tierName: 'Patrocinador Ouro',
       tierColor: '#FFD700',
       logo: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400&h=400&fit=crop&q=80',
       tagline: 'Ensino de Excelência.',
       bio: 'Plataforma de ensino voltada ao currículo clássico.',
       website: 'https://schola.com.br',
       booth: 'Auditório 2'
    },
    {
       id: 7,
       name: 'Veritas School',
       tierName: 'Diamante',
       tierColor: '#B9F2FF',
       logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=400&fit=crop&q=80',
       tagline: 'Verdade em Educação.',
       bio: 'Referência internacional em pedagogia clássica.',
       website: 'https://veritas.edu',
       booth: 'Pavilhão Sul'
    }
  ];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. Cabeçalho Institucional & 2. Banner Principal */}
      <section style={{ 
        padding: 'calc(env(safe-area-inset-top, 20px) + 40px) 20px 48px', 
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
            {/* PERFIL (ESQUERDA) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                onClick={onOpenProfile}
                style={{ 
                  width: '56px', height: '56px', borderRadius: '20px', 
                  background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: '900', color: '#111', fontSize: '20px', 
                  boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid white'
                }}>
                {userAvatar ? (
                  <img src={userAvatar} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-serif)' }}>{initial}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>{firstName}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>{formatUserType(userType)}</span>
              </div>
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

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <img 
              src="/logo.png" 
              alt="CIECC" 
              style={{ 
                height: '80px', 
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)'
              }} 
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span className="badge-official" style={{ background: 'var(--gold)', color: 'var(--secondary)', fontWeight: '900', fontSize: '9px' }}>II EDIÇÃO • 2026</span>
          </div>
          <h1 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '22px', 
            fontWeight: '800', 
            lineHeight: '1.2',
            marginBottom: '16px',
            color: 'white'
          }}>
            II CIECC 2026: <br/>
            <span style={{ color: 'var(--gold)', fontSize: '18px' }}>O Fórum de Excelência para a Discussão e Disseminação da Educação Cristã Clássica</span>
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <MapPin size={12} color="var(--gold)" /> São Paulo, SP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <Calendar size={12} color="var(--gold)" /> 01 e 02 Mai
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
              container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/t5CB9rnexOY?autoplay=1&modestbranding=1&rel=0" title="II CIECC 2026" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>`;
            }
          }} id="video-container">
            <img 
              src="https://img.youtube.com/vi/t5CB9rnexOY/hqdefault.jpg" 
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
            <CountdownTimer targetDate="2026-05-01T08:00:00" />
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
            {[...[
              { name: 'Dr. Christopher Schlect', desc: 'New St. Andrews (USA)', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
              { name: 'Dr. Keith Nix', desc: 'Veritas School (Richmond)', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' },
              { name: 'Ms. Thiago Dutra', desc: 'Diretor Schola Classics', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
              { name: 'Esp. Matheus Macedo', desc: 'Diretor Zoe Christian School', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
              { name: 'Esp. Maurício Fonseca', desc: 'Editor-chefe Editora Trinitas', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
              { name: 'Ms. Elmer Pires', desc: 'Fundador Editora Trinitas', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop' }
            ], ...[
              { name: 'Dr. Christopher Schlect', desc: 'New St. Andrews (USA)', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
              { name: 'Dr. Keith Nix', desc: 'Veritas School (Richmond)', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' },
              { name: 'Ms. Thiago Dutra', desc: 'Diretor Schola Classics', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
              { name: 'Esp. Matheus Macedo', desc: 'Diretor Zoe Christian School', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
              { name: 'Esp. Maurício Fonseca', desc: 'Editor-chefe Editora Trinitas', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
              { name: 'Ms. Elmer Pires', desc: 'Fundador Editora Trinitas', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop' }
            ]].map((p, idx) => (
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
              onClick={item.action ? item.action : null}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: item.action ? 'pointer' : 'default' }}
            >
              <div style={{ 
                background: 'white', 
                width: '64px', height: '64px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '700', textAlign: 'center', color: 'var(--text-main)', opacity: 0.8 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Resumo do Evento */}
      <section style={{ padding: '0 20px 24px' }}>
        <div className="section-title">
          <span>Acontecendo Agora</span>
          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Ver Tudo</span>
        </div>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>09:00</p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Início</p>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '800', fontSize: '15px' }}>Check-in & Welcome Coffee</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hall de Entrada • Cidade Viva</p>
            </div>
          </div>
          <div 
            style={{ background: '#F8F9FA', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={onOpenTicket}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Prepare seu QR Code no App</span>
            </div>
            <ArrowRight size={14} color="var(--text-muted)" />
          </div>
        </div>
      </section>

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
                {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((s, idx) => (
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
                       <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--secondary)' }}>{s.name}</span>
                  </div>
                ))}
             </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
             <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '900', letterSpacing: '0.5px' }}>TOQUE PARA VER DETALHES</span>
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
      <footer style={{ marginTop: '40px', padding: '0 20px', textAlign: 'center', opacity: 0.5 }}>
        <div style={{ width: '40px', height: '1px', background: 'var(--border)', margin: '0 auto 20px' }}></div>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>II Congresso Internacional CIECC</p>
        <p style={{ fontSize: '10px', marginTop: '4px' }}>Discussão e Disseminação da Tradição que Transforma</p>
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
