import React from 'react';
import { MapPin, Plane, Train, Hotel, ArrowLeft, Navigation, Phone, Coffee, ShoppingBag } from 'lucide-react';

const ADDRESS = "Rua Loefgren, 1279 - Vila Clementino, São Paulo - SP, 04040-031";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

const Section = ({ icon, title, children }) => (
  <section style={{ marginBottom: '28px' }}>
    <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon} {title}
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {children}
    </div>
  </section>
);

const Card = ({ title, subtitle, badge, phone }) => (
  <div className="card" style={{ padding: '14px 16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '3px' }}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{subtitle}</p>
        {phone && (
          <a href={`tel:${phone.replace(/\D/g,'')}`} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', marginTop: '4px', display: 'block' }}>
            <Phone size={11} style={{ marginRight: '4px' }} />{phone}
          </a>
        )}
      </div>
      {badge && (
        <span style={{ background: 'var(--accent)', color: 'var(--primary)', fontSize: '10px', fontWeight: '900', padding: '3px 9px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
          {badge}
        </span>
      )}
    </div>
  </div>
);

const MapLocationView = ({ onClose }) => {
  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>

      <header style={{
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px',
        background: 'var(--primary)', color: 'white',
        display: 'flex', alignItems: 'center', gap: '16px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <button onClick={onClose} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
          <ArrowLeft size={24} color="white" />
        </button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>Como Chegar</h2>
          <p style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>Planeje sua viagem ao II CIECC 2026</p>
        </div>
      </header>

      <div style={{ padding: '20px 20px 100px' }}>

        {/* Endereço principal */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '2px solid var(--gold)' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
              <MapPin size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '4px' }}>II CIECC 2026</h3>
              <p style={{ fontSize: '13px', color: 'var(--secondary)', lineHeight: '1.5', fontWeight: '600' }}>
                Rua Loefgren, 1279<br />
                Vila Clementino, São Paulo – SP<br />
                CEP 04040-031
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>1 e 2 de Maio de 2026</p>
            </div>
          </div>
          <button onClick={() => window.open(MAPS_URL, '_blank')} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px' }}>
            <Navigation size={16} /> ABRIR NO GOOGLE MAPS
          </button>
        </div>

        {/* Mapa embed */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '28px', boxShadow: 'var(--shadow-md)', height: '200px', background: '#e8e8e8', position: 'relative' }}>
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&t=m&z=15&output=embed&iwloc=near`}
            width="100%" height="100%" style={{ border: 0, display: 'block' }}
            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="Localização II CIECC 2026"
          />
        </div>

        {/* Aeroportos */}
        <Section icon={<Plane size={14} color="var(--primary)" />} title="Aeroportos">
          <Card
            title="Congonhas (CGH) — Recomendado"
            subtitle="Aprox. 5,8 km · ~15 min de carro. Voos domésticos."
            badge="15 min"
          />
          <Card
            title="Guarulhos (GRU) — Internacional"
            subtitle="Aprox. 32 km · ~60 min de carro. Aeroporto internacional."
            badge="60 min"
          />
        </Section>

        {/* Transporte Público */}
        <Section icon={<Train size={14} color="var(--primary)" />} title="Transporte Público">
          <Card
            title="Metrô Santa Cruz"
            subtitle="Linha 1-Azul e Linha 5-Lilás. Aprox. 650m · 8 min a pé do local."
            badge="8 min a pé"
          />
          <Card
            title="Ônibus"
            subtitle="Diversas linhas pela Av. Dr. Altino Arantes e Rua Loefgren. Consulte o SPTrans."
          />
        </Section>

        {/* Hospedagem */}
        <Section icon={<Hotel size={14} color="var(--primary)" />} title="Hospedagem Sugerida">
          <Card
            title="Transamerica Executive Vila Clementino"
            subtitle="5 min a pé do local do evento."
            badge="5 min"
            phone="(11) 5081-8800"
          />
          <Card
            title="Green Place Ibirapuera"
            subtitle="6 min a pé do local do evento."
            badge="6 min"
            phone="(11) 5081-9100"
          />
          <Card
            title="Grand Mercure SP Ibirapuera"
            subtitle="10 min de carro do local."
            badge="10 min"
            phone="(11) 3201-0800"
          />
        </Section>

        {/* Shoppings e Alimentação */}
        <Section icon={<ShoppingBag size={14} color="var(--primary)" />} title="Shoppings e Alimentação">
          <Card
            title="Shopping Metrô Santa Cruz"
            subtitle="8 min a pé. Praça de alimentação, farmácias e serviços."
            badge="8 min"
          />
          <Card
            title="Região do Ibirapuera"
            subtitle="Diversas opções de restaurantes a poucos minutos do local."
          />
        </Section>

        {/* Dica */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '16px', padding: '16px', display: 'flex', gap: '10px' }}>
          <Coffee size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.6' }}>
            <strong>Dica:</strong> O Metrô Santa Cruz (Linha 1-Azul + Linha 5-Lilás) é a opção mais prática para quem vem do centro ou da Zona Sul. Desça na estação e caminhe ~8 minutos pela Rua Loefgren.
          </p>
        </div>

      </div>
    </div>
  );
};

export default MapLocationView;
