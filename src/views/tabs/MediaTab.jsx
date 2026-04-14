import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, ShieldCheck, RefreshCw, MoreHorizontal, PlusSquare, ChevronRight, BookmarkCheck, Play, Pin, Radio, PlayCircle, Podcast, Clapperboard, MonitorPlay, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchFeedPosts, toggleLikePost, toggleSavePost, postComment, deleteCommentApi, deletePostApi, toggleLikeComment, togglePinPost, toggleArchivePost } from '../../services/social/socialService';
import SocialPostCreator from '../../components/networking/SocialPostCreator';
import PostOptionsModal from '../../components/networking/PostOptionsModal';
import CommentsSheet from '../../components/networking/CommentsSheet';
import MediaPlayerModal from '../../components/media/MediaPlayerModal';

import { useContent } from '../../hooks/useContent';

/**
 * SOCIAL / MEDIA TAB
 * Feed Institucional estilo Instagram + Acervo Digital (Flash, Podcasts, etc)
 */


export default function MediaTab({ userType, userName, userCpf }) {
  const { content: mediaTitle } = useContent('titles', 'page_media');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaAssets, setMediaAssets] = useState([]);
  
  // UI States
  const [showCreator, setShowCreator] = useState(false);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [activeOptionsPost, setActiveOptionsPost] = useState(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [postsData, astData] = await Promise.all([
        fetchFeedPosts(userCpf),
        supabase.from('media_assets')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
      ]);
      
      setPosts(postsData || []);
      setMediaAssets(astData.data || []);
    } catch (e) {
      console.error("[MediaTab] Error loading data:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, [userCpf]);

  // Agrupamento por Categorias para o Acervo Digital
  const groupedAssets = mediaAssets.reduce((acc, asset) => {
    const cat = asset.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {});

  const liveStreams = mediaAssets.filter(a => a.is_live_stream);

  const handleLike = async (postId, currentState) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedByMe: !currentState, likes: currentState ? p.likes - 1 : p.likes + 1 } : p));
    await toggleLikePost(postId, currentState, userCpf);
  };

  const handleSave = async (postId, currentState) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, savedByMe: !currentState } : p));
    await toggleSavePost(postId, currentState, userCpf);
  };

  const handleAddComment = async (postId, text, parentId = null) => {
    const newComment = await postComment(postId, text, userName || 'Congressista', userCpf, parentId);
    if (!newComment) return;
    loadInitialData();
  };

  const handleDeleteComment = async (postId, commentId) => {
    await deleteCommentApi(commentId);
    loadInitialData();
  };

  const handleDeletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await deletePostApi(postId);
  };

  const visiblePosts = (viewingSaved ? posts.filter(p => p.savedByMe) : posts)
    .filter(p => !hiddenPosts.includes(p.id));

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px', background: '#F8F9FA' }}>
      
      {/* HEADER */}
      <section style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 20px 20px', 
        background: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky', top: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewingSaved && <button onClick={() => setViewingSaved(false)} style={{ background: 'none', border: 'none', padding: 0 }}><ChevronRight size={24} color="white" style={{ transform: 'rotate(180deg)' }} /></button>}
          <img src="/logo.png" alt="" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', color: 'white' }}>
            {viewingSaved ? 'Itens Salvos' : 'CONECTAR'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '20px', color: 'white' }}>
            <button onClick={() => setViewingSaved(!viewingSaved)} style={{ background: 'none', border: 'none', padding: 0 }}>
                {viewingSaved ? <BookmarkCheck size={24} color="white" /> : <Bookmark size={24} color="white" />}
            </button>
        </div>
      </section>


      {/* ACERVO DIGITAL (GALERIA DE CATEGORIAS EM MOVIMENTO) */}
      {!viewingSaved && (
        <section style={{ padding: '0 0 20px 0', background: 'white', marginBottom: '12px' }}>
          {Object.keys(groupedAssets).length === 0 && !loading ? (
            null
          ) : (
            Object.entries(groupedAssets).map(([category, assets]) => (
              <div key={category} style={{ marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--secondary)', letterSpacing: '-0.5px' }}>{category}</h5>
                    <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: '700' }}>{assets.length} ITENS</span>
                </div>
                
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '14px', 
                    width: 'max-content',
                    animation: assets.length > 2 ? 'scroll-infinite 35s linear infinite' : 'none',
                    padding: '0 20px'
                  }}>
                    {/* Duplicamos os itens para garantir o loop infinito suave */}
                    {(assets.length > 2 ? [...assets, ...assets] : assets).map((asset, aIdx) => (
                      <div 
                        key={`${asset.id}-${aIdx}`}
                        onClick={() => setSelectedAsset(asset)}
                        style={{ flexShrink: 0, width: '160px', cursor: 'pointer' }}
                      >
                        <div style={{ 
                          width: '160px', height: '100px', borderRadius: '16px', background: '#000', 
                          overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                          {asset.thumbnail_url ? (
                             <img src={asset.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          ) : asset.media_type === 'video' ? (
                            <>
                              <video src={asset.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <Play size={24} color="white" fill="white" />
                              </div>
                            </>
                          ) : asset.media_type === 'image' ? (
                            <img src={asset.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Podcast size={32} color="var(--gold)" />
                            </div>
                          )}
                        </div>
                        <h6 style={{ marginTop: '8px', fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxDirection: 'vertical', overflow: 'hidden' }}>
                          {asset.title}
                        </h6>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* FEED SOCIAL */}
      <h5 style={{ padding: '20px 20px 10px', fontSize: '13px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {viewingSaved ? 'Galeria de Salvos' : 'Feed da Comunidade'}
      </h5>
      
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}>Carregando conexões...</p>
          </div>
        ) : visiblePosts.length === 0 ? (
           <div style={{ padding: '80px 20px', textAlign: 'center' }}>
             <Bookmark size={48} color="rgba(0,0,0,0.1)" style={{ margin: '0 auto 16px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{viewingSaved ? 'Nenhum item salvo' : 'Sem Publicações'}</h3>
           </div>
        ) : (
          visiblePosts.map(post => (
            <article key={post.id} className="fade-in" style={{ 
              background: 'white', 
              borderBottom: '1px solid rgba(0,0,0,0.05)', 
              marginBottom: '12px',
              maxWidth: '600px', // Limite de largura para Desktop (Padrão Instagram)
              margin: '0 auto 12px auto' // Centraliza no Desktop
            }}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: post.isSponsor ? 'white' : 'var(--gold)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '18px',
                    border: post.isSponsor ? `2px solid var(--gold)` : 'none'
                  }}>
                    {post.sponsorAvatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {post.sponsorName}
                      {post.isSponsor && <ShieldCheck size={14} color="#38A169" />}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{post.sponsorRole}</p>
                  </div>
                </div>
                <button onClick={() => setActiveOptionsPost(post)} style={{ background: 'none', border: 'none', padding: '4px' }}>
                  <MoreHorizontal size={20} color="var(--text-muted)" />
                </button>
              </div>

              {/* MEDIA RENDER */}
              <div 
                onClick={() => (post.mediaType === 'video' || post.mediaType === 'reel') && post.mediaUrls?.[0] && setSelectedAsset({ title: post.sponsorName, url: post.mediaUrls[0], description: post.caption, media_type: 'video' })}
                style={{ 
                  width: '100%', 
                  aspectRatio: '1/1', // Proporção quadrada padrão para consistência
                  background: '#111', 
                  borderRadius: '0', 
                  overflow: 'hidden',
                  cursor: (post.mediaType === 'video' || post.mediaType === 'reel') ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                {(post.mediaType === 'video' || post.mediaType === 'reel') ? (
                   <video 
                     src={post.mediaUrls?.[0]} 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                     muted playsInline autoPlay loop 
                   />
                ) : (
                   <img 
                     src={post.mediaUrls?.[0] || post.imageUrl} 
                     alt="" 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                )}
              </div>

              <div style={{ padding: '12px 16px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => handleLike(post.id, post.likedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                            <Heart size={26} color={post.likedByMe ? "#E53E3E" : "var(--text-main)"} fill={post.likedByMe ? "#E53E3E" : "none"} />
                        </button>
                        <button onClick={() => setActiveCommentsPost(post)} style={{ background: 'none', border: 'none', padding: 0 }}>
                            <MessageCircle size={26} color="var(--text-main)" />
                        </button>
                    </div>
                    <button onClick={() => handleSave(post.id, post.savedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                        <Bookmark size={26} color={post.savedByMe ? "var(--primary)" : "var(--text-main)"} fill={post.savedByMe ? "var(--primary)" : "none"} />
                    </button>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '4px' }}>{post.likes.toLocaleString()} curtidas</p>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  <span style={{ fontWeight: '800', marginRight: '6px', color: 'var(--secondary)' }}>{post.sponsorName}</span>
                  {post.caption}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', marginTop: '8px' }}>{post.timeAgo}</p>
              </div>
            </article>
          ))
        )}
      </section>

      {/* MODALS */}
      {selectedAsset && <MediaPlayerModal media={selectedAsset} onClose={() => setSelectedAsset(null)} />}
      
      {activeOptionsPost && (
        <PostOptionsModal 
           post={activeOptionsPost} userType={userType} userName={userName} 
           onClose={() => setActiveOptionsPost(null)} onDelete={handleDeletePost}
        />
      )}

      {activeCommentsPost && (
        <CommentsSheet
           postId={activeCommentsPost.id} comments={posts.find(p => p.id === activeCommentsPost.id)?.comments || []}
           userName={userName} userType={userType} ownerName={activeCommentsPost.sponsorName}
           onClose={() => setActiveCommentsPost(null)} onAddComment={handleAddComment}
           onDeleteComment={handleDeleteComment} onLike={handleLikeComment}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
