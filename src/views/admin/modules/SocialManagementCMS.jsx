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
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'image', 'video'

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

            {/* FILTROS E BUSCA */}
            <div style={{ 
                background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', 
                border: '1px solid var(--border-color)', marginBottom: '32px',
                display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center'
            }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
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
                </div>

                <button onClick={loadPosts} disabled={loading} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>
                    <Users size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* GRID DE POSTS */}
            <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                {filteredPosts.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                        <MessageCircle size={64} style={{ opacity: 0.1, marginBottom: '20px', margin: '0 auto' }} />
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '700', fontSize: '18px' }}>Nenhuma publicação encontrada.</p>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <div key={post.id} style={{ 
                            background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--border-color)',
                            overflow: 'hidden', position: 'relative', transition: 'all 0.3s ease',
                            opacity: post.is_archived ? 0.6 : 1
                        }}>
                            {/* MEDIA PREVIEW */}
                            <div style={{ width: '100%', height: '200px', background: '#000', position: 'relative' }}>
                                {post.media_type === 'video' ? (
                                    <video src={post.media_urls?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                ) : (
                                    <img src={post.media_urls?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'white', fontWeight: '900' }}>
                                    {post.media_type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                                    {post.media_type?.toUpperCase()}
                                </div>
                                {post.is_archived && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px', letterSpacing: '2px' }}>ARQUIVADO</div>}
                            </div>

                            {/* CONTENT */}
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                                        {post.author_avatar || post.author_name?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h5 style={{ color: 'white', fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.author_name}</h5>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{post.author_role}</p>
                                    </div>
                                </div>

                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.5', minHeight: '63px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                                    {post.caption || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Sem legenda...</span>}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Heart size={16} color="#EF4444" fill="#EF4444" />
                                        <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>{post.likes_count || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageCircle size={16} color="var(--brand)" />
                                        <span style={{ color: 'white', fontWeight: '800', fontSize: '12px' }}>{post.comments_count || 0}</span>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'right', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '600' }}>
                                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => toggleArchive(post)} 
                                        style={{ ...actionBtnStyle, flex: 1, background: post.is_archived ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                                    >
                                        {post.is_archived ? <Eye size={18} /> : <Archive size={18} />}
                                        {post.is_archived ? 'RESTAURAR' : 'ARQUIVAR'}
                                    </button>
                                    <button 
                                        onClick={() => deletePost(post.id)} 
                                        style={{ ...actionBtnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', width: '56px' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
