import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, ShieldCheck, RefreshCw, MoreHorizontal, PlusSquare, ChevronRight, BookmarkCheck, Play } from 'lucide-react';
import { fetchFeedPosts, toggleLikePost, toggleSavePost } from '../../services/social/socialService';
import SocialPostCreator from '../../components/networking/SocialPostCreator';

/**
 * SOCIAL / MEDIA TAB
 * Feed Institucional estilo Instagram com Algoritmo de Patrocínios.
 * Suporta Carrossel, Imagem Única e Reels.
 */
export default function MediaTab({ userType, userName }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showCreator, setShowCreator] = useState(false);
  const [viewingSaved, setViewingSaved] = useState(false);

  // Determina se pode postar
  const canPost = ['expositor', 'parceiro', 'palestrante', 'staff'].includes(userType);

  const loadPosts = async () => {
    setLoading(true);
    const data = await fetchFeedPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId, currentState) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likedByMe: !currentState, likes: currentState ? p.likes - 1 : p.likes + 1 } : p));
    await toggleLikePost(postId, currentState);
  };

  const handleSave = async (postId, currentState) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, savedByMe: !currentState } : p));
    await toggleSavePost(postId, currentState);
  };

  const visiblePosts = viewingSaved ? posts.filter(p => p.savedByMe) : posts;

  // Renderiza a mídia baseada no tipo (Image, Carousel, Reel)
  const renderMedia = (post) => {
    if (post.mediaType === 'reel') {
      return (
        <div style={{ width: '100%', aspectRatio: '4/5', background: '#000', position: 'relative' }}>
          <video 
            src={post.mediaUrls[0]} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            controls={false} autoPlay loop muted playsInline 
          />
          <div style={{ position: 'absolute', top: '16px', right: '16px', color: 'white' }}><Play size={20} fill="white" /></div>
        </div>
      );
    }
    
    if (post.mediaType === 'carousel' && post.mediaUrls.length > 1) {
      return (
        <div style={{ width: '100%', aspectRatio: '4/5', display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
          {post.mediaUrls.map((url, i) => (
            <div key={i} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start', position: 'relative' }}>
              <img src={url} alt="carousel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                {i + 1} / {post.mediaUrls.length}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Single Image Default
    return (
      <div style={{ width: '100%', aspectRatio: '4/5', background: '#e0e0e0', position: 'relative' }}>
        <img src={post.mediaUrls[0] || post.imageUrl} alt="feed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  };

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px', background: '#F8F9FA' }}>
      
      {/* HEADER FIXO INSTAGRAM-STYLE */}
      <section style={{ 
        padding: '16px 20px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewingSaved && <button onClick={() => setViewingSaved(false)} style={{ background: 'none', border: 'none', padding: 0 }}><ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /></button>}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
            {viewingSaved ? 'Itens Salvos' : 'Feed Social'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '20px', color: 'var(--text-main)' }}>
          {canPost && !viewingSaved && (
            <button onClick={() => setShowCreator(true)} style={{ background: 'none', border: 'none', padding: 0, position: 'relative' }}>
              <PlusSquare size={24} color="var(--primary)" />
            </button>
          )}
          <button onClick={() => setViewingSaved(!viewingSaved)} style={{ background: 'none', border: 'none', padding: 0 }}>
            {viewingSaved ? <BookmarkCheck size={24} color="var(--primary)" /> : <Bookmark size={24} />}
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
                <MoreHorizontal size={20} color="var(--text-muted)" />
              </div>

              {/* Mídia Dinâmica (Reel, Carousel, IMG) */}
              {renderMedia(post)}

              {/* Barra de Ações */}
              <div style={{ padding: '12px 16px 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleLike(post.id, post.likedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <Heart size={26} color={post.likedByMe ? "#E53E3E" : "var(--text-main)"} fill={post.likedByMe ? "#E53E3E" : "none"} style={{ transition: 'all 0.2s' }} />
                  </button>
                  <button style={{ background: 'none', border: 'none', padding: 0 }}>
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
          onClose={() => setShowCreator(false)} 
          onSuccess={() => { setShowCreator(false); loadPosts(); }} 
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
