import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  ExternalLink,
  Loader2,
  Award
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function SponsorsCMS() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSource, setPhotoSource] = useState('link'); // 'link' ou 'upload'
  const [uploadFile, setUploadFile] = useState(null);
  
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    tier: 'gold',
    order_index: 0,
    tagline: '',
    bio: '',
    booth: ''
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sponsors')
      .select('*')
      .order('order_index', { ascending: true });
    if (data) setSponsors(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSponsor.name) return;
    setSaving(true);
    
    let finalLogoUrl = newSponsor.logo_url;

    if (photoSource === 'upload' && uploadFile) {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('sponsors')
        .upload(fileName, uploadFile);
      
      if (!error) {
        const { data: urlData } = supabase.storage.from('sponsors').getPublicUrl(fileName);
        finalLogoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('sponsors').insert([{ ...newSponsor, logo_url: finalLogoUrl }]);
    if (!error) {
      setNewSponsor({ name: '', logo_url: '', website_url: '', tier: 'gold', order_index: sponsors.length, tagline: '', bio: '', booth: '' });
      setUploadFile(null);
      fetchSponsors();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este patrocinador?')) return;
    await supabase.from('sponsors').delete().eq('id', id);
    fetchSponsors();
  };

  const updateSponsor = async (id, field, value) => {
    const { error } = await supabase.from('sponsors').update({ [field]: value }).eq('id', id);
    if (!error) {
      setSponsors(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="sponsors-cms-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ maxWidth: '1000px' }}>
        <h3 style={{ fontWeight: '900', color: '#FFFFFF', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px' }}>
          <Plus size={28} color="var(--gold)" /> Adicionar Novo Patrocinador
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.5fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Nome da Empresa</label>
            <input 
              placeholder="Ex: Empresa Ltda"
              value={newSponsor.name}
              onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)', fontWeight: '600', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Tagline (Frase Curta)</label>
            <input 
              placeholder="Ex: Líder em tecnologia"
              value={newSponsor.tagline}
              onChange={e => setNewSponsor({...newSponsor, tagline: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#000000', background: '#FFFFFF', fontWeight: '600' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Tipo de Cota</label>
            <select 
              value={newSponsor.tier}
              onChange={e => setNewSponsor({...newSponsor, tier: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', fontWeight: '800', outline: 'none' }}
            >
              <option value="diamond">Master & Diamante</option>
              <option value="gold">Cota Ouro</option>
              <option value="silver">Cota Prata</option>
              <option value="bronze">Cota Bronze</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Ordem</label>
            <input 
              type="number"
              placeholder="0"
              value={newSponsor.order_index}
              onChange={e => setNewSponsor({...newSponsor, order_index: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#000000', background: '#FFFFFF', fontWeight: '800' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Biografia / Descrição Longa</label>
            <textarea 
              placeholder="Conte mais sobre a empresa..."
              value={newSponsor.bio}
              onChange={e => setNewSponsor({...newSponsor, bio: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)', minHeight: '100px', resize: 'none', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Estande (Local)</label>
            <input 
              placeholder="Ex: Pavilhão Sul"
              value={newSponsor.booth}
              onChange={e => setNewSponsor({...newSponsor, booth: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#000000', background: '#FFFFFF', fontWeight: '600' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B' }}>Logo e Website</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#FFFFFF' }}>
                    <input type="radio" checked={photoSource === 'link'} onChange={() => setPhotoSource('link')} /> Link Externo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#FFFFFF' }}>
                    <input type="radio" checked={photoSource === 'upload'} onChange={() => setPhotoSource('upload')} /> Upload PC
                </label>
            </div>
            
            {photoSource === 'link' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input 
                    placeholder="URL do Logo"
                    value={newSponsor.logo_url}
                    onChange={e => setNewSponsor({...newSponsor, logo_url: e.target.value})}
                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)', outline: 'none' }}
                  />
                  <input 
                    placeholder="URL do Site"
                    value={newSponsor.website_url}
                    onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})}
                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)', outline: 'none' }}
                  />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ border: '2px dashed #CBD5E1', padding: '14px', borderRadius: '12px', textAlign: 'center', background: 'white' }}>
                        <input type="file" id="sponsor-logo" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} style={{ display: 'none' }} />
                        <label htmlFor="sponsor-logo" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <ImageIcon size={20} color="#64748B" />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>{uploadFile ? uploadFile.name : 'Selecionar Logo no PC'}</span>
                        </label>
                    </div>
                    <input 
                        placeholder="URL do Site"
                        value={newSponsor.website_url}
                        onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})}
                        style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#1E293B', background: 'white' }}
                    />
                </div>
            )}
         </div>

        <button 
          onClick={handleAdd}
          disabled={saving}
          style={{ 
            width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--primary)', 
            color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> SALVAR PATROCINADOR</>}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <h4 style={{ fontWeight: '800', fontSize: '18px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          Patrocinadores Ativos
        </h4>
        {sponsors.map(sponsor => (
          <div key={sponsor.id} style={{ 
            background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', 
            display: 'flex', flexDirection: 'column', gap: '20px', 
            border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', flexWrap: 'wrap' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid var(--border-color)', position: 'relative' }}>
                {sponsor.logo_url ? (
                  <img src={sponsor.logo_url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <ImageIcon size={24} color="#64748B" />
                )}
                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--gold)', color: '#000', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', border: '2px solid #000' }}>
                  {sponsor.order_index}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h5 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>{sponsor.name}</h5>
                  <span style={{ fontSize: '10px', fontWeight: '900', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{sponsor.tier}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={12} /> {sponsor.website_url || 'Nenhum site cadastrado'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                  onClick={() => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, isEditing: !s.isEditing } : s))}
                  style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {sponsor.isEditing ? 'Fechar Edição' : 'Editar Patrocinador'}
                </button>
                <button 
                  onClick={() => handleDelete(sponsor.id)}
                  style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#E11D48', border: '1px solid rgba(225, 29, 72, 0.2)', padding: '10px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={16} /> Excluir
                </button>
              </div>
            </div>

            {sponsor.isEditing && (
              <div style={{ marginTop: '10px', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Nome Fantasia</label>
                    <input 
                      value={sponsor.name}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, name: e.target.value } : s))}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', color: '#000', fontWeight: '700' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Valor da Cota</label>
                    <select 
                      value={sponsor.tier}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, tier: e.target.value } : s))}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', color: '#000', fontWeight: '700' }}
                    >
                      <option value="diamond">Master & Diamante</option>
                      <option value="gold">Cota Ouro</option>
                      <option value="silver">Cota Prata</option>
                      <option value="bronze">Cota Bronze</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Ordem de Exibição</label>
                    <input 
                      type="number"
                      value={sponsor.order_index}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, order_index: parseInt(e.target.value) } : s))}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', color: '#000', fontWeight: '700' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>URL do Logo</label>
                    <input 
                      value={sponsor.logo_url || ''}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, logo_url: e.target.value } : s))}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', color: '#000' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Link do Site</label>
                    <input 
                      value={sponsor.website_url || ''}
                      onChange={e => setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, website_url: e.target.value } : s))}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#fff', color: '#000' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    disabled={saving}
                    onClick={async () => {
                       setSaving(true);
                       const { isEditing, ...dataToSave } = sponsor;
                       const { error } = await supabase.from('sponsors').update(dataToSave).eq('id', sponsor.id);
                       if (!error) {
                         alert('Patrocinador atualizado!');
                         setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, isEditing: false } : s));
                       } else alert('Erro: ' + error.message);
                       setSaving(false);
                    }}
                    className="btn-primary"
                    style={{ padding: '12px 32px' }}
                  >
                    <Save size={18} /> ATUALIZAR DADOS
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {sponsors.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>Nenhum patrocinador encontrado.</p>}
      </div>
    </div>
  );
}
