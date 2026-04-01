import React from 'react';
import { Award, Briefcase, ExternalLink, ArrowLeft, Info, ShieldCheck, Zap, Handshake } from 'lucide-react';

const SponsorsView = ({ onClose }) => {
  const tiers = [
    {
      name: 'Master & Diamante',
      icon: <Zap size={20} color="var(--gold)" />,
      color: 'var(--gold)',
      description: 'Autoridade de Influência. Parceiros de nível estratégico.',
      sponsors: [
        { name: 'OIKOS', bio: 'Líder em gestão académica clássica.', logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=400&h=400&fit=crop&q=80' },
        { name: 'PACTUM', bio: 'Consultoria estratégica e implantação.', logo: 'https://images.unsplash.com/photo-1543286386-713bdd54865e?w=400&h=400&fit=crop&q=80' },
        { name: 'FICV', bio: 'Educação Superior e Pós-graduação Clássica.', logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=400&h=400&fit=crop&q=80' }
      ]
    },
    {
      name: 'Cota Ouro',
      icon: <Award size={20} color="#FFD700" />,
      color: '#FFD700',
      description: 'Autoridade Máxima. Destaque premium em todas as plataformas.',
      sponsors: [
        { name: 'Editora Trinitas', bio: 'Referência em livros e formação clássica.', logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&q=80' },
        { name: 'Schola Classics', bio: 'Plataforma de ensino e currículo clássico.', logo: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400&h=400&fit=crop&q=80' }
      ]
    }
  ];

  return (
    <div className="fixed-modal-overlay" style={{ background: '#F7F8FA' }}>
      <div className="modal-wrapper" style={{ background: '#F7F8FA' }}>
        <header style={{ 
          padding: 'env(safe-area-inset-top, 40px) 20px 20px', 
          background: 'var(--secondary)', 
          color: 'white',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <button onClick={onClose} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
            <ArrowLeft size={24} color="white" />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>Patrocinadores</h2>
            <p style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>Instituições do CIECC 2026</p>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
          <div className="card" style={{ padding: '16px', marginBottom: '32px', background: 'var(--accent)', border: 'none' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Info size={20} color="var(--primary)" />
              <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', lineHeight: '1.4' }}>
                Os patrocinadores do II CIECC são fundamentais para a realização deste ecossistema educacional.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '40px' }}>
            {tiers.map((tier, idx) => (
              <section key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                   {tier.icon}
                   <h4 style={{ fontSize: '13px', fontWeight: '900', color: tier.color, textTransform: 'uppercase' }}>{tier.name}</h4>
                </div>
                <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                  {tier.sponsors.map((s, si) => (
                    <div key={si} className="card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <img src={s.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{s.name}</h5>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{s.bio}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <button onClick={() => window.open('https://wa.me/558393322457', '_blank')} className="btn-primary" style={{ marginTop: '40px' }}>
             SER UM PATROCINADOR
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorsView;
