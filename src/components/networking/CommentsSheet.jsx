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
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }
  
  // Condição para remover: quem escreveu ou quem é dono/staff
  const canDelete = (author) => userType === 'staff' || userName === ownerName || userName === author;

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(postId, text.trim(), replyingTo?.id);
    setText('');
    setReplyingTo(null);
  };

  const startReply = (comment) => {
    setReplyingTo({ id: comment.id, name: comment.authorName });
    setText(''); // Limpa ou mantém? Geralmente limpa o prefixo se quiser @
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
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>Publicação</h3>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', padding: '4px' }}>
          <X size={24} color="var(--text-main)" />
        </button>
      </header>

      {/* Lista de Comentários */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        
        {/* Contexto da Legenda (Opcional - Post Owner) */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
           <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
             {ownerName?.charAt(0)}
           </div>
           <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '800', marginRight: '6px' }}>{ownerName}</span>
                Publicação original
              </p>
           </div>
        </div>

        {comments && comments.length > 0 ? comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: '12px', padding: '16px 0' }}>
            
            {/* Avatar do Comentador */}
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--bg-app)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '14px',
              flexShrink: 0
            }}>
              {c.authorAvatar || c.authorName?.charAt(0)}
            </div>

            {/* Conteúdo Central */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '700', color: 'var(--secondary)', display: 'inline-block', marginRight: '6px' }}>
                  {c.authorName}
                </span>
                {c.text}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agorinha</span>
                {c.likes > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{c.likes} curtidas</span>}
                <button 
                  onClick={() => startReply(c)}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', padding: 0 }}
                >
                  Responder
                </button>
                {canDelete(c.authorName) && (
                  <button onClick={() => onDeleteComment(postId, c.id)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#E53E3E', fontWeight: '600', padding: 0 }}>
                    Excluir
                  </button>
                )}
              </div>

              {/* Nested Replies Rendering (Threads) */}
              {c.replies && c.replies.length > 0 && (
                <div style={{ paddingLeft: '12px', borderLeft: '1px solid #efefef', marginTop: '12px' }}>
                   {c.replies.map(r => (
                      <div key={r.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                         <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F8F9FA', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                           {r.authorName?.charAt(0)}
                         </div>
                         <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                              <span style={{ fontWeight: '700', marginRight: '4px' }}>{r.authorName}</span>
                              {r.text}
                            </p>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* Like Externo do Comentário */}
            <button onClick={() => onLike(postId, c.id, c.likedByMe, false)} style={{ background: 'none', border: 'none', padding: '0 4px', height: 'fit-content' }}>
               <Heart size={14} color={c.likedByMe ? "#E53E3E" : "var(--text-muted)"} fill={c.likedByMe ? "#E53E3E" : "none"} />
            </button>
          </div>
        )) : (
          <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Nenhum comentário por enquanto.</p>
          </div>
        )}
        {/* Barra de contexto de resposta inserida no fluxo */}
        {replyingTo && (
          <div style={{ background: '#F8F9FA', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #efefef', borderRadius: '8px', marginBottom: '12px' }}>
             <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Respondendo a <strong>{replyingTo.name}</strong></p>
             <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none' }}><X size={14} /></button>
          </div>
        )}

        {/* Caixa de Input Inserida no fluxo (Logo abaixo da última mensagem) */}
        <div style={{ 
          padding: '12px 0 24px', 
          display: 'flex', alignItems: 'center', gap: '12px', background: 'white'
        }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder={replyingTo ? `Responda a ${replyingTo.name}...` : "Adicione um comentário..."} 
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={{ 
                width: '100%', padding: '12px 48px 12px 16px', 
                borderRadius: '24px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '14px',
                background: '#F8F9FA'
              }} 
            />
            <button 
              disabled={!text.trim()} 
              onClick={handleSend}
              style={{ 
                position: 'absolute', right: '12px', background: 'none', border: 'none', padding: 0,
                color: text.trim() ? '#0095F6' : 'rgba(0,0,0,0.2)', transition: 'color 0.2s',
                fontWeight: '700', fontSize: '14px'
              }}
            >
              Publicar
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default CommentsSheet;
