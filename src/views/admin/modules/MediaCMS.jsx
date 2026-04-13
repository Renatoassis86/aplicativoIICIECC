import React, { useState, useEffect } from 'react';
import { 
  Video, Music, Plus, Trash2, Edit2, Save, X, Link as LinkIcon, 
  Radio, PlayCircle, Podcast, Clapperboard, MonitorPlay, 
  Upload, Image as ImageIcon, Search, Filter, 
  ChevronRight, MoreHorizontal, Globe, Shield
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const MediaCMS = () => {
    const fileRef = React.useRef(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [sourceType, setSourceType] = useState('link'); // 'link' ou 'file'

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

    const handleFileUpload = async (file) => {
        if (!file) return null;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('app_media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('app_media').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            alert('Erro no upload: ' + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        setLoading(true);
        try {
            const files = fileRef.current?.files;
            
            // Caso seja upload de arquivo(s)
            if (sourceType === 'file' && files?.length > 0) {
                setUploading(true);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const uploadedUrl = await handleFileUpload(file);
                    
                    if (uploadedUrl) {
                        const payload = {
                            title: files.length > 1 ? `${data.title} (${i + 1})` : data.title,
                            description: data.description,
                            url: uploadedUrl,
                            media_type: data.media_type,
                            category: data.category || 'Memórias',
                            source_type: 'file',
                            is_live_stream: data.is_live_stream === 'on',
                            updated_at: new Date().toISOString()
                        };
                        await supabase.from('media_assets').insert(payload);
                    }
                }
                setUploading(false);
            } else {
                // Caso seja LINK ou EDIÇÃO de item existente (um por vez)
                const payload = {
                    id: editingItem?.id || undefined,
                    title: data.title,
                    description: data.description,
                    url: data.url,
                    media_type: data.media_type,
                    category: data.category || editingItem?.category || 'Memórias',
                    source_type: sourceType,
                    is_live_stream: data.is_live_stream === 'on',
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase.from('media_assets').upsert(payload);
                if (error) throw error;
            }

            setEditingItem(null);
            setSourceType('link');
            loadMedia();
            triggerSuccess(files?.length > 1 ? `${files.length} arquivos publicados!` : 'Conteúdo salvo com sucesso!');
            e.target.reset();
            if (fileRef.current) fileRef.current.value = '';
            
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        }
        setLoading(false);
    };

    const deleteItem = async (id, filePath) => {
        if (!window.confirm('Excluir este item permanentemente?')) return;
        setLoading(true);
        
        // Se for arquivo, tentar deletar do storage tb
        if (filePath && !filePath.startsWith('http')) {
            await supabase.storage.from('app_media').remove([filePath]);
        }

        const { error } = await supabase.from('media_assets').delete().eq('id', id);
        if (!error) {
            loadMedia();
            triggerSuccess('Item removido com sucesso.');
        }
        setLoading(false);
    };

    const filteredItems = mediaItems.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || item.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div style={{ paddingBottom: '60px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            {/* HEADER */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Gestão de Mídia</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '4px' }}>Controle total sobre vídeos, podcasts e fotos do evento.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <div style={tagStyle}>TOTAL: {mediaItems.length}</div>
                   <div style={{ ...tagStyle, background: 'var(--brand)', color: 'black' }}>LIVES: {mediaItems.filter(m => m.is_live_stream).length}</div>
                </div>
            </div>

            <div className="responsive-grid">
                
                {/* COLUNA ESQUERDA: FORMULÁRIO */}
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '32px', 
                    border: '1px solid var(--border-color)', position: 'sticky', top: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 193, 156, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                              <Plus size={20} />
                           </div>
                           <h4 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>
                               {editingItem?.id ? 'Editar Mídia' : 'Novo Material'}
                           </h4>
                        </div>
                        {editingItem?.id && (
                            <button onClick={() => { setEditingItem(null); setSourceType('link'); }} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}>CANCELAR</button>
                        )}
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Título do Conteúdo</label>
                            <input name="title" defaultValue={editingItem?.title} required style={inputStyle} placeholder="Ex: Podcast de Encerramento" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Formato</label>
                                <select name="media_type" defaultValue={editingItem?.media_type || 'video'} style={inputStyle}>
                                    <option value="video">🎞️ Vídeo / Entrevista</option>
                                    <option value="audio">🎙️ Podcast / Áudio</option>
                                    <option value="image">📸 Foto / Galeria</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Segmento</label>
                                <select name="category" defaultValue={editingItem?.category || 'Flash 2026'} style={inputStyle}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                            <label style={labelStyle}>Origem do Arquivo</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button type="button" onClick={() => setSourceType('link')} style={{ ...tabSmallStyle, background: sourceType === 'link' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: sourceType === 'link' ? 'black' : 'white' }}>
                                   <LinkIcon size={14} /> LINK EXTERNO
                                </button>
                                <button type="button" onClick={() => setSourceType('file')} style={{ ...tabSmallStyle, background: sourceType === 'file' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: sourceType === 'file' ? 'black' : 'white' }}>
                                   <Upload size={14} /> UPLOAD DIRETO
                                </button>
                            </div>

                            {sourceType === 'link' ? (
                                <div>
                                   <input name="url" defaultValue={editingItem?.url} required={sourceType === 'link'} style={inputStyle} placeholder="YouTube, Spotify ou Drive Link" />
                                   <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Dica: Para YouTube, use o link da barra de endereços.</p>
                                </div>
                            ) : (
                                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                                   <input 
                                     type="file" 
                                     ref={fileRef}
                                     name="file_upload" 
                                     id="file_upload" 
                                     multiple
                                     style={{ display: 'none' }} 
                                     onChange={(e) => {
                                        if(e.target.files.length > 0) triggerSuccess(`${e.target.files.length} arquivo(s) selecionado(s)`);
                                     }} 
                                   />
                                   <label htmlFor="file_upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                         <Upload size={20} />
                                      </div>
                                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>Clique para selecionar arquivo</span>
                                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Máx 50MB (PNG, JPG, MP3)</span>
                                   </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212, 193, 156, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(212, 193, 156, 0.1)' }}>
                            <input type="checkbox" name="is_live_stream" defaultChecked={editingItem?.is_live_stream} style={{ width: '22px', height: '22px', cursor: 'pointer' }} />
                            <div>
                                <label style={{ ...labelStyle, marginBottom: 0, color: '#FFFFFF' }}>Marcar como TRANSMISSÃO AO VIVO</label>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Ativa o selo 'LIVE' e destaque na página de mídia.</p>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Descrição (Opcional)</label>
                            <textarea name="description" defaultValue={editingItem?.description} style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} placeholder="Detalhes que aparecerão no player..." />
                        </div>

                        <button type="submit" disabled={loading || uploading} style={{ ...btnSaveStyle, opacity: (loading || uploading) ? 0.7 : 1 }}>
                            {loading || uploading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {uploading ? 'FAZENDO UPLOAD...' : 'SALVANDO...'}
                                </div>
                            ) : (
                                <><Save size={20} /> {editingItem?.id ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NO ACERVO'}</>
                            )}
                        </button>
                    </form>
                </div>

                {/* COLUNA DIREITA: LISTAGEM SEGMENTADA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* FILTROS E BUSCA */}
                    <div style={{ background: 'var(--card-bg)', padding: '20px 24px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Search size={20} color="var(--brand)" />
                            <input 
                                placeholder="Pesquisar título ou categoria..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '500' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                            <button onClick={() => setActiveTab('ALL')} style={{ ...tabStyle, background: activeTab === 'ALL' ? 'var(--brand)' : 'transparent', color: activeTab === 'ALL' ? 'black' : 'white' }}>TODOS</button>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveTab(cat)} style={{ ...tabStyle, background: activeTab === cat ? 'var(--brand)' : 'transparent', color: activeTab === cat ? 'black' : 'white' }}>{cat.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>

                    {/* LISTA DE ITENS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {filteredItems.length === 0 ? (
                             <div style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <Clapperboard size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>Nenhum material encontrado.</p>
                             </div>
                         ) : (
                             filteredItems.map(item => (
                                <div key={item.id} style={{ 
                                    background: 'var(--card-bg)', padding: '20px 24px', borderRadius: '24px', 
                                    border: '1px solid var(--border-color)', transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    {item.is_live_stream && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#EF4444' }}></div>}
                                    
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                                        <div style={{ 
                                            width: '56px', height: '56px', borderRadius: '16px', 
                                            background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: item.is_live_stream ? '#EF4444' : 'var(--brand)',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {item.is_live_stream ? <Radio className="animate-pulse" size={24} /> : item.media_type === 'video' ? <Video size={24} /> : item.media_type === 'image' ? <ImageIcon size={24} /> : <Podcast size={24} />}
                                        </div>
                                        <div style={{ overflow: 'hidden', flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--brand)', background: 'rgba(212, 193, 156, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{(item.category || 'Outros').toUpperCase()}</span>
                                                {item.is_live_stream && <span style={{ background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px' }}>LIVE</span>}
                                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{item.source_type === 'file' ? 'ARQUIVO LOCAL' : 'LINK EXTERNO'}</span>
                                            </div>
                                            <h5 style={{ fontWeight: '800', color: 'white', fontSize: '16px', marginBottom: '2px' }}>{item.title}</h5>
                                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                                        <button onClick={() => { setEditingItem(item); setSourceType(item.source_type || 'link'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={actionBtnStyle} title="Editar"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteItem(item.id, item.url)} style={{ ...actionBtnStyle, color: '#EF4444' }} title="Excluir"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                             ))
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// ESTILOS COMPLEMENTARES
// ============================================

const tagStyle = { 
    background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '10px', 
    fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' 
};

const labelStyle = { 
    fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', 
    marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1.5px' 
};

const inputStyle = { 
    width: '100%', padding: '16px', borderRadius: '16px', 
    border: '1px solid rgba(255,255,255,0.08)', fontSize: '15px', outline: 'none', 
    color: '#000', backgroundColor: '#FFFFFF', fontWeight: '600',
    transition: 'border-color 0.2s', boxSizing: 'border-box'
};

const tabStyle = {
    padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s',
    whiteSpace: 'nowrap', letterSpacing: '0.5px', boxSizing: 'border-box'
};

const tabSmallStyle = {
    ...tabStyle, padding: '10px 14px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box'
};

const actionBtnStyle = { 
    width: '44px', height: '44px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
    color: 'white', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', boxSizing: 'border-box'
};

const btnSaveStyle = { 
    padding: '20px', borderRadius: '18px', background: 'var(--brand)', color: 'black', border: 'none', 
    fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    gap: '12px', marginTop: '10px', width: '100%', fontSize: '16px', letterSpacing: '0.5px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'transform 0.2s', boxSizing: 'border-box'
};

export default MediaCMS;
