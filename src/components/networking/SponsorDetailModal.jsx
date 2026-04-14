import React from 'react';
import { X, ExternalLink, Globe, Instagram, Mail, MapPin, Share2, Bookmark } from 'lucide-react';

export default function SponsorDetailModal({ sponsor, onClose, onSaveFavorite }) {
  if (!sponsor) return null;

  // Normalização de dados para o modal (caso venha do HomeTab ou SponsorsView)
  const logoUrl = sponsor.logo_url || sponsor.logo || '/logo.png';
  const tier = (sponsor.tier || 'ouro').toLowerCase();
  
  const getTierInfo = (t) => {
    switch(t) {
      case 'diamond': return { name: 'Diamante', color: '#4A5568' };
      case 'ouro': case 'gold': return { name: 'Ouro', color: '#DAA520' };
      case 'prata': case 'silver': return { name: 'Prata', color: '#718096' };
      case 'bronze': return { name: 'Bronze', color: '#8B4513' };
      case 'organizador': return { name: 'Organizador', color: '#6B141A' };
      default: return { name: 'Apoio', color: '#94A3B8' };
    }
  };

  const info = getTierInfo(tier);
  const tierName = sponsor.tierName || info.name;
  const tierColor = sponsor.tierColor || info.color;
  const website = sponsor.website_url || sponsor.website;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'white',
      zIndex: 2000,
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header Sticky */}
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 12px) 20px 20px', 
        borderBottom: '1px solid #f1f1f1',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'white', position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', padding: '10px', display: 'flex' }}>
          <X size={20} color="#111" />
        </button>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '900', 
          background: `${tierColor}15`, 
          color: tierColor, 
          padding: '6px 14px', 
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {tierName}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => onSaveFavorite && onSaveFavorite(sponsor)}
            style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', padding: '10px', display: 'flex' }}
          >
            <Bookmark size={20} color="var(--primary)" />
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 80px' }}>
        
        {/* Banner Logo */}
        <div style={{ 
          margin: '40px auto 32px', 
          width: '160px', 
          height: '160px', 
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          border: '1px solid #f1f1f1'
        }}>
          <img 
            src={logoUrl} 
            alt={sponsor.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
           <h1 style={{ fontSize: '30px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: 'var(--secondary)', marginBottom: '8px' }}>
             {sponsor.name}
           </h1>
           <p style={{ fontSize: '15px', color: '#64748B', fontWeight: '500' }}>
             {sponsor.tagline}
           </p>
        </div>

        {/* Links Rápidos de Contato */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
           {website && (
             <button 
               onClick={() => window.open(website, '_blank')}
               style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--accent)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(107, 20, 26, 0.1)' }}
               title="Website"
             >
               <Globe size={24} color="var(--primary)" />
             </button>
           )}
           {sponsor.instagram_url && (
             <button 
               onClick={() => window.open(sponsor.instagram_url, '_blank')}
               style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--accent)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(107, 20, 26, 0.1)' }}
               title="Instagram"
             >
               <Instagram size={24} color="var(--primary)" />
             </button>
           )}
        </div>

        {/* Descrição */}
        {sponsor.bio && (
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Sobre a Empresa</h4>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#475569', textAlign: 'justify', whiteSpace: 'pre-line' }}>
              {sponsor.bio}
            </p>
          </div>
        )}

        {/* Localização / Estande */}
        {sponsor.booth && (
          <div style={{ 
            background: 'var(--secondary)', 
            padding: '24px', 
            borderRadius: '20px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '14px' }}>
              <MapPin size={24} color="var(--gold)" />
            </div>
            <div>
               <p style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Onde encontrar no evento</p>
               <p style={{ fontSize: '17px', fontWeight: '900' }}>Estande: {sponsor.booth}</p>
            </div>
          </div>
        )}

      </div>

      {/* Footer / CTA Principal */}
      <div style={{ padding: '20px 24px env(safe-area-inset-bottom, 20px)', borderTop: '1px solid #f1f1f1', background: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {website && (
          <button 
            onClick={() => window.open(website, '_blank')}
            className="btn-primary"
            style={{ width: '100%', padding: '18px', fontSize: '15px' }}
          >
            ACESSAR SITE OFICIAL <ExternalLink size={18} />
          </button>
        )}
        <button 
          onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/patrocinio/index.html', '_blank')}
          style={{ 
            marginTop: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', 
            fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
          }}
        >
          Quer ser um patrocinador? Saiba mais
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
