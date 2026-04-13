import React, { useState, useEffect } from 'react';
import { Video, Music, Plus, Trash2, Edit2, Save, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const MediaCMS = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('media_assets')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setMediaItems(data);
        setLoading(false);
    };

    const triggerSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccess(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        setLoading(true);
        const { error } = await supabase.from('media_assets').upsert({
            id: editingItem?.id || undefined,
            title: data.title,
            description: data.description,
            url: data.url,
            media_type: data.media_type,
            category: data.category,
            updated_at: new Date().toISOString()
        });

        if (!error) {
            setEditingItem(null);
            loadMedia();
            triggerSuccess('Conteúdo de mídia atualizado com sucesso!');
        } else {
            alert('Erro ao salvar: ' + error.message);
        }
        setLoading(false);
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Excluir este item permanentemente?')) return;
        setLoading(true);
        const { error } = await supabase.from('media_assets').delete().eq('id', id);
        if (!error) {
            loadMedia();
            triggerSuccess('Item removido do acervo.');
        }
        setLoading(false);
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '24px', color: 'white' }}>Auditório Digital</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Vídeos do YouTube, Podcasts e Aulas</p>
                </div>
                <button 
                    onClick={() => setEditingItem({ media_type: 'video' })}
                    style={{ 
                        padding: '12px 24px', borderRadius: '14px', background: 'var(--secondary)', 
                        color: '#000', border: 'none', fontWeight: '800', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    <Plus size={20} /> ADICIONAR CONTEÚDO
                </button>
            </div>

            {loading && !editingItem && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--gold)', fontWeight: '700' }}>Sincronizando biblioteca...</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {mediaItems.map(item => (
                    <div key={item.id} style={{ 
                        background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', 
                        border: '1px solid var(--border-color)', position: 'relative',
                        transition: 'transform 0.3s ease', cursor: 'default'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ 
                                background: item.media_type === 'video' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                {item.media_type === 'video' ? <Video size={14} color="#EF4444" /> : <Music size={14} color="#10B981" />}
                                <span style={{ fontSize: '11px', fontWeight: '900', color: item.media_type === 'video' ? '#EF4444' : '#10B981', textTransform: 'uppercase' }}>
                                    {item.media_type}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditingItem(item)} style={iconBtnStyle}><Edit2 size={14} /></button>
                                <button onClick={() => deleteItem(item.id)} style={iconBtnDeleteStyle}><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <h4 style={{ fontWeight: '800', color: 'white', marginBottom: '8px', fontSize: '17px' }}>{item.title}</h4>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', lineHeight: '1.5' }}>{item.description}</p>
                        
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', 
                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--gold)',
                            fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <LinkIcon size={14} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
                        </div>
                    </div>
                ))}
            </div>

            {editingItem && (
                <div style={overlayStyle}>
                    <div style={modalStyle} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '900', fontSize: '20px' }}>{editingItem.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
                            <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Título do Conteúdo</label>
                                <input name="title" defaultValue={editingItem.title} required style={inputStyle} placeholder="Ex: Aula Magna - II CIECC" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Tipo</label>
                                    <select name="media_type" defaultValue={editingItem.media_type} style={inputStyle}>
                                        <option value="video">Vídeo (YouTube)</option>
                                        <option value="audio">Áudio (Podcast/Aula)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Categoria</label>
                                    <input name="category" defaultValue={editingItem.category} style={inputStyle} placeholder="Ex: Educação" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Link do YouTube / Áudio</label>
                                <input name="url" defaultValue={editingItem.url} required style={inputStyle} placeholder="https://youtube.com/watch?v=..." />
                            </div>

                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <textarea name="description" defaultValue={editingItem.description} style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} placeholder="Breve resumo do conteúdo..." />
                            </div>

                            <button type="submit" disabled={loading} style={btnSaveStyle}>
                                {loading ? 'PROCESSANDO...' : <><Save size={20} /> SALVAR NA BIBLIOTECA</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const iconBtnStyle = { 
    width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
    color: 'white', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s'
};
const iconBtnDeleteStyle = { ...iconBtnStyle, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalStyle = { background: '#0F172A', width: '100%', maxWidth: '550px', borderRadius: '32px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', outline: 'none', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', fontWeight: '600' };
const labelStyle = { fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' };
const btnSaveStyle = { 
    padding: '18px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', 
    fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    gap: '12px', marginTop: '10px', width: '100%', fontSize: '16px', letterSpacing: '0.5px', boxShadow: '0 10px 20px rgba(74, 16, 29, 0.3)'
};

export default MediaCMS;
