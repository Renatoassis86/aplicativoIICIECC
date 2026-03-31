import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Camera, User, BadgeCheck, Shield, Award, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { ImagePersistenceService } from '../services/imagePersistence';

const ProfileView = ({ onClose, userName, userCpf, userType, userAvatar: initialAvatar, onAvatarUpdate }) => {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  
  // Profile settings
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // Member settings
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      // 1. Fetch profiles table
      const { data: profile } = await supabase.from('profiles').select('*').eq('cpf', userCpf).single();
      if (profile) {
        setBio(profile.bio || '');
        setJobTitle(profile.job_title || '');
        setLinkedinUrl(profile.linkedin_url || '');
      }
      
      // 2. Fetch members table
      const { data: member } = await supabase.from('members').select('*').eq('cpf', userCpf).single();
      if (member) {
        setPhone(member.phone || '');
        setInstitution(member.institution || '');
        setCity(member.city || '');
        setState(member.state || '');
        setEmail(member.email || '');
      }
    };
    fetchProfileData();
  }, [userCpf]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 1. Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ bio, job_title: jobTitle, linkedin_url: linkedinUrl })
        .eq('cpf', userCpf);
      if (profileError) throw profileError;
      
      // 2. Update members
      const { error: memberError } = await supabase
        .from('members')
        .update({ phone, institution, city, state, email })
        .eq('cpf', userCpf);
      if (memberError) throw memberError;
      
      alert('Seu perfil foi atualizado no banco de dados!');
    } catch (err) {
      console.error(err);
      alert('Erro ao sincronizar dados com o banco.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateAvatar = async () => {
    const photo = await ImagePersistenceService.capturePhoto();
    if (!photo) return;

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
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar foto permanentemente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed-modal-overlay" style={{ background: '#F7F8FA' }}>
      <header style={{ 
        padding: 'env(safe-area-inset-top, 24px) 20px 20px', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        background: 'white'
      }}>
         <button onClick={onClose} style={{ background: '#F7FAFC', border: 'none', padding: '10px', borderRadius: '50%', display: 'flex' }}>
           <X size={24} color="var(--secondary)" />
         </button>
         <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', color: 'var(--secondary)' }}>Meu Perfil CIECC</h2>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 60px' }}>
         {/* Avatar Header */}
         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div onClick={handleUpdateAvatar} style={{ 
                width: '110px', height: '110px', borderRadius: '32px', 
                background: '#F5F7FA', margin: '0 auto', position: 'relative',
                border: '4px solid var(--gold)', overflow: 'hidden', cursor: 'pointer',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
            }}>
               {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><User size={50} color="#CBD5E0" /></div>}
               <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px', backdropFilter: 'blur(4px)' }}>
                  <Camera size={16} color="white" style={{ margin: '0 auto' }} />
               </div>
            </div>
            <h3 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-serif)' }}>{userName}</h3>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Congressista Confirmado</p>
         </div>

         {/* Form Section */}
         <div style={{ display: 'grid', gap: '24px' }}>
            {/* Essential Info */}
            <section>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Dados Pessoais & Contato</h4>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Contato Whatsapp</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <Phone size={16} color="var(--primary)" />
                       <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" style={{ width: '100%', fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                    </div>
                 </div>
                 <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Email Institucional</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <Mail size={16} color="var(--primary)" />
                       <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" style={{ width: '100%', fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                    </div>
                 </div>
                 <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Localização (Cidade/Estado)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <MapPin size={16} color="var(--primary)" />
                       <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                          <input value={state} onChange={e => setState(e.target.value)} placeholder="UF" style={{ width: '40px', fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                       </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Professional Info */}
            <section>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Informações Profissionais</h4>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Instituição de Ensino / Empresa</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <Building2 size={16} color="var(--primary)" />
                       <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Ex: Universidade Arkanos" style={{ width: '100%', fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                    </div>
                 </div>
                 <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Cargo ou Ocupação</p>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Ex: Professor de Matemática" style={{ width: '100%', fontSize: '15px', fontWeight: '600', color: 'var(--secondary)', border: 'none' }} />
                 </div>
                 <div style={{ padding: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Sobre você (Bio)</p>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre você..." style={{ width: '100%', fontSize: '14px', fontWeight: '500', color: 'var(--secondary)', border: 'none', resize: 'none', minHeight: '80px' }} />
                 </div>
              </div>
            </section>

            <button onClick={handleSaveProfile} disabled={saving} style={{ 
               width: '100%', padding: '18px', borderRadius: '16px', background: 'var(--primary)', 
               color: 'white', fontWeight: '800', fontSize: '16px', border: 'none',
               boxShadow: '0 8px 24px rgba(107, 20, 26, 0.3)',
               opacity: saving ? 0.7 : 1
            }}>
               {saving ? 'Sincronizando com o Banco...' : 'Finalizar & Atualizar Cadastro'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProfileView;
