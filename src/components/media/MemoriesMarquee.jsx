import React from 'react';

/**
 * MemoriesMarquee: Um carrossel infinito ultra-performático para exibir 
 * grande volume de fotos (ex: 210 fotos de memórias) na Home.
 */
const MemoriesMarquee = ({ photos, onOpenMedia }) => {
  // Duplicamos a lista para garantir o efeito infinito sem gaps
  const displayPhotos = [...photos, ...photos];

  return (
    <div style={{ padding: '32px 0 40px' }}>
      <div style={{ padding: '0 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '4px' }}>
            Memórias I CIECC 2025
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
            Relembre os melhores momentos da jornada pedagógica.
          </p>
        </div>
        <div style={{ background: 'var(--gold)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '900' }}>
          {photos.length} FOTOS
        </div>
      </div>

      <div className="marquee-container" style={{ 
        height: '150px', 
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}>
        <div className="marquee-content" style={{ 
          animationDuration: '240s', 
          display: 'flex',
          gap: '10px'
        }}>
          {displayPhotos.map((photo, idx) => (
            <div 
              key={`${photo.id}-${idx}`}
              onClick={() => onOpenMedia(photo, idx % photos.length)}
              style={{ 
                minWidth: '120px', 
                height: '120px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                background: 'rgba(107, 20, 26, 0.1)', // Subtle primary tint
                cursor: 'pointer',
                border: '1.5px solid rgba(107, 20, 26, 0.15)',
                position: 'relative',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img 
                src={photo.url} 
                alt={photo.label} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain', // MOST IMPORTANT: SHOWS WHOLE PHOTO
                  padding: '4px' 
                }} 
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .marquee-container {
          overflow: hidden;
          width: 100%;
          position: relative;
        }
        .marquee-content {
          display: flex;
          width: max-content;
          animation: marquee-infinite linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
};

export default MemoriesMarquee;
