import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Send, Video, Search } from 'lucide-react';
import { createPost } from '../../services/social/socialService';
import { supabase } from '../../lib/supabase';
import { ImagePersistenceService } from '../../services/imagePersistence';
import { CameraSource } from '@capacitor/camera';

const SocialPostCreator = ({ onClose, onSuccess, sponsorName, sponsorRole, userId }) => {
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const fetchMedia = async (source) => {
    setUploadingMedia(true);
    const photo = await ImagePersistenceService.capturePhoto(source);
    if (photo) {
      setMediaFiles(prev => [...prev, {
        file: photo.blob,
        url: photo.webPath,
        base64: null,
        type: 'image'
      }]);
    }
    setUploadingMedia(false);
  };
  // Mentions Logic
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionsList, setShowMentionsList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Busca usuários para mentions
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('name').limit(200);
      setAllUsers(data || []);
    };
    fetchUsers();
  }, []);

  const handleFileChange = async (e) => {
    // Fallback para input tradicional se necessário, mas o foco agora é no Service
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      const base64 = await ImagePersistenceService.blobToBase64(file);
      setMediaFiles(prev => [...prev, {
        file,
        url: previewUrl,
        base64,
        type: file.type.startsWith('video') ? 'reel' : 'image'
      }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCaptionChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setCaption(val);
    setCursorPos(pos);

    // Detect @
    const textBefore = val.slice(0, pos);
    const words = textBefore.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
       setShowMentionsList(true);
       setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
       setShowMentionsList(false);
    }
  };

  const selectMention = (name) => {
    const textBefore = caption.slice(0, cursorPos);
    const words = textBefore.split(/\s/);
    words[words.length - 1] = `@${name} `;
    const newTextBefore = words.join(' ');
    const newCaption = newTextBefore + caption.slice(cursorPos);
    setCaption(newCaption);
    setShowMentionsList(false);
    textareaRef.current?.focus();
  };

  const handlePost = async () => {
    if (mediaFiles.length === 0 && !caption.trim()) return;
    setLoading(true);

    try {
      const uploadedUrls = [];
      
      // 1. Upload to Supabase Storage
      for (const m of mediaFiles) {
        try {
          const fileExt = m.file.name.split('.').pop();
          const fileName = `posts/${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('posts_media')
            .upload(fileName, m.file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (error) {
             throw error;
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('posts_media')
              .getPublicUrl(fileName);
            uploadedUrls.push(publicUrl);
          }
        } catch (storageErr) {
          console.error("Storage upload failed, using Base64 fallback:", storageErr);
          // Fallback: Se o bucket falhar, tentamos salvar a Base64 no banco (limitado pelo tamanho da coluna texto)
          // Em um app real, o bucket deve estar pronto de antemão. No congresso, é um safety-net.
          uploadedUrls.push(m.base64);
        }
      }

      // 2. Insert to Social Posts Table
      const mockTier = 4; // Organizadores/Patrocinadores Master

      await createPost(
        sponsorName, 
        sponsorRole || 'Organizador', 
        mockTier, 
        mediaFiles.length > 0 ? mediaFiles[0].type : 'image', 
        uploadedUrls, 
        caption, 
        userId || 'Renato'
      );

      console.log("[Social] Post created successfully!");
      onSuccess();

    } catch (err) {
      console.error("[Post Error Details]", err);
      alert(`Erro na postagem: ${err.message || 'Verifique as tabelas de posts no Supabase.'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(mentionQuery)
  ).slice(0, 5);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'white',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s ease-out'
    }}>
      
      {/* Header Modal */}
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '4px' }}>
            <X size={24} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>Nova Publicação</h2>
        </div>
        <button 
          onClick={handlePost}
          disabled={loading || (mediaFiles.length === 0 && !caption.trim())}
          style={{ 
            background: loading ? 'rgba(0,0,0,0.05)' : 'var(--primary)', 
            border: 'none', 
            color: 'white',
            padding: '8px 24px',
            borderRadius: '20px',
            fontSize: '14px', fontWeight: '900',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'PUBLICANDO...' : 'PUBLICAR'}
        </button>
      </header>


      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', position: 'relative' }}>
        
        {/* Mentions Dropdown */}
        {showMentionsList && filteredUsers.length > 0 && (
          <div style={{ 
            position: 'absolute', top: '120px', left: '20px', right: '20px',
            background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 300, border: '1px solid var(--border)', overflow: 'hidden'
          }}>
             {filteredUsers.map(u => (
               <button 
                 key={u.name}
                 onClick={() => selectMention(u.name)}
                 style={{ 
                   display: 'block', width: '100%', padding: '12px 20px', textAlign: 'left',
                   background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                   fontSize: '14px', fontWeight: '700', color: 'var(--secondary)'
                 }}
               >
                 {u.name}
               </button>
             ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'var(--gold)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '20px',
              overflow: 'hidden', border: '2px solid var(--gold)'
            }}>
              {userAvatar ? <img src={userAvatar} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : sponsorName.charAt(0)}
            </div>
            <div>
              <p style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '15px' }}>{sponsorName}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Criando nova publicação...</p>
            </div>
        </div>

        {/* Media Preview Area - IMEDIATO E INTEGRADO */}
        {mediaFiles.length > 0 ? (
          <div style={{ 
            display: 'flex', gap: '12px', overflowX: 'auto', 
            paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' 
          }}>
            {mediaFiles.map((media, i) => (
              <div key={i} style={{ 
                position: 'relative', 
                width: '240px', 
                height: '280px', 
                flexShrink: 0, 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)'
              }}>
                {media.type === 'reel' ? (
                  <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls={false} autoPlay loop muted />
                ) : (
                  <img src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                )}
                <button 
                  onClick={() => setMediaFiles(prev => prev.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {uploadingMedia && (
               <div style={{ width: '240px', height: '280px', background: '#f5f5f5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div className="pulse-fast" style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%' }}></div>
               </div>
            )}
          </div>
        ) : (
          uploadingMedia && (
            <div style={{ width: '100%', height: '200px', background: '#f5f5f5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
               <div className="pulse-fast" style={{ width: '30px', height: '30px', background: 'var(--primary)', borderRadius: '50%' }}></div>
            </div>
          )
        )}

        <textarea 
          ref={textareaRef}
          placeholder="O que você está pensando? Marque amigos com @..."
          value={caption}
          onChange={handleCaptionChange}
          style={{
            width: '100%', minHeight: '150px',
            border: 'none', resize: 'none', outline: 'none',
            fontSize: '17px', color: 'var(--text-main)',
            lineHeight: '1.5',
            padding: '4px'
          }}
        />
      </div>

      <footer style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', gap: '20px'
      }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,video/*" 
          multiple 
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fetchMedia(CameraSource.Camera)}
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--primary)' 
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(107, 20, 26, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>Câmera</span>
        </button>

        <button 
           onClick={() => fetchMedia(CameraSource.Photos)}
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: 'var(--primary)' 
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(107, 20, 26, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={24} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: '600' }}>Galeria</span>
        </button>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default SocialPostCreator;
