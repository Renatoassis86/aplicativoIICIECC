import React, { useState } from 'react';
import { X, Send, Heart, Trash2 } from 'lucide-react';

/**
 * Interface Deslizante de Comentários Integrada Sub-Rede (Instagram-like).
 * @param {Array} comments Lista inicial de comments passada pela tab de media
 * @param {Function} onAddComment Injeta comentário novo no escopo base
 * @param {Function} onDeleteComment Remove do escopo se for Staff/Author
 * @param {Function} onLike Toggle the like heart
 */
const CommentsSheet = ({ postId, comments, userName, userType, ownerName, onClose, onAddComment, onDeleteComment, onLike }) => {
  const [text, setText] = useState('');
  
  // Condição para remover: quem escreveu ou quem é dono/staff
  const canDelete = (author) => userType === 'staff' || userName === ownerName || userName === author;

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(postId, text.trim());
    setText('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'white', zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Header Fixo de Comentários */}
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'relative'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>Comentários</h3>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', padding: '4px' }}>
          <X size={24} color="var(--text-main)" />
        </button>
      </header>

      {/* Lista de Comentários */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {comments && comments.length > 0 ? comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            
            {/* Avatar do Comentador */}
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--bg-app)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '16px',
              flexShrink: 0
            }}>
              {c.authorAvatar || c.authorName.charAt(0)}
            </div>

            {/* Conteúdo Central */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '800', color: 'var(--secondary)', display: 'inline-block', marginRight: '6px' }}>
                  {c.authorName}
                </span>
                {c.text}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agorinha</span>
                {c.likes > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{c.likes} curtidas</span>}
                <button style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', padding: 0 }}>
                  Responder
                </button>
                {canDelete(c.authorName) && (
                  <button onClick={() => onDeleteComment(postId, c.id)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#E53E3E', fontWeight: '600', padding: 0 }}>
                    <Trash2 size={12} style={{ display: 'inline', marginRight: '2px' }}/> Excluir
                  </button>
                )}
              </div>

              {/* Nested Replies Rendering */}
              {c.replies && c.replies.length > 0 && c.replies.map(r => (
                <div key={r.id} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                    {r.authorAvatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.3' }}>
                      <span style={{ fontWeight: '800', color: 'var(--secondary)', marginRight: '4px' }}>{r.authorName}</span>
                      {r.text}
                    </p>
                  </div>
                  <button onClick={() => onLike(postId, r.id, r.likedByMe, true)} style={{ background: 'none', border: 'none', padding: 0 }}>
                    <Heart size={14} color={r.likedByMe ? "#E53E3E" : "var(--text-muted)"} fill={r.likedByMe ? "#E53E3E" : "none"} />
                  </button>
                </div>
              ))}
            </div>

            {/* Like Externo do Comentário */}
            <button onClick={() => onLike(postId, c.id, c.likedByMe, false)} style={{ background: 'none', border: 'none', padding: '0 4px', height: 'fit-content', marginTop: '2px' }}>
               <Heart size={14} color={c.likedByMe ? "#E53E3E" : "var(--text-muted)"} fill={c.likedByMe ? "#E53E3E" : "none"} />
            </button>
          </div>
        )) : (
          <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.6 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Seja o primeiro a comentar.</p>
          </div>
        )}
      </div>

      {/* Caixa Fixa de Input de Comentário Lateral Mobile Ajustada */}
      <footer style={{ 
        padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: '12px', background: 'white',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'
      }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-app)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' 
        }}>
          {userName?.charAt(0) || 'U'}
        </div>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Adicione um comentário..." 
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ 
              width: '100%', padding: '10px 40px 10px 16px', 
              borderRadius: '24px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '14px' 
            }} 
          />
          <button 
            disabled={!text.trim()} 
            onClick={handleSend}
            style={{ 
              position: 'absolute', right: '12px', background: 'none', border: 'none', padding: 0,
              color: text.trim() ? 'var(--primary)' : 'rgba(0,0,0,0.2)', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center',
              cursor: text.trim() ? 'pointer' : 'default'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default CommentsSheet;
