import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Send, Video, Search, ChevronLeft } from 'lucide-react';
import { createPost } from '../../services/social/socialService';
import { supabase } from '../../lib/supabase';
import { ImagePersistenceService } from '../../services/imagePersistence';
import { CameraSource } from '@capacitor/camera';

const SocialPostCreator = ({ onClose, onSuccess, sponsorName, sponsorRole, userId, userAvatar }) => {
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [step, setStep] = useState(1); // 1: Seletor, 2: Detalhes (Legenda)

  // Mentions Logic
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionsList, setShowMentionsList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [location, setLocation] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('members').select('name').limit(400);
      setAllUsers(data || []);
    };
    fetchUsers();
  }, []);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada.");
      setDetectingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        // Reversa geocoding simples via Nominatim (Free)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || 'São Paulo';
        const state = data.address.state || 'SP';
        setLocation(`${city}, ${state}`);
      } catch (err) {
        setLocation("São Paulo, SP"); // Fallback
      } finally {
        setDetectingLocation(false);
      }
    }, () => {
      alert("Localização negada ou indisponível.");
      setDetectingLocation(false);
    });
  };

  const fetchMedia = async (source) => {
    setUploadingMedia(true);
    try {
      const photo = await ImagePersistenceService.capturePhoto(source);
      if (photo) {
        const base64 = await ImagePersistenceService.blobToBase64(photo.blob);
        setMediaFiles([{
          file: photo.blob,
          url: photo.webPath,
          base64: base64,
          type: 'image'
        }]);
        setStep(2); // Vai direto para legenda após escolher
      }
    } catch (e) {
      console.error("[Creator] Erro ao buscar media:", e);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const previewUrl = URL.createObjectURL(file);
    const base64 = await ImagePersistenceService.blobToBase64(file);
    setMediaFiles([{
      file,
      url: previewUrl,
      base64,
      type: file.type.startsWith('video') ? 'reel' : 'image'
    }]);
    setStep(2);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCaptionChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setCaption(val);
    setCursorPos(pos);

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
      for (const m of mediaFiles) {
        try {
          const fileExt = m.file.name ? m.file.name.split('.').pop() : 'jpg';
          const fileName = `posts/${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data, error } = await supabase.storage.from('posts_media').upload(fileName, m.file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('posts_media').getPublicUrl(fileName);
          uploadedUrls.push(publicUrl);
        } catch (storageErr) {
          console.error("Storage fallback to base64", storageErr);
          uploadedUrls.push(m.base64);
        }
      }

      await createPost(
        sponsorName, 
        sponsorRole || 'Organizador', 
        4, 
        mediaFiles.length > 0 ? mediaFiles[0].type : 'image', 
        uploadedUrls, 
        location ? `${caption}\n\n📍 ${location}` : caption, 
        userId || 'CIECC_SYSTEM'
      );
      onSuccess();
    } catch (err) {
      alert(`Erro na postagem: ${err.message}`);
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
      background: '#000',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 20px', background: '#000', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {step === 2 ? (
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'white', padding: '4px' }}>
              <ChevronLeft size={28} />
            </button>
          ) : (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', padding: '4px' }}>
              <X size={28} />
            </button>
          )}
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>
            {step === 1 ? 'Novo post' : 'Compartilhar'}
          </h2>
        </div>
        {step === 1 ? (
          <button 
            disabled={mediaFiles.length === 0}
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', color: '#0095F6', fontSize: '16px', fontWeight: '700', opacity: mediaFiles.length > 0 ? 1 : 0.5 }}
          >
            Avançar
          </button>
        ) : (
          <button 
            onClick={handlePost}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#0095F6', fontSize: '16px', fontWeight: '700' }}
          >
            {loading ? 'PUBLICANDO...' : 'Compartilhar'}
          </button>
        )}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', background: step === 1 ? '#000' : 'white' }}>
        {step === 1 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              width: '100%', aspectRatio: '1/1', background: '#121212', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
            }}>
              {mediaFiles.length > 0 ? (
                mediaFiles[0].type === 'reel' ? (
                  <video src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay loop muted />
                ) : (
                  <img src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#8e8e8e' }}>
                   <ImageIcon size={64} strokeWidth={1} style={{ marginBottom: '16px' }} />
                   <p style={{ fontSize: '14px' }}>Nenhuma mídia selecionada</p>
                </div>
              )}
            </div>

            <div style={{ flex: 1, padding: '20px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Recentes</h3>
                 <div style={{ display: 'flex', gap: '12px' }}>
                   <button onClick={() => fetchMedia(CameraSource.Camera)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#262626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Camera size={20} />
                   </button>
                   <button onClick={() => fileInputRef.current.click()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#262626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ImageIcon size={20} />
                   </button>
                 </div>
               </div>
               
               <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleFileChange} />
               
               {uploadingMedia && (
                 <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <div className="spin" style={{ width: '24px', height: '24px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }}></div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '16px', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                 {mediaFiles[0].type === 'reel' ? (
                   <video src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                 ) : (
                   <img src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 )}
              </div>
              <textarea 
                ref={textareaRef}
                autoFocus
                placeholder="Escreva uma legenda..."
                value={caption}
                onChange={handleCaptionChange}
                style={{ 
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  fontSize: '15px', color: '#262626', minHeight: '80px',
                  paddingTop: '8px'
                 }}
              />
            </div>

            {showMentionsList && filteredUsers.length > 0 && (
              <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #eee', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: '#f0f0f0', fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>Sugestões</div>
                {filteredUsers.map(u => (
                  <button key={u.name} onClick={() => selectMention(u.name)} style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid #eee', fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                    {u.name}
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={() => {
                setCaption(prev => prev + ' @');
                textareaRef.current?.focus();
              }}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid #efefef', padding: '14px 0', fontSize: '15px', color: '#262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
               <span>Marcar pessoas</span>
               <Search size={18} color="#999" />
            </button>
            <button 
              onClick={detectLocation}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid #efefef', padding: '14px 0', fontSize: '15px', color: '#262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
               <span>{detectingLocation ? 'Detectando...' : (location || 'Adicionar localização')}</span>
               <RefreshCw size={18} color={location ? '#38A169' : '#999'} className={detectingLocation ? "spin" : ""} />
            </button>
             <button 
               onClick={() => alert("Exclusividade: Posts Diamond possuem prioridade no feed.")}
               style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderTop: '1px solid #efefef', padding: '14px 0', fontSize: '15px', color: '#262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
             >
               <span>Visualização prioritária</span>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }}></div>
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

      {step === 2 && (
        <footer style={{ padding: '16px', background: 'white', borderTop: '1px solid #efefef' }}>
          <button 
             onClick={handlePost}
             disabled={loading}
             style={{ 
               width: '100%', padding: '14px', borderRadius: '12px', background: '#0095F6', 
               color: 'white', fontWeight: '800', border: 'none', opacity: loading ? 0.6 : 1
             }}
          >
             {loading ? 'COMPARTILHANDO...' : 'Compartilhar'}
          </button>
        </footer>
      )}
    </div>
  );
};


export default SocialPostCreator;

