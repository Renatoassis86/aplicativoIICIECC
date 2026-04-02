import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Send, Video, Search, ChevronLeft, ChevronRight, RefreshCw, MapPin } from 'lucide-react';
import { createPost } from '../../services/social/socialService';
import { supabase } from '../../lib/supabase';
import { ImagePersistenceService } from '../../services/imagePersistence';
import { CameraSource } from '@capacitor/camera';

const SocialPostCreator = ({ onClose, onSuccess, sponsorName, sponsorRole, userId, userAvatar }) => {
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [step, setStep] = useState(1); // 1: Seletor, 2: Detalhes (Legenda), 3: Marcar Pessoas
  const [cursorPos, setCursorPos] = useState(0); 
  const [taggedUsers, setTaggedUsers] = useState([]); // Lista de objetos {id, full_name}
  const [tagQuery, setTagQuery] = useState('');

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
          const { data, error } = await supabase.storage.from('posts_media').upload(fileName, m.file, {
            contentType: m.file.type || 'image/jpeg'
          });
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
        userId || 'CIECC_SYSTEM',
        taggedUsers.map(u => u.id)
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
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      <header style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '12px 16px', background: '#000', borderBottom: '1px solid #262626',
        height: '44px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
            {step === 1 ? 'Novo post' : step === 3 ? 'Marcar pessoas' : 'Novo post'}
          </h2>
        </div>
        {step === 1 ? (
          <button 
            disabled={mediaFiles.length === 0}
            onClick={() => setStep(2)}
            style={{ 
              background: 'none', border: 'none', color: '#0095F6', 
              fontSize: '15px', fontWeight: '700', 
              opacity: mediaFiles.length > 0 ? 1 : 0.4 
            }}
          >
            Avançar
          </button>
        ) : step === 3 ? (
          <button 
            onClick={() => setStep(2)}
            style={{ 
              background: 'none', border: 'none', color: '#0095F6', 
              fontSize: '15px', fontWeight: '700'
            }}
          >
            Concluir
          </button>
        ) : (
          <button 
            onClick={handlePost}
            disabled={loading}
            style={{ 
              background: 'none', border: 'none', color: '#0095F6', 
              fontSize: '15px', fontWeight: '700',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '...' : 'Compartilhar'}
          </button>
        )}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', background: '#000' }}>
        {step === 1 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              width: '100%', aspectRatio: '1/1', background: '#000', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              position: 'relative'
            }}>
              {mediaFiles.length > 0 ? (
                mediaFiles[0].type === 'reel' ? (
                  <video 
                    src={mediaFiles[0].url} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    autoPlay loop muted playsInline
                  />
                ) : (
                  <img src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#8e8e8e' }}>
                   <div style={{ 
                      width: '96px', height: '96px', borderRadius: '50%', border: '2px solid #262626',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                   }}>
                     <ImageIcon size={40} color="#8e8e8e" />
                   </div>
                   <p style={{ fontSize: '18px', fontWeight: '400', color: '#eee' }}>Comece a criar posts</p>
                </div>
              )}
              {uploadingMedia && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <RefreshCw className="spin" color="white" />
                </div>
              )}
            </div>

            <div style={{ flex: 1, background: '#000' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '15px', fontWeight: '700' }}>Recentes</span>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => fetchMedia(CameraSource.Camera)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#262626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Camera size={18} />
                   </button>
                   <button onClick={() => fileInputRef.current.click()} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#262626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ImageIcon size={18} />
                   </button>
                 </div>
               </div>
               
               <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', 
                  background: '#262626', padding: '1px' 
               }}>
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} style={{ aspectRatio: '1/1', background: '#111' }}></div>
                  ))}
               </div>

               <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleFileChange} />
            </div>
            
            <footer style={{ 
               height: '48px', display: 'flex', background: '#000', borderTop: '1px solid #262626',
               alignItems: 'center', justifyContent: 'center', gap: '40px' 
            }}>
               <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>POST</span>
               <span style={{ fontSize: '14px', fontWeight: '700', color: '#8e8e8e' }}>STORY</span>
               <span style={{ fontSize: '14px', fontWeight: '700', color: '#8e8e8e' }}>REEL</span>
            </footer>
          </div>
        ) : step === 3 ? (
          <div style={{ padding: '20px' }}>
             <p style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '20px' }}>Toque em um usuário para marcá-lo na publicação.</p>
             
             <div style={{ 
               background: '#121212', borderRadius: '12px', padding: '12px', 
               display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' 
             }}>
               <Search size={20} color="#8e8e8e" />
               <input 
                 autoFocus
                 type="text"
                 placeholder="Pesquisar por nome..."
                 value={tagQuery}
                 onChange={(e) => setTagQuery(e.target.value)}
                 style={{ background: 'none', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '14px' }}
               />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
               {allUsers.filter(u => u.name?.toLowerCase().includes(tagQuery.toLowerCase())).slice(0, 10).map(u => {
                 const isTagged = taggedUsers.find(tu => tu.full_name === u.name);
                 return (
                   <div 
                     key={u.id || u.name}
                     onClick={() => {
                        if (isTagged) {
                          setTaggedUsers(taggedUsers.filter(tu => tu.full_name !== u.name));
                        } else {
                          setTaggedUsers([...taggedUsers, { id: u.id || u.user_id, full_name: u.name }]);
                        }
                     }}
                     style={{ 
                       padding: '12px', background: isTagged ? 'rgba(0,149,246,0.1)' : '#000', 
                       display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px',
                       cursor: 'pointer'
                     }}
                   >
                     <span style={{ fontSize: '14px', color: isTagged ? '#0095F6' : 'white', fontWeight: isTagged ? '700' : '400' }}>
                       {u.name}
                     </span>
                     {isTagged && <RefreshCw size={14} color="#0095F6" />}
                   </div>
                 );
               })}
             </div>

             {taggedUsers.length > 0 && (
               <div style={{ marginTop: '40px' }}>
                 <h5 style={{ fontSize: '12px', color: '#8e8e8e', textTransform: 'uppercase', marginBottom: '12px' }}>Selecionados</h5>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {taggedUsers.map(u => (
                      <div key={u.id} style={{ background: '#262626', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px' }}>{u.full_name}</span>
                        <X size={14} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setTaggedUsers(taggedUsers.filter(tu => tu.id !== u.id)); }} />
                      </div>
                    ))}
                 </div>
               </div>
             )}
          </div>
        ) : (
          <div style={{ padding: '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
               <div style={{ 
                  width: '240px', aspectRatio: '4/5', background: '#121212', borderRadius: '12px',
                  overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: '24px'
               }}>
                  {mediaFiles[0].type === 'reel' ? (
                    <video 
                      src={mediaFiles[0].url} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      autoPlay loop muted playsInline
                    />
                  ) : (
                    <img src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
               </div>
               
               <textarea 
                ref={textareaRef}
                autoFocus
                placeholder="Adicione uma legenda..."
                value={caption}
                onChange={handleCaptionChange}
                style={{ 
                  width: '100%', border: 'none', background: 'none', color: 'white',
                  fontSize: '15px', minHeight: '100px', outline: 'none', resize: 'none',
                  textAlign: 'center'
                }}
              />
            </div>

            <div style={{ padding: '0 16px' }}>
              <div style={{ height: '1px', background: '#262626', width: '100%' }}></div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={() => setStep(3)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 0', borderBottom: '1px solid #121212', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Camera size={18} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px' }}>Marcar pessoas</span>
                      {taggedUsers.length > 0 && (
                        <p style={{ fontSize: '12px', color: '#0095F6', fontWeight: '700' }}>
                          {taggedUsers.map(u => u.full_name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#8e8e8e" />
                </div>
                
                <div 
                  onClick={detectLocation}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 0', borderBottom: '1px solid #121212', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <MapPin size={18} />
                    <span style={{ fontSize: '15px' }}>{location || 'Adicionar localização'}</span>
                  </div>
                  <ChevronRight size={18} color="#8e8e8e" />
                </div>
              </div>
            </div>

            <div style={{ padding: '32px 16px' }}>
              <button 
                onClick={handlePost}
                disabled={loading}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', 
                  background: '#0095F6', color: 'white', fontSize: '16px', fontWeight: '700',
                  border: 'none', boxShadow: '0 4px 15px rgba(0, 149, 246, 0.3)',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'COMPARTILHANDO...' : 'Compartilhar'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default SocialPostCreator;

