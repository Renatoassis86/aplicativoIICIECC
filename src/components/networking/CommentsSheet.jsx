import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Heart, Trash2 } from 'lucide-react';

/**
 * Interface Deslizante de Comentários Integrada Sub-Rede (Instagram-like).
 * Suporte a comentários RECURSIVOS (Threads infinitas).
 */
const CommentItem = ({ comment, depth = 0, onReply, onDelete, onLike, canDelete }) => {
  if (!comment) return null;
  const authorName = comment.authorName || 'Participante';
  
  return (
    <div style={{ 
      marginLeft: depth > 0 ? '12px' : '0', 
      padding: '12px 0 4px', 
      borderLeft: depth > 0 ? '2px solid #F1F1F1' : 'none',
      background: depth % 2 !== 0 ? 'rgba(0,0,0,0.01)' : 'transparent',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', gap: '12px', padding: depth > 0 ? '0 12px' : '0' }}>
        <div style={{ 
          width: depth === 0 ? '32px' : '24px', 
          height: depth === 0 ? '32px' : '24px', 
          borderRadius: '50%',
          background: 'var(--bg-app)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: depth === 0 ? '14px' : '11px',
          flexShrink: 0
        }}>
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: depth === 0 ? '13px' : '12px', color: 'var(--text-main)', lineHeight: '1.4' }}>
            <span style={{ fontWeight: '700', color: 'var(--secondary)', marginRight: '6px' }}>{authorName}</span>
            {comment.text}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Agorinha</span>
            {comment.likes > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{comment.likes} curtidas</span>}
            <button onClick={() => onReply(comment)} style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', padding: 0 }}>Responder</button>
            {canDelete(authorName) && (
              <button onClick={() => onDelete(comment.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#E53E3E', fontWeight: '600', padding: 0 }}>Excluir</button>
            )}
          </div>
        </div>
        <button onClick={() => onLike(comment.id, comment.likedByMe)} style={{ background: 'none', border: 'none', padding: '0 4px' }}>
          <Heart size={depth === 0 ? 14 : 12} color={comment.likedByMe ? "#E53E3E" : "var(--text-muted)"} fill={comment.likedByMe ? "#E53E3E" : "none"} />
        </button>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          {comment.replies.map(r => (
            <CommentItem key={r.id} comment={r} depth={depth + 1} onReply={onReply} onDelete={onDelete} onLike={onLike} canDelete={canDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentsSheet = ({ postId, comments, userName, userType, ownerName, onClose, onAddComment, onDeleteComment, onLike }) => {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Bloquear scroll ao abrir os comentários
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);
  
  const emojis = ['❤️', '🔥', '🙌', '👏', '😮', '🙌', '💯', '✨'];
  const canDelete = (author) => {
    if (!author) return false;
    const role = (userType || 'congressista').toLowerCase();
    return ['admin', 'organizador', 'staff'].some(r => role.includes(r)) || userName === ownerName || userName === author;
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(postId, text.trim(), replyingTo?.id);
    setText('');
    setReplyingTo(null);
    
    // Removido o fechamento automático para permitir conversas contínuas 
    // como padrão moderno de UX (Instagram/Twitter).
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      background: 'white', zIndex: 9999999,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUpComms 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpComms { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>Comentários</h3>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', background: 'none', border: 'none' }}><X size={24} /></button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {comments && comments.length > 0 ? comments.map(c => (
          <CommentItem 
            key={c.id} 
            comment={c} 
            onReply={(com) => { setReplyingTo({ id: com.id, name: com.authorName }); setText(`@${com.authorName} `); }}
            onDelete={(id) => onDeleteComment(postId, id)}
            onLike={(id, state) => onLike(postId, id, state, false)}
            canDelete={canDelete}
          />
        )) : (
          <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>Nenhum comentário.</div>
        )}
      </div>

      <div style={{ padding: '12px 16px env(safe-area-inset-bottom, 16px)', background: 'white', borderTop: '1px solid #efefef' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {emojis.map((e, idx) => (
            <button key={idx} onClick={() => setText(text + e)} style={{ fontSize: '20px', background: 'none', border: 'none' }}>{e}</button>
          ))}
        </div>
        
        {replyingTo && (
          <div style={{ background: '#F8F9FA', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', borderRadius: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px' }}>Respondendo a <strong>{replyingTo.name}</strong></span>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none' }}><X size={14} /></button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            autoFocus
            placeholder="Adicione um comentário..." 
            value={text} 
            onChange={e => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #ddd', background: '#f9f9f9', outline: 'none', color: '#000' }}
          />
          <button onClick={handleSend} disabled={!text.trim()} style={{ color: text.trim() ? 'var(--primary)' : '#ccc', fontWeight: '800', background: 'none', border: 'none', padding: '8px' }}>Enviar</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommentsSheet;
