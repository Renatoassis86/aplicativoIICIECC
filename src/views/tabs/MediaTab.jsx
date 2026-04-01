import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, ShieldCheck, RefreshCw, MoreHorizontal, PlusSquare, ChevronRight, BookmarkCheck, Play } from 'lucide-react';
import { fetchFeedPosts, toggleLikePost, toggleSavePost, postComment, deleteCommentApi, deletePostApi, toggleLikeComment } from '../../services/social/socialService';
import SocialPostCreator from '../../components/networking/SocialPostCreator';
import PostOptionsModal from '../../components/networking/PostOptionsModal';
import CommentsSheet from '../../components/networking/CommentsSheet';

/**
 * SOCIAL / MEDIA TAB
 * Feed Institucional estilo Instagram com Algoritmo de Patrocínios.
 * Suporta Carrossel, Imagem Única e Reels.
 */
export default function MediaTab({ userType, userName, userCpf }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showCreator, setShowCreator] = useState(false);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [activeOptionsPost, setActiveOptionsPost] = useState(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);

  // Determina se pode postar
  // Lógica de autorização para postagem (Case Insensitive)
  const userRole = (userType || 'congressista').toLowerCase();
  const allowedRoles = ['expositor', 'parceiro', 'palestrante', 'staff', 'admin', 'organizador', 'patrocinador', 'master', 'sponsor', 'mantenedor'];
  const canPost = allowedRoles.some(role => userRole.includes(role));

  console.log('[MediaTab] User:', userName, 'Role:', userRole, 'CanPost:', canPost);

  const loadPosts = async () => {
    setLoading(true);
    const data = await fetchFeedPosts(userCpf);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

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
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (parentId) {
          return {
            ...p,
            comments: p.comments.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c)
          };
        }
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));
  };

  const handleDeleteComment = async (postId, commentId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));
    await deleteCommentApi(commentId);
  };

  const handleLikeComment = async (postId, commentId, currentState, isReply = false) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
         return {
           ...p,
           comments: p.comments.map(c => {
             if (c.id === commentId && !isReply) return { ...c, likedByMe: !currentState, likes: currentState ? c.likes - 1 : c.likes + 1 };
             if (isReply) {
                return { ...c, replies: c.replies ? c.replies.map(r => r.id === commentId ? { ...r, likedByMe: !currentState } : r) : [] };
             }
             return c;
           })
         };
      }
      return p;
    }));
    await toggleLikeComment(commentId, currentState, userCpf);
  };

  const handleDeletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await deletePostApi(postId);
  };

  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const visiblePosts = viewingSaved ? posts.filter(p => p.savedByMe) : posts;

  // Renderiza a mídia baseada no tipo (Image, Carousel, Reel)
  const [muted, setMuted] = useState(true);

  const renderMedia = (post) => {
    if (post.mediaType === 'reel' || (post.mediaUrls[0]?.endsWith('.mp4'))) {
      return (
        <div 
          onClick={() => setMuted(!muted)}
          style={{ width: '100%', aspectRatio: '4/5', background: '#000', position: 'relative', cursor: 'pointer' }}
        >
          <video 
            src={post.mediaUrls[0]} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            autoPlay loop muted={muted} playsInline 
          />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', color: 'white' }}>
            {muted ? <RefreshCw size={16} /> : <Play size={16} />}
          </div>
          {muted && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '50%' }}>
              <Play size={32} color="white" fill="white" />
            </div>
          )}
        </div>
      );
    }
    
    // Se for carousel ou imagem única, usamos object-fit: contain dentro de um fundo preto 
    // ou mantemos o 4/5 para padronização de feed. O Instagram usa 4/5 (portrait) ou 1:1.
    // Para aceitar 'qualquer uma', removemos o aspectRatio fixo e usamos minHeight.
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '200px', 
        maxHeight: '600px',
        background: '#000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {post.mediaType === 'carousel' ? (
           <div style={{ width: '100%', display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            {post.mediaUrls.map((url, i) => (
              <div key={i} style={{ minWidth: '100%', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={url} alt="carousel" style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }} />
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                  {i + 1} / {post.mediaUrls.length}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <img 
             src={post.mediaUrls[0] || post.imageUrl} 
             alt="feed" 
             style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }} 
          />
        )}
      </div>
    );
  };

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px', background: '#F8F9FA' }}>
      
      {/* HEADER FIXO INSTAGRAM-STYLE */}
      <section style={{ 
        padding: '16px 20px', background: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewingSaved && <button onClick={() => setViewingSaved(false)} style={{ background: 'none', border: 'none', padding: 0 }}><ChevronRight size={24} color="white" style={{ transform: 'rotate(180deg)' }} /></button>}
          <img src="/logo.png" alt="" style={{ height: '24px', marginRight: '4px', filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', color: 'white' }}>
            {viewingSaved ? 'Itens Salvos' : 'Feed Social'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '20px', color: 'white' }}>
          {canPost && !viewingSaved && (
            <button onClick={() => setShowCreator(true)} style={{ background: 'none', border: 'none', padding: 0, position: 'relative' }}>
              <PlusSquare size={24} color="white" />
            </button>
          )}
          <button onClick={() => setViewingSaved(!viewingSaved)} style={{ background: 'none', border: 'none', padding: 0 }}>
            {viewingSaved ? <BookmarkCheck size={24} color="white" /> : <Bookmark size={24} color="white" />}
          </button>
        </div>
      </section>

      {/* FEED CONTEÚDO */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}>Carregando a rede...</p>
          </div>
        ) : visiblePosts.length === 0 ? (
           <div style={{ padding: '80px 20px', textAlign: 'center' }}>
             <Bookmark size={48} color="rgba(0,0,0,0.1)" style={{ margin: '0 auto 16px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{viewingSaved ? 'Nenhum item salvo' : 'Nenhuma publicação'}</h3>
             <p style={{ color: 'var(--text-muted)' }}>{viewingSaved ? 'Suas publicações favoritas aparecerão aqui.' : 'O feed está vazio no momento.'}</p>
           </div>
        ) : (
          visiblePosts.map(post => (
            <article key={post.id} className="fade-in" style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              
              {/* Post Header */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: post.tier ? 'white' : 'var(--gold)', color: post.tier ? post.tier.color : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '18px',
                    border: post.tier ? `2px solid ${post.tier.color}` : '2px solid rgba(212, 193, 156, 0.3)'
                  }}>
                    {post.sponsorAvatar}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {post.sponsorName}
                      {post.isSponsor && <ShieldCheck size={14} color="#38A169" />}
                    </h4>
                    {/* Badge do Tier Algorítmico */}
                    {post.tier ? (
                       <p style={{ fontSize: '11px', color: post.tier.color, fontWeight: '800', textTransform: 'uppercase' }}>{post.tier.name}</p>
                    ) : (
                       <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{post.sponsorRole}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveOptionsPost(post)} style={{ background: 'none', border: 'none', padding: '4px' }}>
                  <MoreHorizontal size={20} color="var(--text-muted)" />
                </button>
              </div>

              {/* Mídia Dinâmica (Reel, Carousel, IMG) */}
              {renderMedia(post)}

              {/* Barra de Ações */}
              <div style={{ padding: '12px 16px 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleLike(post.id, post.likedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <Heart size={26} color={post.likedByMe ? "#E53E3E" : "var(--text-main)"} fill={post.likedByMe ? "#E53E3E" : "none"} style={{ transition: 'all 0.2s' }} />
                  </button>
                  <button onClick={() => setActiveCommentsPost(post)} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <MessageCircle size={26} color="var(--text-main)" />
                  </button>
                </div>
                <button onClick={() => handleSave(post.id, post.savedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                   <Bookmark size={26} color={post.savedByMe ? "var(--primary)" : "var(--text-main)"} fill={post.savedByMe ? "var(--primary)" : "none"} style={{ transition: 'all 0.2s' }} />
                </button>
              </div>

              {/* Curtidas & Legenda */}
              <div style={{ padding: '0 16px 16px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>
                  {post.likes.toLocaleString()} curtidas
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', marginRight: '6px', color: 'var(--secondary)' }}>{post.sponsorName}</span>
                  {post.caption}
                </p>
                
                {/* Primeiros 3 Comentários */}
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    {post.comments.slice(0, 3).map(c => (
                      <p key={c.id} style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', marginRight: '6px' }}>{c.authorName}</span>
                        {c.text}
                      </p>
                    ))}
                  </div>
                )}

                {(post.comments && post.comments.length > 3) && (
                  <button onClick={() => setActiveCommentsPost(post)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Ver todos os {post.comments.length} comentários
                  </button>
                )}
                {(!post.comments || post.comments.length <= 3) && post.comments?.length > 0 && (
                  <button onClick={() => setActiveCommentsPost(post)} style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Responder...
                  </button>
                )}
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '600' }}>
                  {post.timeAgo}
                </p>
              </div>
            </article>
          ))
        )}
      </section>

      {/* MODAL DE CRIAÇÃO (EXCLUSIVO PARA PATROCINADORES) */}
      {showCreator && (
        <SocialPostCreator 
          sponsorName={userName || 'Expositor'} 
          sponsorRole={userType || 'sponsor'}
          userId={userCpf}
          onClose={() => setShowCreator(false)} 
          onSuccess={() => { setShowCreator(false); loadPosts(); }} 
        />
      )}

      {/* MODALS DA INTEGRAÇÃO INSTAGRAM */}
      {activeOptionsPost && (
        <PostOptionsModal 
           post={activeOptionsPost} 
           userType={userType} 
           userName={userName} 
           onClose={() => setActiveOptionsPost(null)} 
           onDelete={handleDeletePost}
           onHide={handleHidePost}
        />
      )}

      {activeCommentsPost && (
        <CommentsSheet
           postId={activeCommentsPost.id}
           comments={posts.find(p => p.id === activeCommentsPost.id)?.comments || []}
           userName={userName}
           userType={userType}
           ownerName={activeCommentsPost.sponsorName}
           onClose={() => setActiveCommentsPost(null)}
           onAddComment={handleAddComment}
           onDeleteComment={handleDeleteComment}
           onLike={handleLikeComment}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
