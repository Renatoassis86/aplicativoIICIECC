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
    order_index: 0
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
      setNewSponsor({ name: '', logo_url: '', website_url: '', tier: 'gold', order_index: sponsors.length });
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Nome da Empresa</label>
            <input 
              placeholder="Ex: Empresa Ltda"
              value={newSponsor.name}
              onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#000000', background: '#FFFFFF', fontWeight: '600' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Tipo de Cota</label>
            <select 
              value={newSponsor.tier}
              onChange={e => setNewSponsor({...newSponsor, tier: e.target.value})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#000000', fontWeight: '800' }}
            >
              <option value="gold">Cota Ouro</option>
              <option value="silver">Cota Prata</option>
              <option value="bronze">Cota Bronze</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Ordem (Rank)</label>
            <input 
              type="number"
              placeholder="0"
              value={newSponsor.order_index}
              onChange={e => setNewSponsor({...newSponsor, order_index: parseInt(e.target.value)})}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#000000', background: '#FFFFFF', fontWeight: '800' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B' }}>Logo da Empresa</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#1E293B' }}>
                    <input type="radio" checked={photoSource === 'link'} onChange={() => setPhotoSource('link')} /> Link Externo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#1E293B' }}>
                    <input type="radio" checked={photoSource === 'upload'} onChange={() => setPhotoSource('upload')} /> Upload PC
                </label>
            </div>
            
            {photoSource === 'link' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input 
                    placeholder="URL do Logo"
                    value={newSponsor.logo_url}
                    onChange={e => setNewSponsor({...newSponsor, logo_url: e.target.value})}
                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#1E293B', background: 'white' }}
                  />
                  <input 
                    placeholder="URL do Site"
                    value={newSponsor.website_url}
                    onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})}
                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#1E293B', background: 'white' }}
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

      <div style={{ display: 'grid', gap: '16px' }}>
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="white-bg" style={{ 
            backgroundColor: 'white', padding: '24px', borderRadius: '24px', 
            display: 'flex', alignItems: 'center', gap: '24px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' 
          }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', minWidth: '80px' }}>
              {sponsor.logo_url ? (
                <img src={sponsor.logo_url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={32} color="#CBD5E1" />
              )}
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 0.5fr', gap: '16px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Nome</label>
                <input 
                  value={sponsor.name}
                  onChange={e => updateSponsor(sponsor.id, 'name', e.target.value)}
                  style={{ fontSize: '15px', fontWeight: '800', border: '1px solid transparent', borderBottom: '1px solid #E2E8F0', background: 'none', width: '100%', color: '#1E293B', padding: '4px 0' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Cota</label>
                <select 
                  value={sponsor.tier}
                  onChange={e => updateSponsor(sponsor.id, 'tier', e.target.value)}
                  style={{ 
                    width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', 
                    fontSize: '11px', fontWeight: '900', textTransform: 'uppercase',
                    color: sponsor.tier === 'gold' ? '#B45309' : sponsor.tier === 'silver' ? '#4B5563' : '#78350F', 
                    background: sponsor.tier === 'gold' ? '#FEF3C7' : sponsor.tier === 'silver' ? '#F3F4F6' : '#FFEDD5',
                  }}
                >
                  <option value="gold">Cota Ouro</option>
                  <option value="silver">Cota Prata</option>
                  <option value="bronze">Cota Bronze</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Link do Site</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    value={sponsor.website_url || ''}
                    placeholder="Sem link"
                    onChange={e => updateSponsor(sponsor.id, 'website_url', e.target.value)}
                    style={{ fontSize: '12px', border: '1px solid transparent', borderBottom: '1px solid #E2E8F0', background: 'none', width: '100%', color: '#64748B', padding: '4px 0' }}
                  />
                  <a href={sponsor.website_url} target="_blank" style={{ color: '#94A3B8' }}><ExternalLink size={14} /></a>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Ordem</label>
                <input 
                  type="number"
                  value={sponsor.order_index}
                  onChange={e => updateSponsor(sponsor.id, 'order_index', parseInt(e.target.value))}
                  style={{ fontSize: '13px', fontWeight: '800', border: '1px solid #E2E8F0', borderRadius: '6px', background: '#F8FAFC', width: '100%', color: '#1E293B', textAlign: 'center', padding: '4px' }}
                />
              </div>
            </div>

            <button 
              onClick={() => handleDelete(sponsor.id)}
              style={{ padding: '12px', borderRadius: '12px', background: '#FFF1F2', color: '#E11D48', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#FFE4E6'}
              onMouseOut={e => e.currentTarget.style.background = '#FFF1F2'}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
