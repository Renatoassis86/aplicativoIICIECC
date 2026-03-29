import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { 
  HelpCircle, 
  User, 
  MapPin, 
  QrCode, 
  Settings, 
  Phone, 
  LogOut, 
  ChevronRight, 
  Ticket,
  BookOpen,
  BellRing,
  Monitor,
  Star,
  Briefcase,
  Camera
} from 'lucide-react';

const MoreTab = ({ onLogout, userName, userType, userCpf, userAvatar, onOpenScanner, onOpenBroadcast, onOpenAdminPortal }) => {
  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = (userName && typeof userName === 'string') ? userName.charAt(0) : 'C';

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'staff') return 'Staff / Organização';
    if (type === 'admin') return 'Administrador';
    if (type === 'patrocinador_diamante') return 'Patrocinador Diamante';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const menuGroups = [
    {
      title: 'Configurações do Perfil',
      items: [
        { label: 'Meus Tickets', icon: <Ticket size={18} color="#D69E2E" /> },
        { label: 'Minha Agenda', icon: <BookOpen size={18} color="#2B6CB0" /> },
        { label: 'Configurações', icon: <Settings size={18} color="#718096" /> },
      ]
    },
    {
      title: 'Informações do Evento',
      items: [
        { label: 'FAQ (Perguntas Frequentes)', icon: <HelpCircle size={18} color="#38A169" /> },
        { label: 'Palestrantes', icon: <Star size={18} color="#805AD5" /> },
        { label: 'Patrocinadores & Parceiros', icon: <Briefcase size={18} color="var(--primary)" /> },
        { label: 'Mapa / Localização', icon: <MapPin size={18} color="#E53E3E" /> },
      ]
    },
    {
      title: 'Suporte & Ação',
      items: [
        ...(userType === 'staff' || userType === 'admin' ? [
          { label: 'Scanner QR Code', icon: <QrCode size={18} color="#111" />, action: onOpenScanner },
          { label: 'Nova Notificação (Push)', icon: <BellRing size={18} color="#D69E2E" />, action: onOpenBroadcast },
        ] : []),
        ...(userType === 'admin' ? [
          { label: 'Portal Administrativo (PC)', icon: <Monitor size={18} color="var(--primary)" />, action: onOpenAdminPortal },
        ] : []),
        { 
          label: 'Fale com a Organização', 
          icon: <Phone size={18} color="#3182CE" />, 
          action: () => window.open('https://wa.me/558393322457', '_blank')
        },
      ]
    }
  ];

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      {/* Profile Header */}
      <header style={{ 
        padding: 'env(safe-area-inset-top, 32px) 20px 24px', 
        background: 'var(--secondary)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <label style={{ cursor: 'pointer', position: 'relative' }}>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              // Simulação de Upload Permanente para o Supabase
              // O URL temporário é apenas para visualização imediata antes do refresh
              const reader = new FileReader();
              reader.onload = async (event) => {
                const base64 = event.target.result;
                const { error } = await supabase.from('profiles').update({ avatar_url: base64 }).eq('cpf', userCpf);
                if (error) alert('Erro ao salvar foto.');
                else window.location.reload(); // Recarrega para sincronizar App.jsx
              };
              reader.readAsDataURL(file);
            }} 
          />
          <div style={{ 
            width: '70px', 
            height: '70px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            border: '2px solid var(--gold)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {userAvatar ? (
              <img src={userAvatar} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
            <div style={{ 
              position: 'absolute', bottom: 0, right: 0, left: 0, 
              background: 'rgba(0,0,0,0.5)', height: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <Camera size={10} color="white" />
            </div>
          </div>
        </label>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-serif)' }}>{userName || 'Visitante'}</h2>
          <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>{formatUserType(userType)}</p>
        </div>
      </header>

      {/* Menu Sections */}
      <section style={{ padding: '20px' }}>
        {menuGroups.map(group => (
          <div key={group.title} style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {group.title}
            </h4>
            <div className="card" style={{ padding: '4px' }}>
              {group.items.map((item, index) => (
                <div 
                  key={item.label} 
                  onClick={item.action}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '14px 12px',
                    borderBottom: index === group.items.length - 1 ? 'none' : '1px solid var(--border)',
                    cursor: item.action ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: '#F8F9FA', padding: '8px', borderRadius: '8px' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary)' }}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} color="#CBD5E0" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={onLogout}
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid #E53E3E', 
            color: '#E53E3E', 
            fontSize: '14px', 
            fontWeight: '700',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px',
            background: 'white',
            marginTop: '40px'
          }}
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>

        {/* Footer Arkos assinado à direita */}
        <div style={{ 
          marginTop: '60px', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500', opacity: 0.5 }}>
            Criado por
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32L20 8L32 32" stroke="#C4B08F" strokeWidth="4" />
              <path d="M4 21H36" stroke="#C4B08F" strokeWidth="4" />
              <circle cx="20" cy="6" r="3.5" fill="#C4B08F" />
            </svg>
            <span style={{ 
              color: '#C4B08F', 
              fontSize: '15px', 
              fontWeight: '700', 
              letterSpacing: '0.5px'
            }}>ARKOS</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MoreTab;
