import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, Heart, Trash2, Shield, 
  CheckCircle, XCircle, Search, Filter, 
  MoreHorizontal, Eye, Flag, Share2, 
  User, Calendar, Clock, Image as ImageIcon,
  Video, Play, Bookmark, Archive, PlusSquare, Upload,
  Camera, Film, Podcast, Send, RefreshCw, MapPin, UserPlus, Edit3,
  LayoutGrid, List
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const SocialManagementCMS = () => {
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState('image');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [editingItem, setEditingItem] = useState(null);
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [isSponsorPost, setIsSponsorPost] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' ou 'list'

    useEffect(() => {
        loadPosts();
        loadMembers();
        loadSponsors();
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

    const loadMembers = async () => {
        const { data } = await supabase.from('members').select('cpf, name').limit(100);
        if (data) setMembers(data);
    };

    const loadSponsors = async () => {
        const { data } = await supabase.from('sponsors').select('*').eq('active', true).order('name');
        if (data) setSponsors(data);
    };

    const triggerSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccess(true);
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        try {
            console.log("[SocialCMS] Iniciando upload:", file.name);
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `social/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('app_media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("[SocialCMS] Erro no storage:", uploadError);
                throw new Error(`Falha no Upload: ${uploadError.message}`);
            }
            
            const { data: { publicUrl } } = supabase.storage.from('app_media').getPublicUrl(filePath);
            console.log("[SocialCMS] Public URL gerada:", publicUrl);
            return publicUrl;
        } catch (error) {
            console.error("Upload error details:", error);
            throw error; // Repassar o erro para o handleSave tratar
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        setLoading(true);
        try {
            let mediaUrl = editingItem?.media_urls?.[0]; // Mantém o antigo por padrão se estiver editando
            
            if (mediaFile) {
                // Se houver novo arquivo, tenta upload
                const uploaded = await handleFileUpload(mediaFile);
                if (uploaded) mediaUrl = uploaded;
            }

            // Mapeamento de Tiers para Níveis numéricos (Ouro é a cota máxima no site)
            const tierMap = { 'ouro': 4, 'prata': 2, 'bronze': 1, 'organizador': 4, 'apoio': 1 };
            const authorTier = isSponsorPost ? (tierMap[selectedSponsor?.tier] || 4) : 4;

            const payload = {
                author_name: isSponsorPost ? selectedSponsor.name : (data.author_name || 'Organização CIECC'),
                author_role: isSponsorPost ? `Patrocinador ${selectedSponsor.tier}` : (data.author_role || 'Comunicado Oficial'),
                author_tier: authorTier,
                content_type: mediaType,
                media_urls: mediaUrl ? [mediaUrl] : [],
                caption: data.caption,
                user_id: editingItem?.user_id || 'SYSTEM_ADMIN',
                media_type: mediaType,
                location_name: data.location_name,
                tagged_user_ids: taggedUsers.map(u => u.cpf),
                is_pinned: editingItem?.is_pinned || false,
                is_archived: editingItem?.is_archived || false
            };

            console.log("[SocialCMS] Salvando Payload:", payload);

            if (editingItem) {
                const { error } = await supabase
                    .from('social_posts')
                    .update(payload)
                    .eq('id', editingItem.id);
                if (error) throw error;
                triggerSuccess('Post atualizado com sucesso!');
            } else {
                const { error } = await supabase.from('social_posts').insert({
                    ...payload,
                    created_at: new Date().toISOString()
                });
                if (error) throw error;
                triggerSuccess('Post publicado com sucesso!');
            }

            resetForm();
            loadPosts();
        } catch (err) {
            console.error("[SocialCMS] Erro crítico:", err);
            alert('🚫 Erro ao processar publicação: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setMediaFile(null);
        setMediaType('image');
        setTaggedUsers([]);
        setShowTagMenu(false);
        setIsSponsorPost(false);
        setSelectedSponsor(null);
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

    const startEdit = (post) => {
        setEditingItem(post);
        setMediaType(post.media_type || 'image');
        setTaggedUsers(post.tagged_users_json || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTagUser = (user) => {
        if (taggedUsers.find(u => u.cpf === user.cpf)) {
            setTaggedUsers(prev => prev.filter(u => u.cpf !== user.cpf));
        } else {
            setTaggedUsers(prev => [...prev, user]);
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

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Feed Social & Conectar</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Gerenciamento e moderação oficial da comunidade.</p>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <PlusSquare size={24} color="var(--brand)" />
                           <h4 style={{ fontWeight: '900', fontSize: '18px', color: 'white' }}>
                               {editingItem ? 'Editar Publicação' : 'Nova Postagem Oficial'}
                           </h4>
                        </div>
                        {editingItem && (
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}>CANCELAR</button>
                        )}
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
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

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '18px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>POSTAR COMO PATROCINADOR?</label>
                                <input 
                                    type="checkbox" 
                                    checked={isSponsorPost} 
                                    onChange={(e) => setIsSponsorPost(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </div>
                            
                            {isSponsorPost ? (
                                <select 
                                    style={inputStyle}
                                    onChange={(e) => {
                                        const sp = sponsors.find(s => s.id === e.target.value);
                                        setSelectedSponsor(sp);
                                    }}
                                    value={selectedSponsor?.id || ""}
                                >
                                    <option value="">Selecione o Patrocinador...</option>
                                    {sponsors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tier})</option>)}
                                </select>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>Autor Principal</label>
                                        <input name="author_name" defaultValue={editingItem?.author_name || "Organização CIECC"} required={!isSponsorPost} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Cargo/Selo</label>
                                        <input name="author_role" defaultValue={editingItem?.author_role || "Comunicado Oficial"} required={!isSponsorPost} style={inputStyle} />
                                    </div>
                                </div>
                            )}

                            {isSponsorPost && selectedSponsor && (
                                <input type="hidden" name="author_name" value={selectedSponsor.name} />
                            )}
                            {isSponsorPost && selectedSponsor && (
                                <input type="hidden" name="author_role" value={`Patrocinador ${selectedSponsor.tier}`} />
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>📍 LOCALIZAÇÃO</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} color="var(--brand)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input name="location_name" defaultValue={editingItem?.location_name} style={{ ...inputStyle, paddingLeft: '48px' }} placeholder="Ex: Auditório Principal, São Paulo..." />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>👥 MARCAR PESSOAS ({taggedUsers.length})</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {taggedUsers.map(u => (
                                    <div key={u.cpf} style={{ background: 'var(--brand)', color: 'black', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {u.name}
                                        <XCircle size={14} style={{ cursor: 'pointer' }} onClick={() => handleTagUser(u)} />
                                    </div>
                                ))}
                                <button type="button" onClick={() => setShowTagMenu(!showTagMenu)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                                    + ADICIONAR
                                </button>
                            </div>

                            {showTagMenu && (
                                <div style={{ background: '#1A1A1A', borderRadius: '16px', border: '1px solid var(--border-color)', maxHeight: '200px', overflowY: 'auto', padding: '8px' }} className="no-scrollbar">
                                    {members.map(member => (
                                        <div 
                                            key={member.cpf} 
                                            onClick={() => handleTagUser(member)}
                                            style={{ 
                                                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                                background: taggedUsers.find(u => u.cpf === member.cpf) ? 'rgba(212, 193, 156, 0.2)' : 'transparent',
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                borderBottom: '1px solid rgba(255,255,255,0.03)'
                                            }}
                                        >
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '900', fontSize: '12px' }}>{member.name[0]}</div>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{member.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Legenda Completa</label>
                            <textarea name="caption" defaultValue={editingItem?.caption} required style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} placeholder="Escreva o que está acontecendo..." />
                        </div>

                        <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <input type="file" id="social_file_upload" style={{ display: 'none' }} onChange={(e) => setMediaFile(e.target.files[0])} />
                            <label htmlFor="social_file_upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <Upload size={24} color="var(--brand)" />
                                <span style={{ fontSize: '13px', fontWeight: '700', color: mediaFile ? 'var(--brand)' : 'white' }}>
                                    {mediaFile ? mediaFile.name : editingItem?.media_urls?.[0] ? 'Arquivo Atual (Mudar?)' : 'Selecionar Arquivo'}
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading} style={btnSaveStyle}>
                            {loading ? 'PROCESSANDO...' : editingItem ? 'ATUALIZAR PUBLICAÇÃO' : 'PUBLICAR NO CONECTAR'}
                        </button>
                    </form>

                    {/* GUIA DE POSTAGEM */}
                    <div style={{ marginTop: '32px', background: 'rgba(212, 193, 156, 0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(212, 193, 156, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Shield size={20} color="var(--brand)" />
                            <h5 style={{ fontWeight: '900', fontSize: '14px', color: 'white', letterSpacing: '0.5px' }}>GUIA DE MELHORES PRÁTICAS</h5>
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '16px' }}>
                            Para garantir que o Feed Conectar fique visualmente profissional e sem barras pretas, recomendamos os seguintes formatos:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ImageIcon size={18} color="var(--brand)" />
                                </div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block' }}>Fotos Quadradas (1:1)</strong>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>1080 x 1080 px</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(212, 193, 156, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '12px', height: '16px', border: '2px solid var(--brand)', borderRadius: '2px' }}></div>
                                </div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block' }}>Fotos Verticais (4:5)</strong>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>1080 x 1350 px (Recomendado para Mobile)</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Video size={18} color="var(--brand)" />
                                </div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block' }}>Vídeos Curtos</strong>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Preferencialmente verticais (9:16) ou 4:5.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
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

                    <div style={{ 
                        display: layoutMode === 'grid' ? 'grid' : 'flex', 
                        gridTemplateColumns: layoutMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
                        flexDirection: layoutMode === 'grid' ? 'none' : 'column',
                        gap: '20px' 
                    }}>
                        {filteredPosts.map(post => (
                            <div key={post.id} style={{ 
                                background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', 
                                overflow: 'hidden', opacity: post.is_archived ? 0.5 : 1, transition: 'all 0.3s',
                                display: layoutMode === 'list' ? 'flex' : 'block',
                                height: layoutMode === 'list' ? '120px' : 'auto'
                            }}>
                                <div style={{ 
                                    height: layoutMode === 'list' ? '100%' : '160px', 
                                    width: layoutMode === 'list' ? '160px' : '100%',
                                    background: '#000', position: 'relative', flexShrink: 0 
                                }}>
                                    {post.media_type === 'video' ? (
                                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                            <video src={post.media_urls?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                                <Play size={24} color="white" fill="white" />
                                            </div>
                                        </div>
                                    ) : post.media_type === 'audio' ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Podcast size={40} color="var(--brand)" /></div>
                                    ) : (
                                        <img src={post.media_urls?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    )}
                                    {post.location_name && layoutMode === 'grid' && (
                                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                                            <MapPin size={12} color="var(--brand)" /> {post.location_name}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ marginBottom: layoutMode === 'list' ? '4px' : '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h6 style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{post.author_name}</h6>
                                            <p style={{ fontSize: '10px', color: 'var(--brand)', fontWeight: '700' }}>{post.author_role}</p>
                                        </div>
                                        {layoutMode === 'list' && post.location_name && (
                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{post.location_name}</span>
                                        )}
                                    </div>

                                    {layoutMode === 'grid' && (
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px', height: '34px', overflow: 'hidden' }}>{post.caption}</p>
                                    )}
                                    
                                    {post.tagged_users_json?.length > 0 && layoutMode === 'grid' && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                                            {post.tagged_users_json.map((u, idx) => (
                                                <span key={idx} style={{ fontSize: '9px', color: 'var(--brand)', fontWeight: '800' }}>@{u.name}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => startEdit(post)} style={{ ...actionBtnStyle, flex: 1, color: 'var(--brand)' }}>
                                            <Edit3 size={14} style={{ marginRight: layoutMode === 'grid' ? '6px' : '0' }} /> {layoutMode === 'grid' ? 'EDITAR' : ''}
                                        </button>
                                        <button onClick={() => toggleArchive(post)} style={{ ...actionBtnStyle, flex: 1 }}>
                                            {post.is_archived ? 'REATIVAR' : 'ARQUIVAR'}
                                        </button>
                                        <button onClick={() => deletePost(post.id)} style={{ ...actionBtnStyle, width: '48px', color: '#EF4444' }}>
                                            <Trash2 size={16} />
                                        </button>
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
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' };
const btnSaveStyle = { width: '100%', padding: '18px', borderRadius: '18px', background: 'var(--brand)', color: 'black', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px', fontSize: '14px', letterSpacing: '1px' };
const tabStyle = { padding: '12px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', fontSize: '12px' };
const actionBtnStyle = { height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };

export default SocialManagementCMS;
