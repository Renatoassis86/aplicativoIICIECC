import React from 'react';
import { MapPin, Plane, Train, Hotel, Utensils, X, ExternalLink, Navigation } from 'lucide-react';

const MapLocationView = ({ onClose }) => {
  const address = "Rua Loefgren, 1279, Vila Clementino - SP";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div className="modal-content slide-up" style={{ 
        height: '92vh', 
        borderRadius: '24px 24px 0 0', 
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          background: 'white', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>Localização</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Planeje sua chegada ao II CIECC</p>
          </div>
          <button onClick={onClose} style={{ padding: '8px', background: '#F7FAFC', borderRadius: '50%' }}>
            <X size={24} color="var(--secondary)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Endereço Principal */}
          <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', alignSelf: 'flex-start' }}>
                <MapPin size={24} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>Como Chegar</h3>
                <p style={{ fontSize: '14px', color: 'var(--secondary)', lineHeight: '1.4' }}>
                  {address}
                </p>
                <button 
                  onClick={() => window.open(mapUrl, '_blank')}
                  style={{ 
                    marginTop: '16px', 
                    width: '100%', 
                    padding: '12px', 
                    background: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  ABRIR NO GOOGLE MAPS <Navigation size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Aeroportos */}
          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plane size={16} /> Aeroportos
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700' }}>Congonhas (CGH)</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Aprox. 5.8km. Ideal para voos nacionais.</p>
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                   <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary)' }}>🚗 15 min</span>
                </div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700' }}>Guarulhos (GRU)</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Aprox. 32km. Aeroporto internacional principal.</p>
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                   <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary)' }}>🚗 60 min</span>
                </div>
              </div>
            </div>
          </section>

          {/* Transporte Público */}
          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Train size={16} /> Transporte Público
            </h4>
            <div className="card" style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--secondary)', lineHeight: '1.5' }}>
                A estação mais próxima é a <strong>Sta. Cruz</strong> (Linha 1-Azul e Linha 5-Lilás). O local do evento fica a uma curta caminhada de 8 minutos da estação.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>🚶 8 min a pé</span>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>👟 650 metros</span>
              </div>
            </div>
          </section>

          {/* Hospedagem */}
          <section style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hotel size={16} /> Hospedagem
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'Transamerica Executive Vila Clementino', dist: '5 min a pé', tel: '(11) 5081-8800' },
                { name: 'Green Place Ibirapuera', dist: '6 min a pé', tel: '(11) 5081-9100' },
                { name: 'Grand Mercure SP Ibirapuera', dist: '10 min de carro', tel: '(11) 3201-0800' }
              ].map((h, i) => (
                <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700' }}>{h.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.dist} • {h.tel}</p>
                  </div>
                  <button 
                    onClick={() => window.open(`tel:${h.tel.replace(/\D/g,'')}`)}
                    style={{ background: 'var(--accent)', padding: '6px', borderRadius: '8px' }}>
                    <ExternalLink size={14} color="var(--primary)" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Alimentação */}
          <section style={{ marginBottom: '40px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={16} /> Alimentação
            </h4>
            <div className="card" style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700' }}>Shopping Metrô Santa Cruz</p>
              <p style={{ fontSize: '13px', color: 'var(--secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                Praça de alimentação completa e serviços variados a apenas 650 metros do evento.
              </p>
              <div style={{ marginTop: '8px' }}>
                 <span style={{ fontSize: '12px', fontWeight: '600' }}>🚶 8 min a pé</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MapLocationView;
