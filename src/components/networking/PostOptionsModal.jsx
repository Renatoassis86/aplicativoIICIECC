import React from 'react';
import { Edit2, EyeOff, Trash2, Link, AlertTriangle, Pin, Archive, Bookmark, X } from 'lucide-react';

const PostOptionsModal = ({ post, userType, userName, onClose, onDelete, onHide, onPin, onArchive, onSave, onEdit }) => {
  const role = (userType || 'congressista').toLowerCase();
  
  // RBAC Privilegiado: Organizadores, Staff, Admin ou o Próprio Autor
  const isManagement = ['admin', 'organizador', 'staff', 'master'].some(r => role.includes(r));
  const isAuthor = post.sponsorName === userName;
  const isPrivileged = isManagement || isAuthor;

  return (
    <>
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed', inset: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)',
          zIndex: 9999, 
          animation: 'fadeIn 0.2s' 
        }}
      />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15, 23, 42, 0.98)', 
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        padding: '20px', zIndex: 10000,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))'
      }}>
        
        {/* Drag Handle */}
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <button className="post-option-item" onClick={() => { onSave(post.id, post.savedByMe); onClose(); }}>
            <Bookmark size={20} color={post.savedByMe ? "#D4AF37" : "#CBD5E1"} fill={post.savedByMe ? "#D4AF37" : "none"} />
            <span style={{ color: post.savedByMe ? "#D4AF37" : "#FFFFFF" }}>{post.savedByMe ? 'Remover dos itens salvos' : 'Adicionar aos Salvos'}</span>
          </button>

          {isPrivileged && (
            <>
              {isManagement && (
                <button className="post-option-item" onClick={() => { onPin(post.id, post.isPinned); onClose(); }}>
                  <Pin size={20} color={post.isPinned ? "#D4AF37" : "#CBD5E1"} fill={post.isPinned ? "#D4AF37" : "none"} />
                  <span style={{ color: post.isPinned ? "#D4AF37" : "#FFFFFF" }}>{post.isPinned ? 'Desafixar do topo' : 'Fixar no Topo'}</span>
                </button>
              )}
              
              <button className="post-option-item" onClick={() => { onArchive(post.id, post.isArchived); onClose(); }}>
                <Archive size={20} color="#CBD5E1" />
                <span>{post.isArchived ? 'Desarquivar Publicação' : 'Arquivar Publicação'}</span>
              </button>

              <button className="post-option-item" onClick={() => { onEdit(post); onClose(); }}>
                <Edit2 size={20} color="#CBD5E1" />
                <span>Editar Publicação</span>
              </button>

              <button className="post-option-item danger" onClick={() => { if(window.confirm('Excluir permanentemente?')) { onDelete(post.id); onClose(); } }}>
                <Trash2 size={20} color="#F87171" />
                <span style={{ color: '#F87171' }}>Excluir Publicação</span>
              </button>
            </>
          )}

          {!isPrivileged && (
            <>
              <button className="post-option-item" onClick={() => { onHide(post.id); onClose(); }}>
                <EyeOff size={20} color="#CBD5E1" />
                <span>Ocultar esta postagem</span>
              </button>
              <button className="post-option-item" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copiado!'); onClose(); }}>
                <Link size={20} color="#CBD5E1" />
                <span>Copiar Link</span>
              </button>
              <button className="post-option-item dangerTier">
                <AlertTriangle size={20} color="#F87171" />
                <span style={{ color: '#F87171' }}>Denunciar Conteúdo</span>
              </button>
            </>
          )}
        </div>

        <button onClick={onClose} style={{ 
          width: '100%', padding: '16px', marginTop: '12px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: 'none', 
          color: '#94A3B8', fontWeight: '700', fontSize: '15px', cursor: 'pointer'
        }}>
          Cancelar
        </button>

        <style dangerouslySetInnerHTML={{__html: `
          .post-option-item {
            display: flex; align-items: center; gap: 16px; width: 100%;
            padding: 16px; background: transparent; border: none; border-radius: 12px;
            font-size: 16px; font-weight: 500; color: #FFFFFF; transition: all 0.2s;
            cursor: pointer;
          }
          .post-option-item:active {
            background: rgba(255,255,255,0.1);
            transform: scale(0.98);
          }
          .post-option-item.danger:active {
            background: rgba(248, 113, 113, 0.1);
          }
          @keyframes slideUp { 
            from { transform: translateY(100%); } 
            to { transform: translateY(0); } 
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}} />
      </div>
    </>
  );
};

export default PostOptionsModal;
