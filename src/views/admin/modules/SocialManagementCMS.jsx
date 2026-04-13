import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, Heart, Trash2, Shield, 
  CheckCircle, XCircle, Search, Filter, 
  MoreHorizontal, Eye, Flag, Share2, 
  User, Calendar, Clock, Image as ImageIcon,
  Video, Play, Bookmark, Archive, PlusSquare, Upload,
  Camera, Film, Podcast, Send
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const SocialManagementCMS = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState('image');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('social_posts')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data) setPosts(data);
            if (error) throw error;
        } catch (err) {
            console.error("Erro ao carregar posts:", err);
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
            const filePath = `social/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('app_media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('app_media').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            console.error("Upload error:", error);
            return null;
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        setLoading(true);
        try {
            let mediaUrl = data.media_url_manual;
            
            if (mediaFile) {
                const uploaded = await handleFileUpload(mediaFile);
                if (uploaded) {
                    mediaUrl = uploaded;
                } else {
                    throw new Error("Não foi possível realizar o upload do arquivo.");
                }
            }

            if (!mediaUrl && !data.caption) {
                alert('O post precisa de uma mídia ou legenda!');
                setLoading(false);
                return;
            }

            const { error } = await supabase.from('social_posts').insert({
                author_name: data.author_name || 'Organização CIECC',
                author_role: data.author_role || 'Comunicado Oficial',
                author_tier: 4,
                content_type: mediaType, // image, video, audio
                media_urls: mediaUrl ? [mediaUrl] : [],
                caption: data.caption,
                user_id: 'SYSTEM_ADMIN',
                media_type: mediaType,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            triggerSuccess('Post publicado com sucesso no feed Conectar!');
            e.target.reset();
            setMediaFile(null);
            setMediaType('image');
            loadPosts();
        } catch (err) {
            alert('Erro ao publicar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (id) => {
        if (!window.confirm('Excluir esta publicação permanentemente?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('social_posts').delete().eq('id', id);
            if (!error) {
                setPosts(prev => prev.filter(p => p.id !== id));
                triggerSuccess('Publicação removida.');
            } else throw error;
        } catch (err) {
            alert('Erro ao excluir: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleArchive = async (post) => {
        const newStatus = !post.is_archived;
        try {
            const { error } = await supabase
                .from('social_posts')
                .update({ is_archived: newStatus })
                .eq('id', post.id);

            if (!error) {
                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_archived: newStatus } : p));
                triggerSuccess(newStatus ? 'Publicação arquivada.' : 'Publicação restaurada.');
            } else throw error;
        } catch (err) {
            alert('Erro ao atualizar: ' + err.message);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = 
            post.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || post.media_type === filterType;
        return matchesSearch && matchesType;
    });

    const typeOptions = [
        { id: 'image', label: '📸 FOTO', color: '#3182CE', icon: <Camera size={20} /> },
        { id: 'video', label: '🎥 VÍDEO', color: '#E53E3E', icon: <Film size={20} /> },
        { id: 'audio', label: '🎙️ ÁUDIO', color: '#805AD5', icon: <Podcast size={20} /> }
    ];

    return (
        <div style={{ paddingBottom: '60px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

            {/* HEADER */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Gestão Conectar Social</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Publique e modere o feed da comunidade.</p>
                </div>
            </div>

            <div className="responsive-grid">
                
                {/* COLUNA ESQUERDA: FORMULÁRIO */}
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '32px', 
                    border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                        <PlusSquare size={24} color="var(--brand)" />
                        <h4 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>Nova Postagem Oficial</h4>
                    </div>

                    <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div>
                            <label style={labelStyle}>TIPO DE MÍDIA</label>
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
                            <label style={labelStyle}>Autor e Cargo</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input name="author_name" defaultValue="Organização CIECC" required style={inputStyle} />
                                <input name="author_role" defaultValue="Comunicado Oficial" required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Legenda</label>
                            <textarea name="caption" required style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} placeholder="Texto da publicação..." />
                        </div>

                        <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <input type="file" id="social_file_upload" style={{ display: 'none' }} onChange={(e) => setMediaFile(e.target.files[0])} />
                            <label htmlFor="social_file_upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <Upload size={24} color="var(--brand)" />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: mediaFile ? 'var(--brand)' : 'white' }}>
                                    {mediaFile ? mediaFile.name : 'Selecionar Arquivo'}
                                </span>
                            </label>
                        </div>

                        <div style={{ textAlign: 'center', opacity: 0.5 }}><span style={{ fontSize: '10px', fontWeight: '900' }}>OU URL MANUAL</span></div>
                        <input name="media_url_manual" style={inputStyle} placeholder="https://..." />

                        <button type="submit" disabled={loading} style={btnSaveStyle}>
                            {loading ? 'PUBLICANDO...' : 'PUBLICAR NO CONECTAR'}
                        </button>
                    </form>
                </div>

                {/* COLUNA DIREITA: MODERAÇÃO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                    <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input placeholder="Filtrar feed..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '48px', height: '48px' }} />
                        </div>
                        <button onClick={loadPosts} style={{ ...tabStyle, width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredPosts.map(post => (
                            <div key={post.id} style={{ 
                                background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', 
                                overflow: 'hidden', opacity: post.is_archived ? 0.5 : 1
                            }}>
                                <div style={{ height: '160px', background: '#000', position: 'relative' }}>
                                    {post.media_type === 'video' ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={40} color="rgba(255,255,255,0.2)" /></div>
                                    ) : (
                                        <img src={post.media_urls?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    )}
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h6 style={{ color: 'white', fontWeight: '800', fontSize: '14px', marginBottom: '8px' }}>{post.author_name}</h6>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px', height: '34px', overflow: 'hidden' }}>{post.caption}</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => toggleArchive(post)} style={{ ...actionBtnStyle, flex: 1 }}>{post.is_archived ? 'REATIVAR' : 'ARQUIVAR'}</button>
                                        <button onClick={() => deletePost(post.id)} style={{ ...actionBtnStyle, width: '48px', color: '#EF4444' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
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
const btnSaveStyle = { width: '100%', padding: '18px', borderRadius: '18px', background: 'var(--brand)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px' };
const tabStyle = { padding: '12px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', fontSize: '12px' };
const actionBtnStyle = { height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default SocialManagementCMS;
