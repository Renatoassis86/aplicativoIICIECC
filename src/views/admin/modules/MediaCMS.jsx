import React, { useState, useEffect } from 'react';
import { Save, Music, Video, Youtube, Upload, Trash2, Link as LinkIcon, Radio } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';

const MediaCMS = () => {
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [newMedia, setNewMedia] = useState({
    title: '',
    description: '',
    type: 'video',
    source: 'link',
    url: '',
    isLive: false
  });

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    const data = await cmsService.getMedia();
    setMediaList(data);
    setLoading(false);
  };

  const handleAddMedia = async () => {
    if (!newMedia.title) return alert('Título é obrigatório');
    
    setLoading(true);
    try {
      if (newMedia.source === 'upload' && uploadFile) {
        await cmsService.uploadMedia(uploadFile, newMedia.title, newMedia.description, newMedia.type);
      } else if (newMedia.source === 'link') {
        if (!newMedia.url) throw new Error('URL é obrigatória para links');
        await cmsService.addMediaLink(
          newMedia.title, 
          newMedia.description, 
          newMedia.type, 
          newMedia.url,
          newMedia.isLive
        );
      }
      
      alert('Mídia adicionada com sucesso!');
      setNewMedia({
        title: '',
        description: '',
        type: 'video',
        source: 'link',
        url: '',
        isLive: false
      });
      setUploadFile(null);
      loadMedia();
    } catch (e) {
      alert('Erro ao adicionar: ' + e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta mídia permanentemente?')) return;
    try {
      // Nota: O método deleteMedia deve estar presente no cmsService
      const { error } = await cmsService.deleteMedia(id); 
      if (error) throw error;
      loadMedia();
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
      {/* FORMULÁRIO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="white-bg" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px', color: '#1E293B' }}>Adicionar Novo Conteúdo</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
               <ModeButton 
                active={newMedia.type === 'video'} 
                onClick={() => setNewMedia(prev => ({ ...prev, type: 'video' }))}
                icon={<Video size={16} />}
                label="Vídeo"
               />
               <ModeButton 
                active={newMedia.type === 'audio'} 
                onClick={() => setNewMedia(prev => ({ ...prev, type: 'audio' }))}
                icon={<Music size={16} />}
                label="Áudio/Pod"
               />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Título</label>
              <input 
                type="text" 
                value={newMedia.title} 
                onChange={(e) => setNewMedia(prev => ({ ...prev, title: e.target.value }))}
                style={inputStyle}
                placeholder="Ex: Entrevista com Dr. Schlect"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Descrição (Opcional)</label>
              <textarea 
                value={newMedia.description} 
                onChange={(e) => setNewMedia(prev => ({ ...prev, description: e.target.value }))}
                style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                placeholder="Breve resumo do conteúdo..."
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
               <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B' }}>Origem do Arquivo</label>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#1E293B' }}>
                   <input type="radio" checked={newMedia.source === 'link'} onChange={() => setNewMedia(prev => ({ ...prev, source: 'link' }))} /> Link Externo
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#1E293B' }}>
                   <input type="radio" checked={newMedia.source === 'upload'} onChange={() => setNewMedia(prev => ({ ...prev, source: 'upload' }))} /> Upload Direto
                 </label>
               </div>

               {newMedia.source === 'link' ? (
                 <input 
                  type="text" 
                  placeholder="URL (YouTube, Spotify, etc)" 
                  value={newMedia.url}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                  style={inputStyle}
                 />
               ) : (
                 <div style={{ border: '2px dashed #CBD5E1', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                   <input 
                    type="file" 
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    id="file-upload"
                    style={{ display: 'none' }}
                   />
                   <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                     <Upload size={24} color="#64748B" />
                     <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{uploadFile ? uploadFile.name : 'Clique para selecionar arquivo'}</span>
                   </label>
                 </div>
               )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: newMedia.isLive ? '#FEF2F2' : 'transparent', border: '1px solid ' + (newMedia.isLive ? '#FCA5A5' : '#E2E8F0') }}>
               <input 
                type="checkbox" 
                checked={newMedia.isLive} 
                onChange={(e) => setNewMedia(prev => ({ ...prev, isLive: e.target.checked }))}
                id="is-live"
               />
               <label htmlFor="is-live" style={{ fontSize: '13px', fontWeight: '700', color: newMedia.isLive ? '#B91C1C' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <Radio size={16} /> Marcar como Transmissão Ao Vivo (Link Principal)
               </label>
            </div>

            <button 
              onClick={handleAddMedia}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '16px', borderRadius: '12px', width: '100%', cursor: 'pointer', marginTop: '8px' }}
            >
              {loading ? 'Processando...' : 'ADICIONAR MÍDIA'}
            </button>
          </div>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="white-bg" style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxHeight: '800px', overflowY: 'auto' }}>
        <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px', color: '#1E293B' }}>Mídias Cadastradas</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mediaList.map(item => (
            <div key={item.id} className="white-bg" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9', background: item.is_live_stream ? '#FEF2F2' : 'white' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                {item.media_type === 'video' ? <Video size={20} /> : <Music size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontWeight: '800', fontSize: '14px', color: '#1E293B' }}>{item.title}</p>
                  {item.is_live_stream && <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#EF4444', color: 'white', fontSize: '10px', fontWeight: '900' }}>LIVE</span>}
                </div>
                <p style={{ fontSize: '12px', color: '#475569' }}>{item.source_type === 'link' ? <LinkIcon size={10} style={{marginRight: 4}}/> : <Upload size={10} style={{marginRight: 4}}/>}{item.url_or_path}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#B91C1C', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {mediaList.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>Nenhuma mídia cadastrada ainda.</p>}
        </div>
      </div>
    </div>
  );
};

const ModeButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      padding: '10px', borderRadius: '10px', border: active ? '1px solid var(--primary)' : '1px solid #E2E8F0',
      background: active ? 'var(--primary)05' : 'white', color: active ? 'var(--primary)' : '#64748B',
      fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {icon} {label}
  </button>
);

const inputStyle = {
  padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0',
  fontSize: '14px', outline: 'none', color: '#1E293B', background: 'white'
};

export default MediaCMS;
