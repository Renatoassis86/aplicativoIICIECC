import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  ExternalLink,
  Loader2,
  Award,
  X,
  Edit2
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

export default function SponsorsCMS() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSource, setPhotoSource] = useState('link'); // 'link' ou 'upload'
  const [uploadFile, setUploadFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [layoutMode, setLayoutMode] = useState('grid');
  
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    tier: 'ouro',
    display_order: 0,
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
      .order('display_order', { ascending: true });
    if (data) setSponsors(data);
    setLoading(false);
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
  };

  const handleSave = async (sponsorData, id = null) => {
    setSaving(true);
    try {
        let finalLogoUrl = sponsorData.logo_url;

        if (photoSource === 'upload' && uploadFile) {
            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('sponsors')
                .upload(fileName, uploadFile);
            
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('sponsors').getPublicUrl(fileName);
            finalLogoUrl = urlData.publicUrl;
        }

        const dataToSave = { 
            name: sponsorData.name,
            logo_url: finalLogoUrl,
            website_url: sponsorData.website_url,
            tier: sponsorData.tier,
            display_order: sponsorData.display_order,
            tagline: sponsorData.tagline,
            bio: sponsorData.bio,
            booth: sponsorData.booth,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('sponsors').upsert({
            id: id || undefined,
            ...dataToSave
        });

        if (error) throw error;

        setNewSponsor({ name: '', logo_url: '', website_url: '', tier: 'ouro', display_order: sponsors.length + 1, tagline: '', bio: '', booth: '' });
        setUploadFile(null);
        setIsEditing(false);
        setEditingId(null);
        fetchSponsors();
        triggerSuccess(editingId ? 'Dados empresariais atualizados!' : 'Novo parceiro integrado com sucesso!');
    } catch (err) {
        alert('Erro ao salvar: ' + err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este patrocinador permanentemente?')) return;
    setSaving(true);
    try {
        const { error } = await supabase.from('sponsors').delete().eq('id', id);
        if (error) throw error;
        fetchSponsors();
        triggerSuccess('Parceiro removido do sistema.');
    } catch (err) {
        alert('Erro ao excluir: ' + err.message);
    }
    setSaving(false);
  };


  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--gold)', fontWeight: '800' }}>Sincronizando Rede de Parceiros...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '40px' }}>
      {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

      <div 
        key={editingId || 'new'}
        style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)' }}
      >
        <h3 style={{ fontWeight: '900', color: '#FFFFFF', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '24px' }}>
          {isEditing ? <Edit2 size={28} color="var(--brand)" /> : <Plus size={28} color="var(--brand)" />} 
          {isEditing ? 'Editar Patrocinador' : 'Novo Expositor / Patrocinador'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Nome da Empresa</label>
            <input 
              placeholder="Ex: Empresa Ltda"
              value={newSponsor.name}
              onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tipo de Cota</label>
            <select 
              value={newSponsor.tier}
              onChange={e => setNewSponsor({...newSponsor, tier: e.target.value})}
              style={inputStyle}
            >
              <option value="diamond">Cota Diamante</option>
              <option value="ouro">Cota Ouro</option>
              <option value="prata">Cota Prata</option>
              <option value="bronze">Cota Bronze</option>
              <option value="organizador">Organizador</option>
              <option value="apoio">Apoio Institucional</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ordem</label>
            <input 
              type="number"
              value={newSponsor.display_order}
              onChange={e => setNewSponsor({...newSponsor, display_order: parseInt(e.target.value)})}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Biografia / Descrição da Empresa</label>
            <textarea 
              placeholder="Texto institucional..."
              value={newSponsor.bio}
              onChange={e => setNewSponsor({...newSponsor, bio: e.target.value})}
              style={{ ...inputStyle, minHeight: '120px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div>
                <label style={labelStyle}>Tagline</label>
                <input placeholder="Slogan curto" value={newSponsor.tagline} onChange={e => setNewSponsor({...newSponsor, tagline: e.target.value})} style={inputStyle} />
             </div>
             <div>
                <label style={labelStyle}>Estande</label>
                <input placeholder="Ex: A-42" value={newSponsor.booth} onChange={e => setNewSponsor({...newSponsor, booth: e.target.value})} style={inputStyle} />
             </div>
          </div>
        </div>

        <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <label style={labelStyle}>Logo e Presença Digital</label>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', color: photoSource === 'link' ? 'var(--gold)' : 'white' }}>
                    <input type="radio" checked={photoSource === 'link'} onChange={() => setPhotoSource('link')} /> Link Externo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', color: photoSource === 'upload' ? 'var(--gold)' : 'white' }}>
                    <input type="radio" checked={photoSource === 'upload'} onChange={() => setPhotoSource('upload')} /> Upload Logo
                </label>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {photoSource === 'link' ? (
                    <input placeholder="URL da Logo (https://...)" value={newSponsor.logo_url} onChange={e => setNewSponsor({...newSponsor, logo_url: e.target.value})} style={inputStyle} />
                ) : (
                    <div style={{ border: '2px dashed var(--border-color)', borderRadius: '14px', background: uploadFile ? 'rgba(34, 197, 94, 0.1)' : 'transparent' }}>
                        <input type="file" id="sponsor-logo" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} style={{ display: 'none' }} />
                        <label htmlFor="sponsor-logo" style={{ cursor: 'pointer', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '100%' }}>
                            <ImageIcon size={20} color={uploadFile ? '#22C55E' : 'var(--gold)'} />
                            <span style={{ fontSize: '13px', fontWeight: '800' }}>{uploadFile ? uploadFile.name : 'Selecionar Arquivo'}</span>
                        </label>
                    </div>
                )}
                <input placeholder="URL do Site Oficial" value={newSponsor.website_url} onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})} style={inputStyle} />
            </div>
         </div>

        <button 
          onClick={() => handleSave(newSponsor, editingId)}
          disabled={saving}
          style={btnSaveStyle}
        >
          {saving ? 'PROCESSANDO...' : <><Save size={20} /> {isEditing ? 'SALVAR ALTERAÇÕES' : 'INTEGRAR PARCEIRO NO FRONTEND'}</>}
        </button>

        {isEditing && (
            <button 
                onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setNewSponsor({ name: '', logo_url: '', website_url: '', tier: 'ouro', display_order: sponsors.length + 1, tagline: '', bio: '', booth: '' });
                }}
                style={{ width: '100%', marginTop: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontWeight: '800', cursor: 'pointer' }}
            >
                CANCELAR EDIÇÃO
            </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: '900', fontSize: '20px', color: 'white', letterSpacing: '1px' }}>REDE ATIVA (II CIECC 2026)</h4>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border-color)' }}>
                <button onClick={() => setLayoutMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: layoutMode === 'grid' ? 'var(--brand)' : 'transparent', color: layoutMode === 'grid' ? 'black' : 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '900' }}>QUADROS</button>
                <button onClick={() => setLayoutMode('list')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: layoutMode === 'list' ? 'var(--brand)' : 'transparent', color: layoutMode === 'list' ? 'black' : 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '900' }}>LISTA</button>
            </div>
        </div>
        
        <div style={{ 
            display: layoutMode === 'grid' ? 'grid' : 'flex',
            flexDirection: layoutMode === 'grid' ? 'none' : 'column',
            gridTemplateColumns: layoutMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'none', 
            gap: '16px' 
        }}>
            {sponsors.map(sponsor => (
            <div key={sponsor.id} style={{ 
                ...cardStyle, 
                padding: layoutMode === 'grid' ? '28px' : '16px 24px',
                display: layoutMode === 'grid' ? 'block' : 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    display: 'flex', 
                    flex: 1,
                    minWidth: 0, // CRITICAL: Permite que o flex child encolha
                    flexDirection: layoutMode === 'grid' ? 'column' : 'row',
                    gap: layoutMode === 'grid' ? '16px' : '20px', 
                    alignItems: layoutMode === 'grid' ? 'flex-start' : 'center',
                    marginBottom: layoutMode === 'grid' ? '24px' : '0'
                }}>
                    <div style={{ 
                        width: layoutMode === 'grid' ? '70px' : '44px', 
                        height: layoutMode === 'grid' ? '70px' : '44px', 
                        minWidth: layoutMode === 'grid' ? '70px' : '44px',
                        background: 'white', borderRadius: '16px', padding: '10px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}>
                        <img src={sponsor.logo_url || '/logo.png'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ 
                            fontWeight: '900', color: 'white', 
                            fontSize: layoutMode === 'grid' ? '18px' : '16px', 
                            marginBottom: '6px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }} title={sponsor.name}>{sponsor.name}</h5>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ 
                                fontSize: '9px', color: 'var(--brand)', fontWeight: '900', 
                                textTransform: 'uppercase', background: 'rgba(212,193,156,0.1)', 
                                padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(212,193,156,0.1)'
                            }}>{sponsor.tier}</span>
                            {sponsor.booth && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '800' }}>#{sponsor.booth}</span>}
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'flex-end',
                    flexShrink: 0, // Não deixa os botões encolherem
                    flexWrap: 'wrap' // Permite que caiam para a linha de baixo se necessário
                }}>
                    <button 
                        onClick={() => {
                            setIsEditing(true);
                            setEditingId(sponsor.id);
                            setNewSponsor({...sponsor});
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '10px 18px', color: 'var(--brand)', 
                            background: 'rgba(212,193,156,0.06)', border: '1px solid rgba(212,193,156,0.15)', 
                            borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' 
                        }}
                    >
                        <Edit2 size={13} /> EDITAR
                    </button>
                    <button 
                        onClick={() => handleDelete(sponsor.id)} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '10px 18px', color: '#EF4444', 
                            background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', 
                            borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '900' 
                        }}
                    >
                        <Trash2 size={13} /> EXCLUIR
                    </button>
                </div>
            </div>
            ))}
        </div>

        {sponsors.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>Gerencie seus parceiros aqui.</p>}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '15px', outline: 'none', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', fontWeight: '700' };
const btnSaveStyle = { width: '100%', padding: '20px', borderRadius: '16px', background: 'var(--primary)', color: 'white', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const cardStyle = { background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' };
