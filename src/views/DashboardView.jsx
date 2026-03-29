import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Briefcase, 
  User, 
  Bell, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';

const DashboardView = () => {
  const [activeTab, setActiveTab] = useState('home');

  const modules = [
    { id: 1, title: 'Agenda & Programação', icon: <Calendar color="var(--primary)" />, color: '#FDF2F2' },
    { id: 2, title: 'Networking & Chats', icon: <Users color="#2B6CB0" />, color: '#EBF8FF' },
    { id: 3, title: 'Expositores & Parceiros', icon: <Briefcase color="#38A169" />, color: '#F0FFF4' },
    { id: 4, title: 'Conteúdo de Apoio', icon: <FileText color="#D69E2E" />, color: '#FFFFF0' },
    { id: 5, title: 'Galeria & Fotos', icon: <ImageIcon color="#805AD5" />, color: '#FAF5FF' },
    { id: 6, title: 'Localização do Evento', icon: <MapPin color="#E53E3E" />, color: '#FFF5F5' },
  ];

  return (
    <div className="dashboard-view fade-in" style={{ paddingBottom: '90px' }}>
      {/* Top Header com a Logo do Congresso */}
      <header style={{ 
        padding: '20px 20px 16px', 
        background: 'var(--white)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Bell size={24} color="var(--text-muted)" />
            <span style={{ 
              position: 'absolute', 
              top: '0px', 
              right: '0px', 
              background: 'var(--primary)', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          </div>
          <img src="/logo.png" alt="CIECC" style={{ height: '48px', width: 'auto' }} />
          <User size={24} color="var(--text-muted)" />
        </div>
        <div style={{ width: '100%', textAlign: 'left' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)' }}>
            Olá, <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Congressista</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bem-vindo ao canal oficial do II CIECC</p>
        </div>
      </header>

      {/* Hero Welcome Card */}
      <section style={{ padding: '16px' }}>
        <div className="card" style={{ 
          background: 'var(--secondary)', 
          color: 'white', 
          position: 'relative', 
          overflow: 'hidden',
          padding: '24px'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ 
              background: 'var(--primary)', 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '4px 8px', 
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>Próximo Evento</span>
            <h3 style={{ marginTop: '12px', fontSize: '20px', fontFamily: 'var(--font-serif)' }}>
              Palestra Magna de Abertura
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Início em 2h 45min • Auditório Principal
            </p>
            <button style={{ 
              marginTop: '20px', 
              background: 'var(--primary)', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              width: 'fit-content'
            }}>
              Configurar Lembrete
            </button>
          </div>
          {/* Subtle logo watermark effect */}
          <img src="/logo.png" alt="" style={{ 
            position: 'absolute', 
            right: '-40px', 
            bottom: '-40px', 
            height: '180px', 
            opacity: 0.05,
            filter: 'grayscale(1) invert(1)'
          }} />
        </div>
      </section>

      {/* Explore Grid */}
      <section style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Explorar Congresso</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px' 
        }}>
          {modules.map(mod => (
            <div key={mod.id} className="card" style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start',
              gap: '12px',
              border: '1px solid var(--border)',
              boxShadow: 'none'
            }}>
              <div style={{ 
                background: mod.color, 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {mod.icon}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.2', color: 'var(--secondary)' }}>
                {mod.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Social Card */}
      <section style={{ padding: '0 16px 16px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', background: '#F8F9FA', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'white', padding: '10px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <MessageSquare size={18} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Canal de Avisos</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2 novos comunicados hoje</p>
            </div>
          </div>
          <ChevronRight size={18} color="#CBD5E0" />
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home />
          <span>Início</span>
        </button>
        <button className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveTab('agenda')}>
          <Calendar />
          <span>Agenda</span>
        </button>
        <button className={`nav-item ${activeTab === 'networking' ? 'active' : ''}`} onClick={() => setActiveTab('networking')}>
          <Users />
          <span>Pessoas</span>
        </button>
        <button className={`nav-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
          <Briefcase />
          <span>Parceiros</span>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardView;
