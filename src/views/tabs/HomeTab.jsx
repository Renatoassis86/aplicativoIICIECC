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
  Megaphone
} from 'lucide-react';
import CountdownTimer from '../../components/home/CountdownTimer';

const HomeTab = ({ userName, userType, unreadCount, onOpenNotifications, onOpenTicket, onOpenScanner, onOpenBroadcast }) => {
  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = userName ? userName.charAt(0) : 'C';

  const shortcuts = [
    { label: 'Programação', icon: <Calendar color="var(--primary)" size={24} />, bg: 'var(--accent)' },
    { label: 'Palestrantes', icon: <Star color="#D69E2E" size={24} />, bg: '#FFFFF0' },
    { label: 'Parceiros', icon: <Briefcase color="#2B6CB0" size={24} />, bg: '#EBF8FF' },
    { label: 'Patrocinadores', icon: <Award color="#38A169" size={24} />, bg: '#F0FFF4' },
    { label: 'Meu QR Code', icon: <QrCode color="#E53E3E" size={24} />, bg: '#FFF5F5', action: onOpenTicket },
    { label: 'Meus Tickets', icon: <Ticket color="#805AD5" size={24} />, bg: '#FAF5FF' },
    { label: 'Como chegar', icon: <MapPin color="#718096" size={24} />, bg: '#F7FAFC' },
    { label: 'FAQ', icon: <HelpCircle color="#D81E1E" size={24} />, bg: '#FDF2F2' },
  ];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. Cabeçalho Institucional & 2. Banner Principal */}
      <section style={{ 
        padding: '24px 20px 48px', 
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
          {/* Logo Centralizada no topo - Clara sobre Borgonha */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <img 
              src="/logo.png" 
              alt="CIECC" 
              style={{ 
                height: '80px', 
                objectFit: 'contain'
              }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Bem-vindo,</span>
              <span style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}>{firstName}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {userType === 'staff' && (
                <button onClick={onOpenScanner} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ScanLine size={20} color="var(--gold)" />
                </button>
              )}
              <button onClick={onOpenNotifications} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
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
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#111', fontSize: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {initial}
              </div>
            </div>
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
            Educação Cristã Clássica: <br/>
            <span style={{ color: 'var(--gold)', fontSize: '18px' }}>Fomentando o Diálogo da Abordagem de Ensino Clássica</span>
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <MapPin size={12} color="var(--gold)" /> São Paulo, SP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
              <Calendar size={12} color="var(--gold)" /> 01 e 02 Mai
            </div>
          </div>

          <div style={{ padding: '0 0px', margin: '16px 0 24px' }}>
            <CountdownTimer targetDate="2026-05-01T08:00:00" />
          </div>

          <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)', border: 'none', width: '100%', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
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

        {(userType === 'staff' || userType === 'admin') && (
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

      {/* NOVO: PALESTRANTES CONFIRMADOS */}
      <section style={{ padding: '32px 0 0 20px' }}>
        <div style={{ paddingRight: '20px' }}>
          <h4 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
            Participantes Confirmados
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Ver Todos</span>
          </h4>
        </div>
        
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '16px', 
          paddingBottom: '16px',
          paddingRight: '20px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none'
        }}>
          {[
            { name: 'Dr. Christopher Schlect', desc: 'New St. Andrews (USA)', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
            { name: 'Dr. Keith Nix', desc: 'Veritas School (Richmond)', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' },
            { name: 'Ms. Thiago Dutra', desc: 'Diretor Schola Classics', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
            { name: 'Esp. Matheus Macedo', desc: 'Diretor Zoe Christian School', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
            { name: 'Esp. Maurício Fonseca', desc: 'Editor-chefe Editora Trinitas', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
            { name: 'Ms. Elmer Pires', desc: 'Fundador Editora Trinitas', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop' }
          ].map(p => (
            <div key={p.name} style={{ 
              minWidth: '140px', 
              scrollSnapAlign: 'start',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ 
                width: '80px', height: '80px', 
                borderRadius: '50%', 
                border: '2px solid var(--gold)',
                padding: '3px',
                marginBottom: '12px'
              }}>
                <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'crop' }} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.2', marginBottom: '4px' }}>{p.name}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.2' }}>{p.desc}</p>
            </div>
          ))}
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

      {/* 6. Bloco Comercial / Institucional e 7. Cobertura Oficial */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Comercial */}
          <div style={{ 
            background: 'white', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px',
            border: '1px solid var(--gold)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Award size={24} color="var(--gold)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>Patrocínio Diamante</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>Conheça as soluções da OIKOS</p>
            <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
              Ver Mais <ExternalLink size={12} />
            </div>
          </div>

          {/* Cobertura */}
          <div style={{ 
            background: 'var(--secondary)', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px',
            color: 'white'
          }}>
            <Camera size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>Galeria Oficial</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>Fotos e vídeos da cobertura</p>
            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
              Acessar <PlayCircle size={12} />
            </div>
          </div>

        </div>
      </section>

      {/* Rodapé da Home (Placeholder Institucional) */}
      <footer style={{ marginTop: '40px', padding: '0 20px', textAlign: 'center', opacity: 0.5 }}>
        <div style={{ width: '40px', height: '1px', background: 'var(--border)', margin: '0 auto 20px' }}></div>
        <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>II Congresso Internacional CIECC</p>
        <p style={{ fontSize: '10px', marginTop: '4px' }}>Educação Cristã Clássica para as Nações</p>
      </footer>

    </div>
  );
};

export default HomeTab;
