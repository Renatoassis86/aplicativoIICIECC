import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Camera, User, BadgeCheck, Shield, Award, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { ImagePersistenceService } from '../services/imagePersistence';

const ProfileView = ({ onClose, userName, userCpf, userType, userAvatar: initialAvatar, onAvatarUpdate }) => {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
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
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userCpf).single();
      if (profile) {
        setBio(profile.bio || '');
        setJobTitle(profile.job_title || '');
        setLinkedinUrl(profile.linkedin_url || '');
      }
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
      await supabase.from('profiles').update({ bio, job_title: jobTitle, linkedin_url: linkedinUrl }).eq('user_id', userCpf);
      await supabase.from('members').update({ phone, institution, city, state, email }).eq('cpf', userCpf);
      alert('Seu perfil foi atualizado no banco de dados!');
    } catch (err) {
      console.error(err);
      alert('Erro ao sincronizar dados.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateAvatar = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
         setAvatar(reader.result);
         const fileName = `avatars/${userCpf}_${Date.now()}.jpg`;
         const publicUrlOrBase64 = await ImagePersistenceService.uploadToStorage('profiles', fileName, file);
         await supabase.from('profiles').update({ avatar_url: publicUrlOrBase64 }).eq('user_id', userCpf);
         if (onAvatarUpdate) onAvatarUpdate(publicUrlOrBase64);
         setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" capture="user" style={{ display: 'none' }} />
      <div style={{ background: '#F7F8FA' }}>
        <header style={{ 
          padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
          background: 'var(--primary)', 
          color: 'white',
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
           <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowLeft size={24} color="white" />
           </button>
           <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', flex: 1 }}>Meu Perfil</h2>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px' }}>
           <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div onClick={handleUpdateAvatar} className="clickable" style={{ 
                  width: '110px', height: '110px', borderRadius: '32px', 
                  background: '#F5F7FA', margin: '0 auto', position: 'relative',
                  border: '4px solid var(--gold)', overflow: 'hidden',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
              }}>
                 {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><User size={50} color="#CBD5E0" /></div>}
                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '6px' }}>
                    <Camera size={16} color="white" style={{ margin: '0 auto' }} />
                 </div>
              </div>
              <h3 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-serif)' }}>{userName}</h3>
           </div>

           <div style={{ display: 'grid', gap: '24px' }}>
              <section>
                <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Dados de Contato</h4>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                   <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Whatsapp</p>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" style={{ width: '100%', fontSize: '15px', fontWeight: '600', border: 'none', background: 'transparent' }} />
                   </div>
                   <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Email</p>
                      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" style={{ width: '100%', fontSize: '15px', fontWeight: '600', border: 'none', background: 'transparent' }} />
                   </div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>Profissional</h4>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                   <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Instituição</p>
                      <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Sua escola / faculdade" style={{ width: '100%', fontSize: '15px', fontWeight: '600', border: 'none', background: 'transparent' }} />
                   </div>
                   <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Cargo</p>
                      <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Ex: Professor" style={{ width: '100%', fontSize: '15px', fontWeight: '600', border: 'none', background: 'transparent' }} />
                   </div>
                </div>
              </section>

              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary" style={{ marginTop: '12px' }}>
                 {saving ? 'Sincronizando...' : 'Salvar Alterações'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
