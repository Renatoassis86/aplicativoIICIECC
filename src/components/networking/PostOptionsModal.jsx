import React from 'react';
import { Edit2, EyeOff, Trash2, Link, AlertTriangle, Pin } from 'lucide-react';

/**
 * Menu de Opções da Postagem (Botão de 3 pontinhos)
 * Dinâmico: O próprio dono ou Staff possui controles absolutos (Instagram-like).
 * Usuário comum apenas denuncia ou oculta.
 */
const PostOptionsModal = ({ post, userType, userName, onClose, onDelete, onHide, onPin }) => {
  // Simplificação de propriedade: 'staff', 'admin', 'organizador' ou o próprio autor tem direitos plenos.
  const role = (userType || 'congressista').toLowerCase();
  const isAdmin = ['admin', 'organizador', 'staff'].some(r => role.includes(r));
  const isAuthor = post.sponsorName === userName;
  const isPrivileged = isAdmin || isAuthor;

  return (
    <>
      <div 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, animation: 'fadeIn 0.2s' }}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        padding: '24px 20px', zIndex: 1001,
        animation: 'slideUp 0.3s ease-out'
      }}>
        
        {/* Puxador */}
        <div style={{ width: '40px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', margin: '0 auto 24px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {isPrivileged ? (
            <>
              {isAdmin && (
                <button className="option-btn" onClick={() => { onPin(post.id, post.isPinned); onClose(); }}>
                  <Pin size={20} color="var(--primary)" fill={post.isPinned ? "var(--primary)" : "none"} />
                  <span>{post.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}</span>
                </button>
              )}
              <button className="option-btn">
                <Edit2 size={20} color="var(--text-main)" />
                <span>Editar publicação</span>
              </button>
              <button className="option-btn">
                <EyeOff size={20} color="var(--text-main)" />
                <span>Ocultar contagem de curtidas</span>
              </button>
              <button className="option-btn" style={{ color: '#E53E3E' }} onClick={() => { onDelete(post.id); onClose(); }}>
                <Trash2 size={20} color="#E53E3E" />
                <span>Excluir</span>
              </button>
            </>
          ) : (
            <>
              <button className="option-btn" onClick={() => { onHide(post.id); onClose(); }}>
                <EyeOff size={20} color="var(--text-main)" />
                <span>Ocultar esta postagem</span>
              </button>
              <button className="option-btn">
                <Link size={20} color="var(--text-main)" />
                <span>Copiar Link</span>
              </button>
              <button className="option-btn" style={{ color: '#E53E3E' }}>
                <AlertTriangle size={20} color="#E53E3E" />
                <span>Denunciar</span>
              </button>
            </>
          )}

        </div>

        <button onClick={onClose} style={{ 
          width: '100%', padding: '16px', marginTop: '16px',
          background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '700', fontSize: '15px'
        }}>
          Cancelar
        </button>

        <style dangerouslySetInnerHTML={{__html: `
          .option-btn {
            display: flex; align-items: center; gap: 16px; width: 100%;
            padding: 16px; background: none; border: none; border-radius: 12px;
            font-size: 16px; font-weight: 600; color: var(--text-main); transition: background 0.2s;
          }
          .option-btn:active { background: rgba(0,0,0,0.05); }
        `}} />
      </div>
    </>
  );
};

export default PostOptionsModal;
