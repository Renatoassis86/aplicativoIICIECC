import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Camera, User, BadgeCheck, Shield, Award, Building2 } from 'lucide-react';
import { ImagePersistenceService } from '../services/imagePersistence';

const ProfileView = ({ onClose, userName, userCpf, userType, userAvatar: initialAvatar, onAvatarUpdate }) => {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  
  const handleUpdateAvatar = async () => {
    const photo = await ImagePersistenceService.capturePhoto();
    if (!photo) return;

    // Preview instantâneo para UX
    setAvatar(photo.webPath);
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
      console.log("[ProfileView] Foto persistida com sucesso.");
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar foto permanentemente.');
    } finally {
      setUploading(false);
    }
  };

  const formatUserType = (type) => {
    if (!type || typeof type !== 'string') return 'Congressista';
    if (type === 'admin') return 'Organizador';
    if (type === 'staff') return 'Staff';
    if (type.includes('patrocinador')) return 'Patrocinador';
    if (type === 'palestrante') return 'Palestrante';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getRoleIcon = () => {
    if (userType === 'admin' || userType === 'staff') return <Shield size={18} color="var(--primary)" />;
    if (userType?.includes('patrocinador')) return <Award size={18} color="var(--gold)" />;
    return <BadgeCheck size={18} color="#3182CE" />;
  };

  return (
    <div className="fixed-modal-overlay" style={{ 
      zIndex: 10000, 
      background: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100dvh'
    }}>
      {/* Header */}
      <header style={{ 
        padding: 'env(safe-area-inset-top, 24px) 20px 20px', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px' 
      }}>
         <button 
           onClick={onClose}
           style={{ background: '#F7FAFC', border: 'none', padding: '10px', borderRadius: '50%', display: 'flex' }}
         >
           <X size={24} color="var(--secondary)" />
         </button>
         <h2 style={{ 
           fontFamily: 'var(--font-serif)', 
           fontSize: '20px', 
           fontWeight: '800', 
           color: 'var(--secondary)' 
         }}>
           Meu Perfil
         </h2>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px' }}>
         {/* Avatar Section */}
         <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div 
              onClick={handleUpdateAvatar}
              style={{ 
               width: '128px', height: '128px', borderRadius: '40px', 
               background: '#F5F7FA', margin: '0 auto', position: 'relative',
               border: '4px solid var(--gold)', overflow: 'hidden', cursor: 'pointer',
               boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
               {avatar ? (
                  <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
               ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                     <User size={60} color="#CBD5E0" />
                  </div>
               )}
               
               <div style={{ 
                 position: 'absolute', bottom: 0, left: 0, right: 0, 
                 background: 'rgba(0,0,0,0.6)', padding: '8px',
                 backdropFilter: 'blur(4px)'
               }}>
                  <Camera size={20} color="white" style={{ margin: '0 auto' }} />
               </div>

               {uploading && (
                  <div style={{ 
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <div className="pulse" style={{ width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                  </div>
               )}
            </div>
            <h3 style={{ marginTop: '20px', fontSize: '22px', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-serif)' }}>
              {userName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
               {getRoleIcon()}
               <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 {formatUserType(userType)}
               </span>
            </div>
         </div>

         {/* Info Cards */}
         <div style={{ display: 'grid', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
               <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>CPF de Acesso</label>
               <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)', marginTop: '6px' }}>{userCpf}</p>
            </div>

            <div className="card" style={{ padding: '20px', border: '1px solid var(--border)' }}>
               <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Credencial Digital</label>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                  <div style={{ background: '#F0FFF4', padding: '8px', borderRadius: '8px' }}>
                    <BadgeCheck size={20} color="#38A169" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#2F855A' }}>Inscrição Ativa</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Válida para os dias 01 e 02 de maio.</p>
                  </div>
               </div>
            </div>

            <div className="card" style={{ padding: '20px', border: '1px solid var(--border)', background: 'var(--accent)' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <Building2 size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>Sua Jornada Clássica</p>
                    <p style={{ fontSize: '12px', color: 'var(--primary)', opacity: 0.8, marginTop: '4px', lineHeight: '1.4' }}>
                      Suas preferências e favoritos estão sendo sincronizados com seu CPF para uma experiência personalizada no II CIECC.
                    </p>
                  </div>
               </div>
            </div>
         </div>

         <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}>
              Versão do App: 2.0.26-ALPHA <br/>
              ID de Instalação: {userCpf?.slice(0,4)}-XXXX
            </p>
         </div>
      </div>
    </div>
  );
};

export default ProfileView;
