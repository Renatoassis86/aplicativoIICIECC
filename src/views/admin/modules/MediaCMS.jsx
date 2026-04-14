import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Music, Plus, Trash2, Edit2, Save, X, Link as LinkIcon, 
  Radio, PlayCircle, Podcast, Clapperboard, MonitorPlay, 
  Upload, Image as ImageIcon, Search, Filter, 
  ChevronRight, MoreHorizontal, Globe, Shield, Camera, Film, RefreshCw,
  LayoutGrid, List, Play
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const MediaCMS = () => {
    const fileRef = useRef(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaType, setMediaType] = useState('video');
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [sourceType, setSourceType] = useState('link'); // 'link' ou 'file'
    const [layoutMode, setLayoutMode] = useState('list'); // 'grid' ou 'list' (Default list for Media)

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
        try {
            const { data, error } = await supabase
                .from('media_assets')
                .select('*')
                .order('is_live_stream', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (data) setMediaItems(data);
            if (error) throw error;
        } catch (err) {
            console.error("Erro ao carregar mídia:", err);
        } finally {
            setLoading(false);
        }
    };

    const triggerSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccess(true);
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('app_media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('app_media').getPublicUrl(filePath);
            return { url: publicUrl, ext: fileExt };
        } catch (error) {
            console.error('Erro no upload:', error);
            return null;
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        setLoading(true);
        try {
            if (sourceType === 'file' && mediaFiles.length > 0) {
                for (let i = 0; i < mediaFiles.length; i++) {
                    const file = mediaFiles[i];
                    const result = await handleFileUpload(file);
                    
                    if (result) {
                        const ext = result.ext;
                        let finalType = mediaType;
                        // Auto-detect based on extension
                        if (['mp4', 'mov', 'avi', 'm4v', 'webm'].includes(ext)) finalType = 'video';
                        else if (['mp3', 'wav', 'aac', 'ogg'].includes(ext)) finalType = 'audio';
                        else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) finalType = 'image';

                        const payload = {
                            title: mediaFiles.length > 1 ? `${data.title} (${i + 1})` : data.title,
                            description: data.description,
                            url: result.url,
                            media_type: finalType,
                            category: data.category || 'Memórias',
                            source_type: 'file',
                            is_live_stream: data.is_live_stream === 'on',
                            updated_at: new Date().toISOString()
                        };
                        const { error: insError } = await supabase.from('media_assets').insert(payload);
                        if (insError) console.error("Error inserting file:", insError);
                    }
                }
                triggerSuccess(`${mediaFiles.length} arquivos publicados com sucesso!`);
                setMediaFiles([]);
            } else {
                const payload = {
                    id: editingItem?.id || undefined,
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    media_type: mediaType,
                    category: data.category || (editingItem ? editingItem.category : 'Memórias'),
                    source_type: sourceType,
                    is_live_stream: data.is_live_stream === 'on',
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase.from('media_assets').upsert(payload);
                if (error) throw error;
                triggerSuccess('Conteúdo salvo com sucesso!');
            }

            setEditingItem(null);
            setSourceType('link');
            e.target.reset();
            loadMedia();
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id, filePath) => {
        if (!window.confirm('Excluir este item permanentemente?')) return;
        setLoading(true);
        try {
            if (filePath && filePath.includes('/app_media/')) {
                const parts = filePath.split('app_media/');
                const storagePath = parts[1];
                await supabase.storage.from('app_media').remove([storagePath]);
            }
            const { error } = await supabase.from('media_assets').delete().eq('id', id);
            if (!error) {
                setMediaItems(prev => prev.filter(m => m.id !== id));
                triggerSuccess('Item removido com sucesso.');
            } else throw error;
        } catch (err) {
            alert("Erro ao excluir: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = mediaItems.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || item.category === activeTab;
        return matchesSearch && matchesTab;
    });

    const typeOptions = [
        { id: 'video', label: '🎥 VÍDEO', color: '#E53E3E', icon: <Film size={20} /> },
        { id: 'image', label: '📸 FOTO', color: '#3182CE', icon: <Camera size={20} /> },
        { id: 'audio', label: '🎙️ ÁUDIO', color: '#805AD5', icon: <Podcast size={20} /> }
    ];

    return (
        <div style={{ paddingBottom: '60px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Acervo de Mídia</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Gerencie transmissões, podcasts e memórias visuais.</p>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '6px', border: '1px solid var(--border-color)' }}>
                    <button onClick={() => setLayoutMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: layoutMode === 'grid' ? 'var(--brand)' : 'transparent', color: layoutMode === 'grid' ? 'black' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', transition: 'all 0.2s' }}>
                        <LayoutGrid size={18} /> <span style={{ fontSize: '12px' }}>CARTÃO</span>
                    </button>
                    <button onClick={() => setLayoutMode('list')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: layoutMode === 'list' ? 'var(--brand)' : 'transparent', color: layoutMode === 'list' ? 'black' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', transition: 'all 0.2s' }}>
                        <List size={18} /> <span style={{ fontSize: '12px' }}>LISTA</span>
                    </button>
                </div>
            </div>

            <div className="responsive-grid">
                
                {/* COLUNA ESQUERDA: FORMULÁRIO */}
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '32px', 
                    border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', minWidth: 0
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <h4 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>
                            {editingItem ? 'Editar Mídia' : 'Nova Publicação'}
                        </h4>
                        {editingItem && (
                            <button onClick={() => { setEditingItem(null); setSourceType('link'); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>CANCELAR</button>
                        )}
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div>
                            <label style={labelStyle}>TIPO DE CONTEÚDO</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {typeOptions.map(opt => (
                                    <button 
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setMediaType(opt.id)}
                                        style={{
                                            padding: '16px 8px', borderRadius: '16px', border: '2px solid',
                                            borderColor: mediaType === opt.id ? opt.color : 'rgba(255,255,255,0.1)',
                                            background: mediaType === opt.id ? opt.color : 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.2s', cursor: 'pointer'
                                        }}
                                    >
                                        {opt.icon}
                                        <span style={{ fontSize: '10px', fontWeight: '900' }}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Título e Categoria</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input name="title" defaultValue={editingItem?.title} required style={inputStyle} placeholder="Título da mídia" />
                                <select name="category" defaultValue={editingItem?.category || 'Memórias'} style={inputStyle}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                            <label style={labelStyle}>Mídia do Post</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button type="button" onClick={() => setSourceType('link')} style={{ ...tabStyle, flex: 1, background: sourceType === 'link' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: sourceType === 'link' ? 'black' : 'white' }}>LINK / URL</button>
                                <button type="button" onClick={() => setSourceType('file')} style={{ ...tabStyle, flex: 1, background: sourceType === 'file' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: sourceType === 'file' ? 'black' : 'white' }}>UPLOAD</button>
                            </div>

                            {sourceType === 'link' ? (
                                <input name="url" defaultValue={editingItem?.url} placeholder="Link do vídeo ou áudio..." style={inputStyle} />
                            ) : (
                                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <input type="file" id="media_bulk_upload" multiple style={{ display: 'none' }} onChange={(e) => setMediaFiles(Array.from(e.target.files))} />
                                    <label htmlFor="media_bulk_upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <Upload size={24} color="var(--brand)" />
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: mediaFiles.length > 0 ? 'var(--brand)' : 'white' }}>
                                            {mediaFiles.length > 0 ? `${mediaFiles.length} arquivos selecionados` : 'Selecione um ou mais arquivos'}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '18px' }}>
                            <input type="checkbox" name="is_live_stream" defaultChecked={editingItem?.is_live_stream} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>Marcar como LIVE STREAM</label>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Destaque em tempo real no aplicativo.</p>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={btnSaveStyle}>
                            {loading ? 'PROCESSANDO...' : editingItem ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO ACERVO'}
                        </button>
                    </form>
                </div>

                {/* COLUNA DIREITA: LISTAGEM */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input placeholder="Pesquisar acervo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '48px', height: '48px' }} />
                        </div>
                        <button onClick={loadMedia} style={{ ...tabStyle, width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div style={{ 
                        display: layoutMode === 'grid' ? 'grid' : 'flex', 
                        gridTemplateColumns: layoutMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
                        flexDirection: layoutMode === 'grid' ? 'none' : 'column',
                        gap: '12px' 
                    }}>
                        {filteredItems.map(item => (
                            <div key={item.id} style={{ 
                                background: 'var(--card-bg)', padding: layoutMode === 'grid' ? '0' : '16px 20px', 
                                borderRadius: '20px', border: '1px solid var(--border-color)', 
                                display: layoutMode === 'grid' ? 'block' : 'flex', 
                                alignItems: 'center', gap: '16px', opacity: item.is_archived ? 0.5 : 1,
                                overflow: 'hidden'
                            }}>
                                <div style={{ 
                                    width: layoutMode === 'grid' ? '100%' : '48px', 
                                    height: layoutMode === 'grid' ? '160px' : '48px', 
                                    borderRadius: layoutMode === 'grid' ? '0' : '12px', 
                                    background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: 'var(--brand)', overflow: 'hidden', position: 'relative' 
                                }}>
                                    {item.media_type === 'video' ? (
                                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                <Play size={layoutMode === 'grid' ? 32 : 18} color="white" fill="white" />
                                            </div>
                                        </div>
                                    ) : item.media_type === 'image' ? (
                                        <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Podcast size={layoutMode === 'grid' ? 40 : 20} /></div>
                                    )}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden', padding: layoutMode === 'grid' ? '20px' : '0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--brand)', background: 'rgba(212, 193, 156, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.category?.toUpperCase()}</span>
                                        {item.is_live_stream && <span style={{ background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>}
                                    </div>
                                    <h6 style={{ color: 'white', fontWeight: '800', fontSize: '15px', marginTop: layoutMode === 'grid' ? '8px' : '0' }}>{item.title}</h6>
                                    {layoutMode === 'grid' && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                            <button onClick={() => { setEditingItem(item); setSourceType(item.source_type || 'link'); }} style={{ ...actionBtnStyle, flex: 1, width: 'auto' }}><Edit2 size={16} style={{ marginRight: '8px' }} /> EDITAR</button>
                                            <button onClick={() => deleteItem(item.id, item.url)} style={{ ...actionBtnStyle, color: '#EF4444', width: '48px' }}><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                {layoutMode === 'list' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { setEditingItem(item); setSourceType(item.source_type || 'link'); }} style={actionBtnStyle}><Edit2 size={16} /></button>
                                        <button onClick={() => deleteItem(item.id, item.url)} style={{ ...actionBtnStyle, color: '#EF4444' }}><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const labelStyle = { fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', display: 'block', letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none' };
const btnSaveStyle = { width: '100%', padding: '18px', borderRadius: '18px', background: 'var(--brand)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const tabStyle = { padding: '12px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', fontSize: '12px' };
const actionBtnStyle = { height: '38px', width: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default MediaCMS;
