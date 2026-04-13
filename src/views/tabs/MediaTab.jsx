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

const NativeCarousel = ({ title, items, onSelect }) => {
  if (items.length === 0) return null;
  
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h5 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h5>
        <div style={{ padding: '2px 8px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)' }}>{items.length} ITENS</div>
      </div>
      <div 
        style={{ 
          display: 'flex', gap: '14px', overflowX: 'auto', padding: '0 20px 10px',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
        }}
        className="no-scrollbar"
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelect(item)}
            style={{ 
              flexShrink: 0, width: '160px', cursor: 'pointer',
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ width: '100%', height: '100px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {item.media_type === 'image' ? (
                   <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : item.media_type === 'video' ? (
                   <Clapperboard color="white" size={32} opacity={0.3} />
                ) : (
                   <Podcast color="white" size={32} opacity={0.3} />
                )}
                
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)' }}></div>
                
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--primary)', padding: '6px', borderRadius: '50%' }}>
                    {item.media_type === 'image' ? <Camera size={12} color="white" /> : <Play size={12} color="white" fill="white" />}
                </div>
            </div>
            <div style={{ padding: '12px' }}>
               <h6 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', height: '32px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.2' }}>{item.title}</h6>
               <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                 {item.media_type === 'image' ? 'Foto' : item.media_type === 'video' ? 'Vídeo' : 'Áudio'}
               </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
        supabase.from('media_assets').select('*').order('created_at', { ascending: false })
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

      {/* AO VIVO / DESTAQUE */}
      {liveStreams.length > 0 && !viewingSaved && (
        <section style={{ padding: '20px 20px 0' }}>
            {liveStreams.map(live => (
                <div key={live.id} onClick={() => setSelectedAsset(live)} style={{ 
                    background: 'linear-gradient(90deg, #4A101D 0%, #6B141A 100%)', 
                    borderRadius: '24px', padding: '20px', color: 'white', display: 'flex', gap: '16px', alignItems: 'center',
                    boxShadow: '0 8px 24px var(--primary-glow)', border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '24px', cursor: 'pointer'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Radio size={28} className="animate-pulse" />
                        </div>
                        <span style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '11px', fontWeight: '900', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>Transmissão em Tempo Real</p>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{live.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', opacity: 0.8 }}>
                            <MonitorPlay size={14} /> <span style={{ fontSize: '12px', fontWeight: '600' }}>Toque para assistir agora</span>
                        </div>
                    </div>
                    <ChevronRight size={20} color="var(--gold)" />
                </div>
            ))}
        </section>
      )}

      {/* ACERVO DIGITAL (Flash, Podcasts, etc) */}
      {!viewingSaved && (
        <div style={{ paddingTop: '20px' }}>
          {Object.entries(groupedAssets).filter(([k]) => k !== 'Outros').map(([category, items]) => (
            <NativeCarousel 
              key={category} 
              title={category} 
              items={items} 
              onSelect={setSelectedAsset} 
            />
          ))}
        </div>
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
            <article key={post.id} className="fade-in" style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}>
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
                onClick={() => post.mediaType === 'reel' && post.mediaUrls?.[0] && setSelectedAsset({ title: post.sponsorName, url: post.mediaUrls[0], description: post.caption, media_type: 'video' })}
                style={{ width: '100%', background: '#000', borderRadius: '0', cursor: post.mediaType === 'reel' ? 'pointer' : 'default' }}
              >
                {post.mediaType === 'reel' ? (
                   <video src={post.mediaUrls?.[0]} style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} muted playsInline autoPlay loop />
                ) : (
                   <img src={post.mediaUrls?.[0] || post.imageUrl} alt="" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} />
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
