import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { cmsService } from '../../../services/cmsService';

const HomeCMS = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    home_badge_text: 'II EDIÇÃO • 2026',
    home_title: 'II CIECC 2026:',
    home_subtitle: 'Educação que permanece',
    home_location: 'São Paulo, SP',
    home_date_range: '01 e 02 Mai',
    home_video_url: 'https://www.youtube.com/embed/t5CB9rnexOY',
    home_countdown_date: '2026-05-01T08:00:00'
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    await cmsService.sync();
    const newContent = { ...content };
    Object.keys(content).forEach(key => {
      const val = cmsService.get(key);
      if (val) newContent[key] = val;
    });
    setContent(newContent);
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(content)) {
        await cmsService.updateContent('home', key, value);
      }
      alert('Configurações da Home salvas com sucesso!');
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#FFFFFF' }}>Textos da Página Inicial</h3>
          <button 
            disabled={loading}
            onClick={loadContent}
            style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Recarregar Atual
          </button>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <InputGroup 
            label="Badge Superior" 
            value={content.home_badge_text} 
            onChange={(v) => handleChange('home_badge_text', v)} 
            placeholder="Ex: II EDIÇÃO • 2026"
          />
          <InputGroup 
            label="Data do Evento" 
            value={content.home_date_range} 
            onChange={(v) => handleChange('home_date_range', v)} 
            placeholder="Ex: 01 e 02 Mai"
          />
          <InputGroup 
            label="Título Principal" 
            value={content.home_title} 
            onChange={(v) => handleChange('home_title', v)} 
            fullWidth
          />
          <InputGroup 
            label="Subtítulo/Slogan" 
            value={content.home_subtitle} 
            onChange={(v) => handleChange('home_subtitle', v)} 
            fullWidth
          />
          <InputGroup 
            label="Localização" 
            value={content.home_location} 
            onChange={(v) => handleChange('home_location', v)} 
            placeholder="Ex: São Paulo, SP"
          />
          <InputGroup 
            label="Data do Countdown (ISO)" 
            value={content.home_countdown_date} 
            onChange={(v) => handleChange('home_countdown_date', v)} 
            placeholder="YYYY-MM-DDTHH:MM:SS"
          />
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '24px', color: '#FFFFFF' }}>Vídeo de Destaque</h3>
        <InputGroup 
          label="URL do Embed do YouTube" 
          value={content.home_video_url} 
          onChange={(v) => handleChange('home_video_url', v)} 
          placeholder="https://www.youtube.com/embed/XXXXX"
          fullWidth
        />
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
          * Certifique-se de usar o link de **Embed** (ex: youtube.com/embed/ID) para que funcione corretamente no App.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={handleSave}
          disabled={loading}
          style={{ 
            flex: 1, background: 'var(--gold)', color: '#000', border: 'none', 
            padding: '20px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
          }}
        >
          <Save size={20} /> SALVAR ALTERAÇÕES NA HOME
        </button>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, fullWidth = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: fullWidth ? '1 / span 2' : 'auto' }}>
    <label style={{ fontSize: '13px', fontWeight: '700', color: '#CBD5E1' }}>{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder}
      style={{ 
        padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)',
        fontSize: '14px', outline: 'none', transition: 'all 0.2s',
        color: '#FFFFFF', background: 'rgba(255,255,255,0.05)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--gold)';
        e.target.style.background = 'rgba(255,255,255,0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-color)';
        e.target.style.background = 'rgba(255,255,255,0.05)';
      }}
    />
  </div>
);

export default HomeCMS;
