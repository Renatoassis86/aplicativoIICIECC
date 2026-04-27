import React from 'react';
import { MapPin, Plane, Train, Hotel, Utensils, ArrowLeft, ExternalLink, Navigation } from 'lucide-react';

const MapLocationView = ({ onClose }) => {
  const address = "Rua Três Rios, 363, Bom Retiro, São Paulo - SP";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      <div style={{ background: '#F7F8FA' }}>
        <header style={{ 
          padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
          background: 'var(--primary)', 
          color: 'white',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10
        }}>
          <button onClick={onClose} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
            <ArrowLeft size={24} color="white" />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>Localização</h2>
            <p style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>Planeje sua chegada ao II CIECC</p>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
          <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', alignSelf: 'flex-start' }}>
                <MapPin size={24} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Como Chegar</h3>
                <p style={{ fontSize: '14px', color: 'var(--secondary)', lineHeight: '1.4' }}>{address}</p>
                <button onClick={() => window.open(mapUrl, '_blank')} className="btn-primary" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                   ABRIR NO GOOGLE MAPS <Navigation size={16} />
                </button>
              </div>
            </div>
          </div>

          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              🚗 Transporte & Acesso
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <strong style={{ fontSize: '14px' }}>Estação Tiradentes (Metrô)</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Linha 1-Azul. Aprox. 10 minutos de caminhada.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <strong style={{ fontSize: '14px' }}>Estação Luz (Metrô/CPTM)</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Hub de integração. Aprox. 15 minutos de caminhada.</p>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
              🏨 Hospedagem Sugerida
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'Transamerica Village', dist: '5 min a pé' },
                { name: 'Green Place Ibirapuera', dist: '6 min a pé' }
              ].map((h, i) => (
                <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{h.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800' }}>{h.dist}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MapLocationView;
