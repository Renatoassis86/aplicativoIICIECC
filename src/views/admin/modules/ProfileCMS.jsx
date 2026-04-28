import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Shield, 
  Save, 
  Camera,
  Key,
  Database,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

export default function ProfileCMS({ userCpf }) {
  const [profile, setProfile] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    job_title: '',
    linkedin_url: '',
    current_password: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [userCpf]);

  const fetchProfileData = async () => {
    if (!userCpf || userCpf === 'ADMIN-URL') {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
        const { data: memberData } = await supabase.from('members').select('*').eq('cpf', userCpf).single();
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', userCpf).single();
        
        if (memberData) setMember(memberData);
        if (profileData) {
            setProfile(profileData);
            setFormData({
                name: memberData?.name || '',
                email: memberData?.email || '',
                phone: memberData?.phone || '',
                bio: profileData.bio || '',
                job_title: profileData.job_title || '',
                linkedin_url: profileData.linkedin_url || '',
                current_password: profileData.current_password || ''
            });
        }
    } catch (err) {
        console.error('Erro ao carregar perfil:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        // Atualizar Members
        await supabase.from('members').update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        }).eq('cpf', userCpf);

        // Atualizar Profiles
        await supabase.from('profiles').update({
            bio: formData.bio,
            job_title: formData.job_title,
            linkedin_url: formData.linkedin_url,
            current_password: formData.current_password
        }).eq('user_id', userCpf);

        setSuccessMsg('Configurações de perfil salvas com sucesso!');
        setShowSuccess(true);
        fetchProfileData();
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
    }
    setSaving(false);
  };

  if (userCpf === 'ADMIN-URL') {
      return (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <Shield size={48} color="var(--brand)" style={{ marginBottom: '20px' }} />
              <h2 style={{ color: 'white', fontWeight: '800' }}>Acesso via URL Direta</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Você está usando um modo administrativo global. Para configurar dados de perfil individual, faça o login normal com seu CPF.</p>
          </div>
      );
  }

  if (loading) return <div style={{ color: 'var(--gold)', fontWeight: '800', textAlign: 'center', padding: '100px' }}>Carregando dados da conta...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--brand), #FFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--border-color)' }}>
              <User size={40} color="#000" />
          </div>
          <div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>Configurações de Perfil</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--brand)', textTransform: 'uppercase', background: 'rgba(212,193,156,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{profile?.user_type}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{userCpf}</span>
              </div>
          </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                  <label style={labelStyle}>Nome Completo</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(0,0,0,0.3)' }} />
                    <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
              </div>
              <div>
                  <label style={labelStyle}>E-mail de Contato</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(0,0,0,0.3)' }} />
                    <input style={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                  <label style={labelStyle}>Telefone / WhatsApp</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(0,0,0,0.3)' }} />
                    <input style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
              </div>
              <div>
                  <label style={labelStyle}>Cargo / Instituição</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(0,0,0,0.3)' }} />
                    <input style={inputStyle} value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} />
                  </div>
              </div>
          </div>

          <div>
              <label style={labelStyle}>Biografia Curta</label>
              <textarea style={{ ...inputStyle, minHeight: '100px' }} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
              <h3 style={{ color: 'white', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Key size={20} color="var(--brand)" /> Segurança da Conta
              </h3>
              <div>
                  <label style={labelStyle}>Senha de Acesso</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'rgba(0,0,0,0.3)', zIndex: 1 }} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      style={inputStyle} 
                      value={formData.current_password} 
                      onChange={e => setFormData({...formData, current_password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.3)', zIndex: 1 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Sua senha é utilizada para fazer login no Hub pelo aplicativo e pelo console admin.</p>
              </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ 
                width: '100%', 
                padding: '18px', 
                borderRadius: '16px', 
                background: 'var(--brand)', 
                color: '#000', 
                fontWeight: '900', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                marginTop: '10px'
            }}
          >
            {saving ? 'SALVANDO...' : <><Save size={20} /> ATUALIZAR MEUS DADOS</>}
          </button>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '16px 18px 16px 48px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '15px', outline: 'none', color: '#000', backgroundColor: '#FFF', fontWeight: '700' };
const Briefcase = ({ size, style }) => <User size={size} style={style} />; // Fallback icon
