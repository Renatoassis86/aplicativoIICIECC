import React, { useState, useEffect } from 'react';
import { 
  Users, MessageCircle, Heart, Trash2, Shield, 
  CheckCircle, XCircle, Search, Filter, 
  MoreHorizontal, Eye, Flag, Share2, 
  User, Calendar, Clock, Image as ImageIcon,
  Video, Play, Bookmark, Archive
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const SocialManagementCMS = () => {
    const fileRef = React.useRef(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'image', 'video'
    const [activeSourceType, setActiveSourceType] = useState('file');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('social_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setPosts(data);
        if (error) console.error("Erro ao carregar posts:", error);
        setLoading(false);
    };

    const triggerSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccess(true);
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `social/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('app_media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('app_media').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            alert('Erro no upload: ' + error.message);
            return null;
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        setLoading(true);
        try {
            let finalMediaUrl = data.media_url;

            if (activeSourceType === 'file' && fileRef.current?.files[0]) {
                setUploading(true);
                const uploadedUrl = await handleFileUpload(fileRef.current.files[0]);
                if (uploadedUrl) finalMediaUrl = uploadedUrl;
                else { setLoading(false); setUploading(false); return; }
                setUploading(false);
            }

            const payload = {
                author_name: data.author_name || 'Organização CIECC',
                author_role: data.author_role || 'Diretoria Geral',
                author_tier: 4,
                content_type: data.media_type,
                media_type: data.media_type,
                media_urls: [finalMediaUrl],
                caption: data.caption,
                sponsor_name: data.author_name || 'Organização CIECC',
                sponsor_role: data.author_role || 'Diretoria Geral',
                user_id: 'CIECC_ADMIN',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('social_posts').insert([payload]);

            if (!error) {
                triggerSuccess('Post publicado com sucesso!');
                e.target.reset();
                if (fileRef.current) fileRef.current.value = '';
                loadPosts();
            } else {
                throw error;
            }
        } catch (err) {
            alert('Erro ao publicar: ' + err.message);
        }
        setLoading(false);
    };

    const deletePost = async (id) => {
        if (!window.confirm('Excluir esta publicação permanentemente? Esta ação não pode ser desfeita.')) return;
        
        setLoading(true);
        try {
            const { error } = await supabase
                .from('social_posts')
                .delete()
                .eq('id', id);

            if (!error) {
                setPosts(posts.filter(p => p.id !== id));
                triggerSuccess('Publicação removida com sucesso.');
            } else {
                throw error;
            }
        } catch (err) {
            alert('Erro ao excluir: ' + err.message);
        }
        setLoading(false);
    };

    const toggleArchive = async (post) => {
        const newStatus = !post.is_archived;
        try {
            const { error } = await supabase
                .from('social_posts')
                .update({ is_archived: newStatus })
                .eq('id', post.id);

            if (!error) {
                setPosts(posts.map(p => p.id === post.id ? { ...p, is_archived: newStatus } : p));
                triggerSuccess(newStatus ? 'Publicação arquivada.' : 'Publicação restaurada.');
            }
        } catch (err) {
            alert('Erro ao atualizar status: ' + err.message);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = 
            post.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || post.media_type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div style={{ paddingBottom: '60px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            {/* HEADER */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Gestão do Conectar</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '4px' }}>Moderação de posts, fotos e vídeos compartilhados na rede social.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <div style={tagStyle}>TOTAL: {posts.length}</div>
                   <div style={{ ...tagStyle, background: 'var(--brand)', color: 'black' }}>ATIVOS: {posts.filter(p => !p.is_archived).length}</div>
                </div>
            </div>

            <div className="responsive-grid">
                
                {/* COLUNA ESQUERDA: FORMULÁRIO DE POSTAGEM */}
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '32px', 
                    border: '1px solid var(--border-color)', position: 'sticky', top: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)', minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 193, 156, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                            <PlusSquare size={20} />
                        </div>
                        <h4 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>Nova Publicação</h4>
                    </div>

                    <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Identidade Visual (Autor)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input name="author_name" defaultValue="Organização CIECC" required style={inputStyle} placeholder="Nome do Autor" />
                                <input name="author_role" defaultValue="Diretoria Geral" required style={inputStyle} placeholder="Cargo / Tier" />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Tipo de Mídia</label>
                            <select name="media_type" style={inputStyle}>
                                <option value="image">📸 Foto / Galeria</option>
                                <option value="video">🎞️ Vídeo / Reel</option>
                            </select>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                            <label style={labelStyle}>Mídia do Post</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button type="button" onClick={() => setActiveSourceType('file')} style={{ ...tabStyle, flex: 1, background: activeSourceType === 'file' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: activeSourceType === 'file' ? 'black' : 'white' }}>UPLOAD</button>
                                <button type="button" onClick={() => setActiveSourceType('url')} style={{ ...tabStyle, flex: 1, background: activeSourceType === 'url' ? 'var(--brand)' : 'rgba(255,255,255,0.05)', color: activeSourceType === 'url' ? 'black' : 'white' }}>URL</button>
                            </div>

                            {activeSourceType === 'file' ? (
                                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                                    <input type="file" ref={fileRef} style={{ display: 'none' }} id="social_file" onChange={(e) => e.target.files[0] && triggerSuccess('Arquivo selecionado!')} />
                                    <label htmlFor="social_file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <Upload size={20} color="var(--brand)" />
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>Clique para selecionar</span>
                                    </label>
                                </div>
                            ) : (
                                <input name="media_url" style={inputStyle} placeholder="URL da imagem ou vídeo..." />
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Legenda do Post</label>
                            <textarea name="caption" required style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} placeholder="O que você quer compartilhar com os congressistas?" />
                        </div>

                        <button type="submit" disabled={loading || uploading} style={btnSaveStyle}>
                            {loading || uploading ? 'PUBLICANDO...' : 'POSTAR NA REDE SOCIAL'}
                        </button>
                    </form>
                </div>

                {/* COLUNA DIREITA: FEED DE MODERAÇÃO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    
                    {/* FILTROS E BUSCA */}
                    <div style={{ 
                        background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', 
                        border: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column', gap: '20px'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--brand)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                placeholder="Pesquisar por autor ou conteúdo..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '48px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setFilterType('ALL')} style={{ ...tabStyle, background: filterType === 'ALL' ? 'var(--brand)' : 'transparent', color: filterType === 'ALL' ? 'black' : 'white' }}>TODOS</button>
                            <button onClick={() => setFilterType('image')} style={{ ...tabStyle, background: filterType === 'image' ? 'var(--brand)' : 'transparent', color: filterType === 'image' ? 'black' : 'white' }}>FOTOS</button>
                            <button onClick={() => setFilterType('video')} style={{ ...tabStyle, background: filterType === 'video' ? 'var(--brand)' : 'transparent', color: filterType === 'video' ? 'black' : 'white' }}>VÍDEOS</button>
                            <button onClick={loadPosts} disabled={loading} style={tabStyle}>
                                <Users size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* GRID DE POSTS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filteredPosts.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                                <MessageCircle size={48} style={{ opacity: 0.1, marginBottom: '16px', margin: '0 auto' }} />
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>Nenhuma publicação encontrada.</p>
                            </div>
                        ) : (
                            filteredPosts.map(post => (
                                <div key={post.id} style={{ 
                                    background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)',
                                    overflow: 'hidden', position: 'relative', opacity: post.is_archived ? 0.6 : 1
                                }}>
                                    <div style={{ width: '100%', height: '180px', background: '#000' }}>
                                        {post.media_type === 'video' ? (
                                            <video src={post.media_urls?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                        ) : (
                                            <img src={post.media_urls?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>

                                    <div style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
                                                {post.author_name?.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <h6 style={{ color: 'white', fontWeight: '800', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author_name}</h6>
                                            </div>
                                        </div>

                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {post.caption}
                                        </p>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => toggleArchive(post)} style={{ ...actionBtnStyle, flex: 1, height: '36px', fontSize: '10px' }}>
                                                {post.is_archived ? 'RESTAURAR' : 'ARQUIVAR'}
                                            </button>
                                            <button onClick={() => deletePost(post.id)} style={{ ...actionBtnStyle, height: '36px', width: '36px', color: '#EF4444' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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

const inputStyle = { 
    width: '100%', padding: '16px', borderRadius: '16px', 
    border: '1px solid rgba(255,255,255,0.08)', fontSize: '15px', outline: 'none', 
    color: '#000', backgroundColor: '#FFFFFF', fontWeight: '600',
    transition: 'border-color 0.2s' 
};

const tabStyle = {
    padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s',
    whiteSpace: 'nowrap', letterSpacing: '1px'
};

const actionBtnStyle = { 
    height: '48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
    color: 'white', fontWeight: '800', fontSize: '12px', gap: '10px', transition: 'all 0.2s'
};

export default SocialManagementCMS;
