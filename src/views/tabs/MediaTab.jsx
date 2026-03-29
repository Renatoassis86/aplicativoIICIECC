import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, ShieldCheck, RefreshCw, MoreHorizontal } from 'lucide-react';
import { fetchFeedPosts, toggleLikePost } from '../../services/social/socialService';

/**
 * SOCIAL / MEDIA TAB
 * Feed Institucional estilo Instagram com posts de Patrocinadores e Expositores.
 * Congressistas rolam (scroll) e apenas curtem engajando no evento.
 */
export default function MediaTab() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await fetchFeedPosts();
      if (isMounted) {
        setPosts(data);
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleLike = async (postId, currentState) => {
    // Optimistic UI Update para fluidez imperceptível de curtida
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { 
          ...p, 
          likedByMe: !currentState, 
          likes: currentState ? p.likes - 1 : p.likes + 1 
        };
      }
      return p;
    }));
    
    // Processamento silencioso no Banco
    await toggleLikePost(postId, currentState);
  };

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px', background: '#F8F9FA' }}>
      
      {/* 1. Header Fixo Superior Instagram-like */}
      <section style={{ 
        padding: '16px 20px', 
        background: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
          Feed Institucional
        </h1>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-main)' }}>
          <Bookmark size={22} />
        </div>
      </section>

      {/* 2. Conteúdo de Loading vs Cards */}
      <section style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '12px'
      }}>
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}>Carregando a rede de novidades...</p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="fade-in" style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              
              {/* Post Header (Patrocinador Avatar) */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--gold)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '18px',
                    border: '2px solid rgba(212, 193, 156, 0.3)'
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
                <MoreHorizontal size={20} color="var(--text-muted)" />
              </div>

              {/* Imagem Premium Central */}
              <div style={{ width: '100%', aspectRatio: '4/4', background: '#e0e0e0', position: 'relative' }}>
                <img 
                  src={post.imageUrl} 
                  alt={post.caption.substring(0, 20)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Bar de Interação */}
              <div style={{ padding: '12px 16px 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={() => handleLike(post.id, post.likedByMe)} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <Heart size={24} color={post.likedByMe ? "#E53E3E" : "var(--text-main)"} fill={post.likedByMe ? "#E53E3E" : "none"} style={{ transition: 'all 0.2s' }} />
                  </button>
                  <button style={{ background: 'none', border: 'none', padding: 0 }}>
                    <MessageCircle size={24} color="var(--text-main)" />
                  </button>
                </div>
                <button style={{ background: 'none', border: 'none', padding: 0 }}>
                  <Bookmark size={24} color="var(--text-main)" />
                </button>
              </div>

              {/* Count de Curtidas & Legenda */}
              <div style={{ padding: '0 16px 16px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>
                  {post.likes.toLocaleString()} curtidas
                </p>
                
                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', marginRight: '6px', color: 'var(--secondary)' }}>
                    {post.sponsorName}
                  </span>
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

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

    </div>
  );
}
