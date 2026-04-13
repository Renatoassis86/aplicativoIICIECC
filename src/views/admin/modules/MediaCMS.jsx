import React, { useState, useEffect } from 'react';
import { Video, Music, Plus, Trash2, Edit2, Save, X, Link as LinkIcon, Radio, PlayCircle, Podcast, Clapperboard, MonitorPlay } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const MediaCMS = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        "Flash 2026",
        "Entrevistas Exclusivas",
        "Podcast",
        "Memórias",
        "Palestras",
        "Outros"
    ];

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('media_assets')
            .select('*')
            .order('is_live_stream', { ascending: false })
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
        const payload = {
            id: editingItem?.id || undefined,
            title: data.title,
            description: data.description,
            url: data.url,
            media_type: data.media_type,
            category: data.category,
            source_type: 'link', // Campo obrigatório no banco
            is_live_stream: data.is_live_stream === 'on',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('media_assets').upsert(payload);

        if (!error) {
            setEditingItem(null);
            loadMedia();
            triggerSuccess(editingItem?.id ? 'Conteúdo atualizado!' : 'Novo conteúdo adicionado!');
            e.target.reset();
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
            triggerSuccess('Item removido com sucesso.');
        }
        setLoading(false);
    };

    const filteredItems = mediaItems.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ paddingBottom: '60px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontWeight: '900', fontSize: '28px', color: 'white', letterSpacing: '-0.5px' }}>Acervo de Mídia & Transmissão</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '4px' }}>Gerencie lives, podcasts, entrevistas e memórias do II CIECC.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>
                
                {/* COLUNA ESQUERDA: FORMULÁRIO */}
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', 
                    border: '1px solid var(--border-color)', position: 'sticky', top: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h4 style={{ fontWeight: '800', fontSize: '18px', color: 'var(--brand)' }}>
                            {editingItem?.id ? 'Editar Conteúdo' : 'Adicionar Novo'}
                        </h4>
                        {editingItem?.id && (
                            <button onClick={() => { setEditingItem(null); document.querySelector('form').reset(); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>CANCELAR</button>
                        )}
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Título</label>
                            <input name="title" defaultValue={editingItem?.title} required style={inputStyle} placeholder="Ex: Podcast #01 - Chris Schlect" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Tipo</label>
                                <select name="media_type" defaultValue={editingItem?.media_type || 'video'} style={inputStyle}>
                                    <option value="video">🎞️ Vídeo</option>
                                    <option value="audio">🎙️ Áudio</option>
                                    <option value="image">📸 Foto</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Categoria</label>
                                <select name="category" defaultValue={editingItem?.category || 'Flash 2026'} style={inputStyle}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>URL do Link (YouTube / Spotify / Drive)</label>
                            <input name="url" defaultValue={editingItem?.url} required style={inputStyle} placeholder="https://..." />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <input type="checkbox" name="is_live_stream" defaultChecked={editingItem?.is_live_stream} style={{ width: '20px', height: '20px' }} />
                            <div>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Destaque de Transmissão Ao Vivo</label>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Aparecerá com a tag 'LIVE' e destaque no App.</p>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Descrição Breve</label>
                            <textarea name="description" defaultValue={editingItem?.description} style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} placeholder="..." />
                        </div>

                        <button type="submit" disabled={loading} style={btnSaveStyle}>
                            {loading ? 'PROCESSANDO...' : <><Save size={20} /> {editingItem?.id ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR AO ACERVO'}</>}
                        </button>
                    </form>
                </div>

                {/* COLUNA DIREITA: LISTA SEPARADA POR CAIXAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* BUSCA */}
                    <div style={{ background: 'var(--card-bg)', padding: '16px 24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <LinkIcon size={20} color="var(--brand)" />
                        <input 
                            placeholder="Pesquisar em todo o acervo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '500' }}
                        />
                    </div>

                    {categories.map(cat => {
                        const catItems = filteredItems.filter(item => item.category === cat);
                        if (catItems.length === 0 && searchTerm) return null;

                        return (
                            <div key={cat} style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                borderRadius: '32px', 
                                padding: '24px', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {cat === 'Flash 2026' && <Video size={20} />}
                                        {cat === 'Podcast' && <Podcast size={20} />}
                                        {cat === 'Entrevistas Exclusivas' && <PlayCircle size={20} />}
                                        {cat === 'Memórias' && <ImageIcon size={20} />}
                                        {cat === 'Palestras' && <Monitor size={20} />}
                                        {cat === 'Outros' && <Plus size={20} />}
                                        {cat}
                                    </h4>
                                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>
                                        {catItems.length} ITENS
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {catItems.length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nenhuma mídia vinculada.</p>
                                    ) : (
                                        catItems.map(item => (
                                            <div key={item.id} style={{ 
                                                background: item.is_live_stream ? 'linear-gradient(90deg, #4A101D 0%, #1A1A1A 100%)' : 'rgba(255,255,255,0.03)', 
                                                padding: '16px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                                    <div style={{ 
                                                        width: '44px', height: '44px', borderRadius: '12px', 
                                                        background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: item.is_live_stream ? '#EF4444' : 'var(--brand)'
                                                    }}>
                                                        {item.is_live_stream ? <Radio className="animate-pulse" size={20} /> : item.media_type === 'video' ? <Clapperboard size={20} /> : item.media_type === 'image' ? <ImageIcon size={20} /> : <Podcast size={20} />}
                                                    </div>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <h5 style={{ fontWeight: '800', color: 'white', fontSize: '15px', marginBottom: '2px' }}>{item.title}</h5>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {item.is_live_stream && <span style={{ background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '900', padding: '1px 4px', borderRadius: '3px' }}>LIVE</span>}
                                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                                    <button onClick={() => { setEditingItem(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ ...iconBtnStyle, width: '36px', height: '36px' }}><Edit2 size={14} /></button>
                                                    <button onClick={() => deleteItem(item.id)} style={{ ...iconBtnDeleteStyle, width: '36px', height: '36px' }}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const labelStyle = { fontSize: '11px', fontWeight: '900', color: 'var(--brand)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '15px', outline: 'none', color: '#000', backgroundColor: '#FFF', fontWeight: '600' };

const iconBtnStyle = { 
    width: '44px', height: '44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
    color: 'white', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s'
};
const iconBtnDeleteStyle = { ...iconBtnStyle, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' };

const btnSaveStyle = { 
    padding: '20px', borderRadius: '16px', background: 'var(--primary)', color: 'white', border: 'none', 
    fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    gap: '12px', marginTop: '10px', width: '100%', fontSize: '16px', letterSpacing: '0.5px', boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
};

export default MediaCMS;
