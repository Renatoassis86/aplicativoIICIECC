import React, { useState, useRef } from 'react';
import { ImagePersistenceService } from '../../services/imagePersistence';
import { supabase } from '../../lib/supabase';
import { 
  HelpCircle, User, MapPin, QrCode, Settings, Phone, LogOut, ChevronRight, 
  Ticket, BookOpen, BellRing, Users, Star, Briefcase, Monitor, Camera
} from 'lucide-react';

const MoreTab = ({ 
  onLogout, userName, userType, userAvatar, userCpf,
  onOpenScanner, onOpenBroadcast, onOpenAdminPortal, onNavigate,
  onOpenFAQ, onOpenSponsors, onOpenMap, onOpenTicket, onOpenProfile, onOpenGTs, onAvatarUpdate
}) => {
  const [localAvatar, setLocalAvatar] = useState(userAvatar);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const firstName = userName ? userName.split(' ')[0] : 'Congressista';
  const initial = (userName && typeof userName === 'string') ? userName.charAt(0) : 'C';

  const handleUpdateAvatar = async (e) => {
    e.stopPropagation();
    // Prefer input-based fallback for better Safari compatibility
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
         setLocalAvatar(reader.result);
         const fileName = `avatars/${userCpf}_${Date.now()}.jpg`;
         const publicUrl = await ImagePersistenceService.uploadToStorage('profiles', fileName, file);
         await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('cpf', userCpf);
         if (onAvatarUpdate) onAvatarUpdate(publicUrl);
         setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'staff') return 'Equipe Staff';
    if (type === 'admin') return 'Administrador';
    if (type === 'organizador') return 'Organização Oficial';
    if (type === 'patrocinador_ouro') return 'Patrocinador Ouro';
    if (type === 'patrocinador_prata') return 'Patrocinador Prata';
    if (type === 'patrocinador_bronze') return 'Patrocinador Bronze';
    if (type?.includes('patrocinador')) return 'Parceiro Patrocinador';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const menuGroups = [
    {
      title: 'Configurações do Perfil',
      items: [
        { label: 'Meu Perfil / Dados', icon: <User size={18} color="var(--primary)" />, action: onOpenProfile },
        // { label: 'Meus Tickets', icon: <Ticket size={18} color="#D69E2E" />, action: onOpenTicket },
        { label: 'Minha Agenda', icon: <BookOpen size={18} color="#2B6CB0" />, action: () => onNavigate('agenda') },
      ]
    },
    {
      title: 'Informações do Evento',
      items: [
        { label: 'Network de Participantes', icon: <Users size={18} color="#48BB78" />, action: () => onNavigate('network') },
        { label: 'FAQ (Perguntas Frequentes)', icon: <HelpCircle size={18} color="#38A169" />, action: onOpenFAQ },
        { label: 'Palestrantes', icon: <Star size={18} color="#805AD5" />, action: () => onNavigate('speakers') },
        { label: 'Revista e Grupos de Trabalho', icon: <BookOpen size={18} color="var(--primary)" />, action: onOpenGTs },
        { label: 'Patrocinadores & Parceiros', icon: <Briefcase size={18} color="var(--primary)" />, action: onOpenSponsors },
        { label: 'Mapa / Localização', icon: <MapPin size={18} color="#E53E3E" />, action: onOpenMap },
      ]
    },
    {
      title: 'Suporte & Gestão',
      items: [
        ...(userType === 'staff' || userType === 'admin' || userType === 'organizador' || userType?.includes('patrocinador') ? [
          { label: 'Scanner QR Code', icon: <QrCode size={18} color="#111" />, action: onOpenScanner },
          { label: 'Notificação em Massa', icon: <BellRing size={18} color="#D69E2E" />, action: onOpenBroadcast },
        ] : []),
        { 
          label: 'Suporte via WhatsApp', 
          icon: <Phone size={18} color="#3182CE" />, 
          action: () => window.open('https://wa.me/558393322457', '_blank')
        },
      ]
    }
  ];

  return (
    <div className="tab-layout fade-in">
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" capture="user" style={{ display: 'none' }} />
      
      {/* Profile Header */}
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
        background: 'var(--primary)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        borderBottom: '4px solid var(--gold)'
      }}>
        <div onClick={handleUpdateAvatar} className="clickable" style={{ position: 'relative' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', 
            border: '3px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            {(localAvatar || userAvatar) ? <img src={localAvatar || userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="pulse" style={{ width: '10px', height: '10px', background: 'var(--gold)', borderRadius: '50%' }}></div></div>}
          </div>
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--gold)', borderRadius: '50%', padding: '6px', border: '2px solid var(--secondary)' }}><Camera size={12} color="var(--secondary)" /></div>
        </div>

        <div onClick={onOpenProfile} className="clickable" style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>{userName || 'Visitante'}</h2>
          <p style={{ fontSize: '11px', opacity: 0.7, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{formatUserType(userType)}</p>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
        {menuGroups.map(group => (
          <div key={group.title} style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', paddingLeft: '4px' }}>{group.title}</h4>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {group.items.map((item, index) => (
                <div key={index} onClick={item.action} className="clickable" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px', borderBottom: index === group.items.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '12px' }}>{item.icon}</div>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>{item.label}</span>
                  </div>
                  <ChevronRight size={18} color="#CBD5E0" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={onLogout} className="clickable" style={{ width: '100%', padding: '18px', borderRadius: '16px', border: '2px solid #E53E3E', color: '#E53E3E', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'white' }}>
          <LogOut size={20} /> Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default MoreTab;
