import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Send, Video } from 'lucide-react';

/**
 * Interface exclusiva de postagem para Patrocinadores/Expositores.
 * Chama as APIs nativas do celular (Camera ou Galeria) via input "capture" HTML5.
 */
const SocialPostCreator = ({ onClose, onSuccess, sponsorName }) => {
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    // Suporte a multi-upload (Carrossel Nativo).
    const newMedia = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'reel' : 'image'
    }));

    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (mediaFiles.length === 0 && !caption.trim()) return;

    setLoading(true);

    try {
      // 1. Arquitetura Futura: Upload Supabase Storage
      // for (const m of mediaFiles) {
      //   const ext = m.file.name.split('.').pop();
      //   await supabase.storage.from('social_media').upload(`posts/${Date.now()}.${ext}`, m.file);
      // }

      // 2. Insere Tabela (Supabase DB) com as URLs

      // Simulação momentânea:
      await new Promise(res => setTimeout(res, 1500));
      onSuccess(); // Sinaliza para o feed regarregar

    } catch (err) {
      console.error(err);
      alert('Erro ao processar postagem.');
    } finally {
      setLoading(false);
    }
  };

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
            background: 'none', border: 'none', 
            color: (mediaFiles.length === 0 && !caption.trim()) ? 'var(--text-muted)' : 'var(--primary)',
            fontSize: '16px', fontWeight: '800',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Publicando...' : 'Compartilhar'}
        </button>
      </header>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        {/* Identificação de quem está postando */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--gold)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-serif)', fontWeight: '900', fontSize: '18px'
            }}>
              {sponsorName.charAt(0)}
            </div>
            <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>{sponsorName}</p>
        </div>

        {/* Text Area */}
        <textarea 
          placeholder="Escreva uma legenda envolvente para o evento..."
          value={caption}
          onChange={e => setCaption(e.target.value)}
          style={{
            width: '100%', height: '120px',
            border: 'none', resize: 'none', outline: 'none',
            fontSize: '16px', color: 'var(--text-main)'
          }}
        />

        {/* Media Preview (Grid Nativos Customizados) */}
        {mediaFiles.length > 0 && (
          <div style={{ 
            display: 'flex', gap: '12px', overflowX: 'auto', 
            paddingBottom: '12px', margin: '20px 0', scrollbarWidth: 'none' 
          }}>
            {mediaFiles.map((media, i) => (
              <div key={i} style={{ position: 'relative', width: '200px', height: '240px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden' }}>
                {media.type === 'reel' ? (
                  <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls={false} autoPlay loop muted />
                ) : (
                  <img src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                )}
                
                {/* Remove Image btn */}
                <button 
                  onClick={() => removeMedia(i)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'
                  }}
                >
                  <X size={16} />
                </button>

                {/* Badge Identificadora se Vídeo */}
                {media.type === 'reel' && (
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Video size={14} /> <span style={{fontSize:'11px', fontWeight:'700'}}>Reel</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Toolbar Inferior Nativamente linkável ao celular HTML5 (Camera/Galeria) */}
      <footer style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', gap: '20px'
      }}>
        
        {/* Input Oculto Principal */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,video/*" 
          multiple // Permite carrossel
          onChange={handleFileChange}
        />

        {/* Botão Câmera (Foca em capturar no momento usando capture="environment") */}
        <button 
          onClick={() => {
            if(fileInputRef.current) {
               fileInputRef.current.removeAttribute('capture');
               fileInputRef.current.setAttribute('capture', 'environment');
               fileInputRef.current.click();
            }
          }}
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

        {/* Botão Galeria / Carrossel */}
        <button 
           onClick={() => {
            if(fileInputRef.current) {
               fileInputRef.current.removeAttribute('capture');
               fileInputRef.current.click();
            }
          }}
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
