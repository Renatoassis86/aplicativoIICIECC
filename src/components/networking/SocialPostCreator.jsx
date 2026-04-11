import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Image as ImageIcon, X, Search,
  ChevronRight, RefreshCw, MapPin, Video, CheckCircle
} from 'lucide-react';
import { createPost } from '../../services/social/socialService';
import { supabase } from '../../lib/supabase';

/**
 * SOCIAL POST CREATOR — Arquitetura Definitiva
 * 
 * PROBLEMA RESOLVIDO: browsers mobile (iOS Safari, Android Chrome) bloqueiam
 * inputs criados programaticamente dentro de Promises/async. 
 * SOLUÇÃO: inputs HTML estáticos com refs, ativados diretamente pelo clique.
 */
const SocialPostCreator = (props) => {
  const {
   onClose, onSuccess,
   sponsorName, sponsorRole, sponsorTier = 1,
   userId
  } = props;

  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);   // [{ file, url, type }]
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);                // 1: Seleção  2: Detalhes  3: Tagging

  const [allUsers, setAllUsers] = useState([]);
  const [tagQuery, setTagQuery] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);  // [{ id: cpf, name }]

  // Modo Edição
  const [isEdit, setIsEdit] = useState(props.isEdit || false);

  // Localização
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (props.isEdit && props.initialPost) {
      setCaption(props.initialPost.caption || '');
      setTaggedUsers(props.initialPost.taggedUsers?.map((name, i) => ({ 
        id: props.initialPost.tagged_user_ids?.[i] || name, 
        name: name 
      })) || []);
      // Note: the original media is usually handled differently in edit, 
      // but here we allow editing the details of existing media.
      setStep(2);
    }
  }, [props.isEdit, props.initialPost]);

  // Refs para os DOIS inputs estáticos
  const galleryRef = useRef(null);
  const cameraRef  = useRef(null);
  const textareaRef = useRef(null);

  // Carrega lista de membros para tagging
  useEffect(() => {
    supabase.from('members').select('cpf, name').limit(500)
      .then(({ data }) => setAllUsers(data || []));
  }, []);

  // ─── HANDLERS DE MÍDIA ───────────────────────────────────────────────────

  const processFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'reel' : 'image';
    setMediaFiles([{ file, url, type }]);
    setStep(2);
  };

  const onGalleryChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = ''; // reset para permitir re-selecionar o mesmo arquivo
  };

  const onCameraChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  };

  // ─── LOCALIZAÇÃO ─────────────────────────────────────────────────────────

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const city  = data.address.city || data.address.town || 'São Paulo';
        const state = data.address.state || 'SP';
        setLocation(`${city}, ${state}`);
      } catch {
        setLocation('São Paulo, SP');
      }
    }, () => setLocation(''));
  };

  // ─── PUBLICAR ────────────────────────────────────────────────────────────

   const handlePost = async () => {
    if (!caption.trim() && mediaFiles.length === 0 && !isEdit) return;
    setLoading(true);

    try {
      if (isEdit) {
        // MODO EDIÇÃO
        await updatePostApi(props.initialPost.id, {
          caption: location ? `${caption}\n\n📍 ${location}` : caption,
          taggedUserIds: taggedUsers.map(u => u.id)
        });
      } else {
        // MODO CRIAÇÃO (Original)
        const uploadedUrls = [];
        for (const m of mediaFiles) {
          const ext      = m.file.name?.split('.').pop() || 'jpg';
          const path     = `posts/${userId || 'anon'}_${Date.now()}.${ext}`;
          const { error } = await supabase.storage
            .from('posts_media')
            .upload(path, m.file, { contentType: m.file.type || 'image/jpeg', upsert: true });

          if (error) {
            const base64 = await new Promise((res) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.readAsDataURL(m.file);
            });
            uploadedUrls.push(base64);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('posts_media').getPublicUrl(path);
            uploadedUrls.push(publicUrl);
          }
        }

        const finalCaption = location ? `${caption}\n\n📍 ${location}` : caption;

        await createPost(
          sponsorName || 'Congressista',
          sponsorRole || 'Participante',
          sponsorTier,
          mediaFiles[0]?.type || 'image',
          uploadedUrls,
          finalCaption,
          userId || 'CIECC',
          taggedUsers.map(u => u.id)
        );
      }

      onSuccess();
    } catch (err) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER STEP 1: SELEÇÃO DE MÍDIA ─────────────────────────────────────

  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Preview grande */}
      <div style={{
        width: '100%', aspectRatio: '1/1', background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative'
      }}>
        {mediaFiles[0] ? (
          mediaFiles[0].type === 'reel'
            ? <video src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
            : <img src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
        ) : (
          <div style={{ textAlign: 'center', color: '#555' }}>
            <ImageIcon size={48} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>Selecione uma foto ou vídeo</p>
          </div>
        )}
      </div>

      {/* Toolbar: Galeria + Câmera */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #262626'
      }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Recentes</span>
        <div style={{ display: 'flex', gap: 12 }}>

          {/* GALERIA — label wraps the static input */}
          <label
            htmlFor="gallery-input"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#262626', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Abrir Galeria"
          >
            <ImageIcon size={20} color="white" />
          </label>

          {/* CÂMERA — label wraps the static input com capture */}
          <label
            htmlFor="camera-input"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#262626', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Tirar Foto"
          >
            <Camera size={20} color="white" />
          </label>

        </div>
      </div>

      {/* Grid de seleção vazio (visual guide) */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1, background: '#262626', flex: 1
      }}>
        {mediaFiles.map((m, i) => (
          <div key={i} style={{ aspectRatio: '1/1', background: '#111', position: 'relative' }}>
            {m.type === 'reel'
              ? <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
            <div style={{
              position: 'absolute', top: 4, right: 4,
              background: '#0095F6', borderRadius: '50%',
              width: 18, height: 18, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={12} color="white" />
            </div>
          </div>
        ))}
        {/* Slots vazios clicáveis → abre galeria */}
        {[...Array(Math.max(0, 12 - mediaFiles.length))].map((_, i) => (
          <label
            key={`slot-${i}`}
            htmlFor="gallery-input"
            style={{
              aspectRatio: '1/1', background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {i === 0 && mediaFiles.length === 0 && (
              <ImageIcon size={20} color="#333" />
            )}
          </label>
        ))}
      </div>

      {/* Footer mode selector */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 40,
        padding: '14px 0', borderTop: '1px solid #262626'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>POST</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>REEL</span>
      </div>
    </div>
  );

  // ─── RENDER STEP 2: LEGENDA + OPÇÕES ─────────────────────────────────────

  const renderStep2 = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 20px', gap: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 8, background: '#111', overflow: 'hidden', flexShrink: 0
        }}>
          {mediaFiles[0]?.type === 'reel'
            ? <video src={mediaFiles[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
            : <img src={mediaFiles[0]?.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
        </div>
        <textarea
          ref={textareaRef}
          autoFocus
          placeholder="Escreva uma legenda..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{
            flex: 1, background: 'none', border: 'none', color: 'white',
            fontSize: 15, resize: 'none', outline: 'none',
            minHeight: 80, lineHeight: 1.5
          }}
        />
      </div>

      <div style={{ borderTop: '1px solid #262626' }}>
        {/* Marcar pessoas */}
        <div
          onClick={() => setStep(3)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Camera size={18} color="#8e8e8e" />
            <div>
              <span style={{ fontSize: 15 }}>Marcar pessoas</span>
              {taggedUsers.length > 0 && (
                <p style={{ fontSize: 12, color: '#0095F6', marginTop: 2 }}>
                  {taggedUsers.map(u => u.name).join(', ')}
                </p>
              )}
            </div>
          </div>
          <ChevronRight size={18} color="#555" />
        </div>

        {/* Localização */}
        <div
          onClick={detectLocation}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MapPin size={18} color="#8e8e8e" />
            <span style={{ fontSize: 15, color: location ? 'white' : '#8e8e8e' }}>
              {location || 'Adicionar localização'}
            </span>
          </div>
          <ChevronRight size={18} color="#555" />
        </div>
      </div>

      {/* Botão Publicar grande */}
      <div style={{ padding: '24px 20px' }}>
        <button
          onClick={handlePost}
          disabled={loading || (!caption.trim() && mediaFiles.length === 0)}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 12,
            background: '#0095F6', color: 'white',
            fontSize: 16, fontWeight: 700, border: 'none',
            opacity: (loading || (!caption.trim() && mediaFiles.length === 0)) ? 0.5 : 1,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Publicando...' : '✓  Compartilhar'}
        </button>
      </div>
    </div>
  );

  // ─── RENDER STEP 3: TAGGING ───────────────────────────────────────────────

  const renderStep3 = () => (
    <div style={{ padding: '20px' }}>
      <p style={{ fontSize: 13, color: '#8e8e8e', marginBottom: 16 }}>
        Toque em alguém para marcar na publicação.
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#1a1a1a', borderRadius: 10, padding: '10px 14px', marginBottom: 20
      }}>
        <Search size={18} color="#8e8e8e" />
        <input
          autoFocus
          type="text"
          placeholder="Pesquisar..."
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          style={{
            flex: 1, background: 'none', border: 'none',
            color: 'white', fontSize: 14, outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {allUsers
          .filter(u => u.name?.toLowerCase().includes(tagQuery.toLowerCase()))
          .slice(0, 10)
          .map(u => {
            const tagged = taggedUsers.some(tu => tu.id === u.cpf);
            return (
              <div
                key={u.cpf}
                onClick={() => {
                  if (tagged) {
                    setTaggedUsers(prev => prev.filter(tu => tu.id !== u.cpf));
                  } else {
                    setTaggedUsers(prev => [...prev, { id: u.cpf, name: u.name }]);
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 8,
                  background: tagged ? 'rgba(0,149,246,0.12)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: 14, color: tagged ? '#0095F6' : 'white', fontWeight: tagged ? 700 : 400 }}>
                  {u.name}
                </span>
                {tagged && <CheckCircle size={16} color="#0095F6" />}
              </div>
            );
          })}
      </div>

      {taggedUsers.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 10 }}>
            Selecionados ({taggedUsers.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {taggedUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#1a1a1a', padding: '6px 12px', borderRadius: 20
              }}>
                <span style={{ fontSize: 13 }}>{u.name}</span>
                <X
                  size={12} style={{ cursor: 'pointer', color: '#8e8e8e' }}
                  onClick={() => setTaggedUsers(prev => prev.filter(tu => tu.id !== u.id))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000', color: 'white',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #222',
        paddingTop: 'max(14px, env(safe-area-inset-top))'
      }}>
        <button
          onClick={step > 1 ? () => setStep(step - 1) : onClose}
          style={{ background: 'none', border: 'none', color: 'white', padding: 4 }}
        >
          {step > 1 ? <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /> : <X size={24} />}
        </button>

        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
          {step === 1 ? 'Nova publicação' : step === 3 ? 'Marcar pessoas' : 'Detalhes'}
        </h2>

        {step === 1 && (
          <button
            disabled={mediaFiles.length === 0}
            onClick={() => setStep(2)}
            style={{
              background: 'none', border: 'none',
              color: '#0095F6', fontSize: 15, fontWeight: 700,
              opacity: mediaFiles.length === 0 ? 0.4 : 1
            }}
          >
            Avançar
          </button>
        )}
        {step === 2 && (
          <button
            onClick={handlePost}
            disabled={loading || (!caption.trim() && mediaFiles.length === 0)}
            style={{
              background: 'none', border: 'none',
              color: '#0095F6', fontSize: 15, fontWeight: 700,
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '...' : 'Publicar'}
          </button>
        )}
        {step === 3 && (
          <button
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', color: '#0095F6', fontSize: 15, fontWeight: 700 }}
          >
            OK
          </button>
        )}
      </header>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* ── INPUTS ESTÁTICOS — CHAVE DA SOLUÇÃO ──────────────────────────────
          Três regras críticas para funcionar no iOS Safari e Android Chrome:
          1. Devem estar no DOM, não criados dinamicamente
          2. Devem ser acionados por <label htmlFor> ligado ao botão
          3. accept e capture devem ser definidos estaticamente
      ──────────────────────────────────────────────────────────────────────── */}
      <input
        id="gallery-input"
        ref={galleryRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={onGalleryChange}
      />
      <input
        id="camera-input"
        ref={cameraRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onCameraChange}
      />

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
};

export default SocialPostCreator;
