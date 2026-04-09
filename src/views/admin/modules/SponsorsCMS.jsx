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
    const { error } = await supabase.from('sponsors').insert([newSponsor]);
    if (!error) {
      setNewSponsor({ name: '', logo_url: '', website_url: '', tier: 'gold', order_index: sponsors.length });
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
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
        <h3 style={{ fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Plus size={24} color="var(--primary)" /> Adicionar Novo Patrocinador
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <input 
            placeholder="Nome da Empresa"
            value={newSponsor.name}
            onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
          />
          <select 
            value={newSponsor.tier}
            onChange={e => setNewSponsor({...newSponsor, tier: e.target.value})}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
          >
            <option value="diamond">Diamante</option>
            <option value="gold">Ouro</option>
            <option value="silver">Prata</option>
            <option value="bronze">Bronze</option>
          </select>
          <input 
            type="number"
            placeholder="Ordem"
            value={newSponsor.order_index}
            onChange={e => setNewSponsor({...newSponsor, order_index: parseInt(e.target.value)})}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <input 
            placeholder="URL do Logo (SVG ou PNG Transparente)"
            value={newSponsor.logo_url}
            onChange={e => setNewSponsor({...newSponsor, logo_url: e.target.value})}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
          />
          <input 
            placeholder="URL do Site"
            value={newSponsor.website_url}
            onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})}
            style={{ padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
          />
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
          <div key={sponsor.id} style={{ 
            background: 'white', padding: '20px', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #F1F5F9'
          }}>
            <div style={{ width: '80px', height: '80px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              {sponsor.logo_url ? (
                <img src={sponsor.logo_url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={32} color="#CBD5E1" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <input 
                value={sponsor.name}
                onChange={e => updateSponsor(sponsor.id, 'name', e.target.value)}
                style={{ fontSize: '16px', fontWeight: '800', border: 'none', background: 'none', width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                 <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', background: '#FDF2F2', padding: '2px 8px', borderRadius: '6px' }}>
                    {sponsor.tier}
                 </span>
                 <a href={sponsor.website_url} target="_blank" style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <ExternalLink size={10} /> {sponsor.website_url || 'Nenhum link'}
                 </a>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(sponsor.id)}
              style={{ padding: '10px', borderRadius: '10px', background: '#FEE2E2', color: '#991B1B', border: 'none' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
