import React from 'react';
import { ArrowLeft, ExternalLink, Globe, Instagram, Mail, MapPin, Share2, Bookmark } from 'lucide-react';

export default function SponsorDetailModal({ sponsor, onClose, onSaveFavorite }) {
  if (!sponsor) return null;

  // Normalização de dados para o modal
  const logoUrl = sponsor.logo_url || sponsor.logo || '/logo.png';
  const tier = (sponsor.tier || 'ouro').toLowerCase();
  
  const getTierInfo = (t) => {
    switch(t) {
      case 'diamond': return { name: 'Cota Diamante', color: '#E2E8F0', bg: 'linear-gradient(135deg, #1A365D 0%, #2A4365 100%)' };
      case 'ouro': case 'gold': return { name: 'Cota Ouro', color: '#FFD700', bg: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)' };
      case 'prata': case 'silver': return { name: 'Cota Prata', color: '#C1C1C1', bg: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)' };
      case 'bronze': return { name: 'Cota Bronze', color: '#CD7F32', bg: 'linear-gradient(135deg, #744210 0%, #975A16 100%)' };
      default: return { name: 'Parceiro', color: '#94A3B8', bg: '#F8FAFC' };
    }
  };

  const info = getTierInfo(tier);
  const tierName = sponsor.tierName || info.name;
  const tierColor = sponsor.tierColor || info.color;
  const website = sponsor.website_url || sponsor.website;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#FFFFFF',
      zIndex: 2500,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* HEADER COMERCIAL DE ALTO IMPACTO */}
      <div style={{ 
        height: '320px', 
        background: info.bg, 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden'
      }}>
        {/* Botão VOLTAR (Substituindo o X) */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 10px)', left: '20px', 
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '14px', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)', zIndex: 30,
            color: 'white', fontSize: '14px', fontWeight: '800'
          }}
        >
          <ArrowLeft size={20} /> VOLTAR
        </button>

        {/* Badge de Tier */}
        <div style={{ 
          position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 14px)', right: '20px',
          background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '30px',
          border: `1px solid ${tierColor}`, color: tierColor, fontSize: '12px', fontWeight: '900',
          textTransform: 'uppercase', letterSpacing: '2px', backdropFilter: 'blur(10px)'
        }}>
          {tierName}
        </div>

        {/* LOGO EM DESTAQUE MÁXIMO */}
        <div style={{ 
          width: '180px', height: '180px', background: 'white', borderRadius: '32px',
          padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 20
        }}>
          <img 
            src={logoUrl} 
            alt={sponsor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        {/* Decorativo de fundo */}
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(2)',
          color: 'white', opacity: 0.05, fontWeight: '900', fontSize: '100px', pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
           {sponsor.name.toUpperCase()}
        </div>
      </div>

      {/* CONTEÚDO EDITORIAL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px 100px', background: '#FFFFFF' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
           <h1 style={{ 
             fontSize: '32px', fontWeight: '900', fontFamily: 'var(--font-serif)', 
             color: '#1A202C', marginBottom: '12px', letterSpacing: '-1px' 
           }}>
             {sponsor.name}
           </h1>
           <div style={{ width: '60px', height: '3px', background: tierColor, margin: '0 auto 20px' }}></div>
           <p style={{ fontSize: '18px', color: '#4A5568', fontWeight: '600', lineHeight: '1.4' }}>
             {sponsor.tagline || 'Parceiro Estratégico II CIECC 2026'}
           </p>
        </div>

        {/* BIO / SOBRE */}
        <div style={{ marginBottom: '48px' }}>
          <h4 style={{ 
            fontSize: '12px', fontWeight: '900', color: '#A0AEC0', 
            textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center'
          }}>Trajetória e Visão Comercial</h4>
          <p style={{ 
            fontSize: '17px', lineHeight: '1.8', color: '#2D3748', 
            textAlign: 'justify', whiteSpace: 'pre-line', fontWeight: '400' 
          }}>
            {sponsor.bio || 'Informações institucionais em processamento...'}
          </p>
        </div>

        {/* INFO DE EVENTO (ESTANDE) */}
        {sponsor.booth && (
          <div style={{ 
            background: '#F8FAFC', 
            padding: '32px', 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px'
          }}>
            <div style={{ background: info.bg, padding: '16px', borderRadius: '18px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
              <MapPin size={32} color={tierColor} />
            </div>
            <div>
               <p style={{ fontSize: '12px', fontWeight: '800', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Posicionamento no Evento</p>
               <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1A202C' }}>Estande: {sponsor.booth}</h3>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER FIXO - CALL TO ACTION COMERCIAL */}
      <div style={{ 
        padding: '24px 24px env(safe-area-inset-bottom, 24px)', 
        background: 'white', 
        borderTop: '1px solid #F1F5F9',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '16px'
      }}>
        <button 
          onClick={() => onSaveFavorite && onSaveFavorite(sponsor)}
          style={{ 
            width: '60px', height: '60px', background: '#F8FAFC', 
            border: '1px solid #E2E8F0', borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <Bookmark size={24} color="#1A202C" />
        </button>
        
        {website && (
          <button 
            onClick={() => window.open(website, '_blank')}
            style={{ 
              background: info.bg, 
              color: 'white', 
              border: 'none', 
              borderRadius: '18px', 
              padding: '0 24px', 
              fontSize: '16px', 
              fontWeight: '900', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            ESTABELECER CONEXÃO <ExternalLink size={20} />
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
