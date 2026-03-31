import React, { useState } from 'react';
import { ImagePersistenceService } from '../../services/imagePersistence';
import { supabase } from '../../lib/supabase';
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
  Users,
  Star,
  Briefcase,
  Monitor,
  Camera
} from 'lucide-react';

const MoreTab = ({ 
  onLogout, userName, userType, userAvatar, userCpf,
  onOpenScanner, onOpenBroadcast, onOpenAdminPortal, onNavigate,
  onOpenFAQ, onOpenSponsors, onOpenMap, onOpenTicket, onOpenProfile, onOpenGTs, onAvatarUpdate
}) => {
  const [localAvatar, setLocalAvatar] = useState(userAvatar);
  const [uploading, setUploading] = useState(false);
  
  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = (userName && typeof userName === 'string') ? userName.charAt(0) : 'C';

  const handleUpdateAvatar = async (e) => {
    e.stopPropagation(); // Evita abrir o perfil ao clicar só na foto
    const photo = await ImagePersistenceService.capturePhoto();
    if (!photo) return;

    setLocalAvatar(photo.webPath);
    setUploading(true);

    try {
      const fileName = `avatars/${userCpf}_${Date.now()}.jpg`;
      const publicUrlOrBase64 = await ImagePersistenceService.uploadToStorage('profiles', fileName, photo.blob);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlOrBase64 })
        .eq('cpf', userCpf);
        
      if (error) throw error;
      
      if (onAvatarUpdate) onAvatarUpdate(publicUrlOrBase64);
      console.log("[MoreTab] Foto persistida com sucesso.");
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar foto permanentemente.');
    } finally {
      setUploading(false);
    }
  };

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'staff') return 'Staff / Organização';
    if (type === 'admin') return 'Administrador';
    if (type === 'organizador') return 'Organização Oficial';
    if (type?.includes('patrocinador')) return 'Parceiro Patrocinador';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const menuGroups = [
    {
      title: 'Configurações do Perfil',
      items: [
        { label: 'Meu Perfil / Dados', icon: <User size={18} color="var(--primary)" />, action: onOpenProfile },
        { label: 'Meus Tickets', icon: <Ticket size={18} color="#D69E2E" />, action: onOpenTicket },
        { label: 'Minha Agenda', icon: <BookOpen size={18} color="#2B6CB0" />, action: () => onNavigate('agenda') },
      ]
    },
    {
      title: 'Informações do Evento',
      items: [
        { label: 'Network de Participantes', icon: <Users size={18} color="#48BB78" />, action: () => onNavigate('network') },
        { label: 'FAQ (Perguntas Frequentes)', icon: <HelpCircle size={18} color="#38A169" />, action: onOpenFAQ },
        { label: 'Palestrantes', icon: <Star size={18} color="#805AD5" />, action: () => onNavigate('speakers') },
        { label: 'Grupos de Trabalho (GTs)', icon: <BookOpen size={18} color="var(--primary)" />, action: onOpenGTs },
        { label: 'Patrocinadores & Parceiros', icon: <Briefcase size={18} color="var(--primary)" />, action: onOpenSponsors },
        { label: 'Mapa / Localização', icon: <MapPin size={18} color="#E53E3E" />, action: onOpenMap },
        { 
          label: 'Revista do Congresso Anterior', 
          icon: <Monitor size={18} color="#D69E2E" />, 
          action: () => {
            const link = document.createElement('a');
            link.href = '/docs/REVISTA COMPLETA_compressed.pdf';
            link.download = 'REVISTA_CIECC_2025.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        },
      ]
    },
    {
      title: 'Suporte & Ação',
      items: [
        ...(userType === 'staff' || userType === 'admin' || userType === 'organizador' || userType?.includes('patrocinador') ? [
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
        {/* Avatar Circle with direct camera action */}
        <div 
          onClick={handleUpdateAvatar}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.1)', 
            border: '3px solid var(--gold)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {localAvatar || userAvatar ? (
              <img src={localAvatar || userAvatar} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
            
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="pulse" style={{ width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '50%' }}></div>
              </div>
            )}
          </div>
          <div style={{ 
            position: 'absolute', bottom: 0, right: 0, 
            background: 'var(--gold)', borderRadius: '50%', padding: '6px', border: '2px solid var(--secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            <Camera size={12} color="var(--secondary)" />
          </div>
        </div>

        {/* User Info with profile modal action */}
        <div onClick={onOpenProfile} style={{ flex: 1, cursor: 'pointer' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>
            {userName || 'Visitante'}
          </h2>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {formatUserType(userType)}
          </p>
        </div>
      </header>

      {/* Menu Sections */}
      <section style={{ padding: '20px' }}>
        {menuGroups.map(group => (
          <div key={group.title} style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', paddingLeft: '4px' }}>
              {group.title}
            </h4>
            <div className="card" style={{ padding: '2px', borderRadius: '16px' }}>
              {group.items.map((item, index) => (
                <div 
                  key={item.label} 
                  onClick={item.action}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 14px',
                    borderBottom: index === group.items.length - 1 ? 'none' : '1px solid var(--border)',
                    cursor: item.action ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>{item.label}</span>
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
            padding: '18px', 
            borderRadius: '16px', 
            border: '2px solid #E53E3E', 
            color: '#E53E3E', 
            fontSize: '15px', 
            fontWeight: '800',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            background: 'white',
            marginTop: '40px',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={20} />
          Encerrar Sessão do Hub
        </button>

        {/* Footer Arkos assinado à direita */}
        <div style={{ 
          marginTop: '60px', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          opacity: 0.6
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
            Criando por
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32L20 8L32 32" stroke="#C4B08F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 21H36" stroke="#C4B08F" strokeWidth="4" strokeLinecap="round" />
              <circle cx="20" cy="6" r="3.5" fill="#C4B08F" />
            </svg>
            <span style={{ 
              color: '#C4B08F', 
              fontSize: '16px', 
              fontWeight: '900', 
              letterSpacing: '1px'
            }}>ARKOS</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MoreTab;
