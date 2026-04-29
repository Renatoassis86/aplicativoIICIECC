import React from 'react';
import { X, Calendar, Clock, Bookmark, Share2 } from 'lucide-react';

export default function SpeakerDetailModal({ speaker, onClose, onSaveFavorite }) {
  if (!speaker) return null;

  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [speaker]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100%', height: '100%',
      background: 'white',
      zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header Sticky */}
      <header style={{ 
        padding: 'env(safe-area-inset-top, 20px) 20px 16px', 
        borderBottom: '1px solid #eee',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'white', position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', padding: '8px' }}>
          <X size={20} color="#111" />
        </button>
        <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Perfil do Palestrante</h3>
        <button onClick={() => onSaveFavorite(speaker)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', padding: '8px' }}>
          <Bookmark size={20} color="var(--primary)" />
        </button>
      </header>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px' }}>
        
        {/* Foto e Header Diagramado */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f8f9fa' }}>
          <img 
            src={speaker.img || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800'} 
            alt={speaker.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '40px 20px 20px',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>{speaker.name}</h1>
            <p style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>{speaker.desc}</p>
          </div>
        </div>

        {/* Informações Estruturadas */}
        <div style={{ padding: '24px 20px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <div style={{ flex: 1, background: '#F8F9FA', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
                <Calendar size={16} /> <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Data</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>01 de Maio, 2026</p>
            </div>
            <div style={{ flex: 1, background: '#F8F9FA', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
                <Clock size={16} /> <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Horário</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>10:30 - 12:00</p>
            </div>
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '2px' }}>Biografia e Especialidade</h4>
          
          <div style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#444', 
            textAlign: 'justify',
            whiteSpace: 'pre-line' 
          }}>
            {speaker.longBio || `Doutor em Educação com foco em abordagens clássicas. Possui mais de 20 anos de experiência na implementação de currículos de artes liberais em escolas ao redor do mundo. É autor de diversas obras fundamentais para a Educação Cristã Clássica moderna.\n\nSua palestra no II CIECC abordará as nuances da Trivium e como aplicá-las em um contexto contemporâneo sem perder a essência da sabedoria antiga.`}
          </div>

          {speaker.websiteUrl && (
            <button 
              onClick={() => window.open(speaker.websiteUrl, '_blank')}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                marginTop: '20px',
                background: 'white',
                color: 'var(--primary)',
                border: '2px solid var(--primary)',
                boxShadow: 'none'
              }}
            >
              SABER MAIS / SITE OFICIAL
            </button>
          )}

          <button className="btn-primary" style={{ 
            width: '100%', 
            marginTop: '16px',
            boxShadow: '0 10px 20px rgba(107, 20, 26, 0.2)'
          }}>
            ADICIONAR À MINHA AGENDA 
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
