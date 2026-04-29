import React from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ExternalLink, Globe, Instagram, Mail, MapPin, Share2, Bookmark, ShieldCheck, Star } from 'lucide-react';

export default function SponsorDetailModal({ sponsor, onClose, onSaveFavorite }) {
  if (!sponsor) return null;

  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [sponsor]);


  // Normalização de dados para o modal
  const logoUrl = sponsor.logo_url || sponsor.logo || '/logo.png';
  const tier = (sponsor.tier || 'ouro').toLowerCase();
  
  const getTierInfo = (t) => {
    switch(t) {
      case 'diamond': case 'diamante': return { 
        name: 'Cota Diamante', 
        color: '#E2E8F0', 
        accent: '#94A3B8',
        bg: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        glow: 'rgba(226, 232, 240, 0.4)'
      };
      case 'ouro': case 'gold': return { 
        name: 'Cota Ouro', 
        color: '#D4C19C', 
        accent: '#D4C19C',
        bg: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)',
        glow: 'rgba(212, 193, 156, 0.4)'
      };
      case 'prata': case 'silver': return { 
        name: 'Cota Prata', 
        color: '#CBD5E1', 
        accent: '#94A3B8',
        bg: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
        glow: 'rgba(203, 213, 225, 0.3)'
      };
      case 'bronze': return { 
        name: 'Cota Bronze', 
        color: '#B8860B', 
        accent: '#D97706',
        bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
        glow: 'rgba(184, 134, 11, 0.3)'
      };
      default: return { 
        name: 'Parceiro', 
        color: '#94A3B8', 
        accent: '#64748B',
        bg: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        glow: 'rgba(0,0,0,0.1)'
      };
    }
  };

  const info = getTierInfo(tier);
  const tierName = sponsor.tierName || info.name;
  const tierColor = info.color;
  const website = sponsor.website_url || sponsor.website;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100%', height: '100%',
      background: '#FFFFFF',
      zIndex: 2500,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* HEADER COMERCIAL DE IMPACTO */}
      <div style={{
        height: '260px',
        background: info.bg,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* Camadas Decorativas de Fundo */}
        <div style={{ 
          position: 'absolute', width: '600px', height: '600px', 
          background: `radial-gradient(circle, ${info.glow} 0%, transparent 70%)`,
          opacity: 0.4, top: '-200px', right: '-200px', pointerEvents: 'none'
        }} />
        
        {/* Botão VOLTAR PROEMINENTE */}
        <div style={{ 
          position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 12px)', left: '20px',
          zIndex: 40
        }}>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', 
              padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', 
              backdropFilter: 'blur(20px)', color: 'white', fontSize: '14px', fontWeight: '800',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateX(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <ArrowLeft size={18} strokeWidth={3} /> VOLTAR AO NETWORKING
          </button>
        </div>

        {/* Badge de Tier Sofisticada */}
        <div style={{ 
          position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 14px)', right: '20px',
          background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '40px',
          border: `1px solid ${tierColor}`, color: tierColor, fontSize: '10px', fontWeight: '900',
          textTransform: 'uppercase', letterSpacing: '2px', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 0 20px ${info.glow}`
        }}>
          <Star size={12} fill={tierColor} /> {tierName}
        </div>

        {/* LOGO EM FRAME PREMIUM */}
        <div style={{
          width: '140px', height: '140px', background: 'white', borderRadius: '28px',
          padding: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 20,
          animation: 'logoScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <img 
            src={logoUrl} 
            alt={sponsor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
          {/* Selo de Verificado para Patrocinadores */}
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
             <ShieldCheck size={28} color="#38A169" fill="#E6FFFA" />
          </div>
        </div>

        {/* Nome Fantasma de Fundo */}
        <div style={{ 
          position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center',
          color: 'white', opacity: 0.08, fontWeight: '900', fontSize: '80px', pointerEvents: 'none',
          whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '10px',
          fontFamily: 'var(--font-serif)'
        }}>
           {sponsor.name.split(' ')[0]}
        </div>
      </div>

      {/* CONTEÚDO EDITORIAL */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px', background: '#FFFFFF' }}>

        {/* Nome + tagline */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: '#0F172A', marginBottom: '8px', letterSpacing: '-1px', lineHeight: '1.1' }}>
            {sponsor.name}
          </h1>
          <div style={{ width: '50px', height: '3px', background: tierColor, margin: '0 auto 10px', borderRadius: '2px' }} />
          {sponsor.tagline && (
            <p style={{ fontSize: '14px', color: '#475569', fontWeight: '600', lineHeight: '1.4', maxWidth: '500px', margin: '0 auto' }}>
              {sponsor.tagline}
            </p>
          )}
        </div>

        {/* BIOGRAFIA — só exibe se preenchida */}
        {sponsor.bio && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ height: '1px', flex: 1, background: '#E2E8F0' }} />
              <h4 style={{ fontSize: '10px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '3px' }}>Trajetória e Visão</h4>
              <div style={{ height: '1px', flex: 1, background: '#E2E8F0' }} />
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#1E293B', textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {sponsor.bio}
            </p>
          </div>
        )}

        {/* ESTANDE — só exibe se preenchido */}
        {sponsor.booth && (
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: info.bg, padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Localização no Evento</p>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '2px 0 0' }}>Estande {sponsor.booth}</h3>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER FIXO - AÇÕES COMERCIAIS */}
      <div style={{
        flexShrink: 0,
        padding: '16px 24px calc(env(safe-area-inset-bottom, 16px) + 8px)',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid #F1F5F9',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        display: 'grid',
        gridTemplateColumns: '64px 1fr',
        gap: '12px',
        zIndex: 100
      }}>
        <button 
          onClick={() => onSaveFavorite && onSaveFavorite(sponsor)}
          style={{ 
            height: '66px', background: '#F8FAFC', 
            border: '2px solid #E2E8F0', borderRadius: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = tierColor}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
        >
          <Bookmark size={28} color="#0F172A" />
        </button>
        
        <button 
          onClick={() => website ? window.open(website, '_blank') : null}
          disabled={!website}
          style={{ 
            background: info.bg, 
            color: 'white', 
            border: 'none', 
            borderRadius: '22px', 
            padding: '0 32px', 
            fontSize: '17px', 
            fontWeight: '900', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '14px',
            boxShadow: `0 12px 40px ${info.glow}`,
            cursor: website ? 'pointer' : 'not-allowed',
            opacity: website ? 1 : 0.5,
            transition: 'all 0.3s ease'
          }}
        >
          {website ? 'CONHECER SOLUÇÃO' : 'CONTATO INDISPONÍVEL'} <ExternalLink size={20} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalSlideUp { 
          from { transform: translateY(100%); } 
          to { transform: translateY(0); } 
        }
        @keyframes logoScale {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>,
    document.body
  );
}
