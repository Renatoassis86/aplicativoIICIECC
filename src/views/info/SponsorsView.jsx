import React from 'react';
import { Award, Briefcase, ExternalLink, X, Info, ShieldCheck, Zap } from 'lucide-react';

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
    },
    {
      name: 'Cota Prata',
      icon: <ShieldCheck size={20} color="#C0C0C0" />,
      color: '#C0C0C0',
      description: 'Presença Forte. Foco em visibilidade direta no kit do congressista.',
      sponsors: [
        { name: 'Cidade Viva', bio: 'Educação para o Reino e Inovação.', logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop&q=80' },
        { name: 'Zoe School', bio: 'Pedagogia clássica e inovação educacional.', logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=400&fit=crop&q=80' }
      ]
    }
  ];

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
          padding: '24px 20px', 
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
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>Patrocinadores</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Instituições que tornam o CIECC possível</p>
          </div>
          <button onClick={onClose} style={{ padding: '8px', background: '#F7FAFC', borderRadius: '50%' }}>
            <X size={24} color="var(--secondary)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Seção Informativa */}
          <div className="card" style={{ padding: '16px', marginBottom: '32px', background: 'var(--accent)', border: 'none' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Info size={20} color="var(--primary)" />
              <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', lineHeight: '1.4' }}>
                Os patrocinadores do II CIECC são rigorosamente selecionados por sua contribuição ao ecossistema da educação clássica cristã.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '40px' }}>
            {tiers.map((tier, idx) => (
              <section key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {tier.icon}
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: tier.color, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {tier.name}
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>{tier.description}</p>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {tier.sponsors.map((s, si) => (
                    <div key={si} className="card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '64px', height: '64px', 
                        borderRadius: '12px', 
                        background: 'white', 
                        padding: '8px', 
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <h5 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{s.name}</h5>
                         <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>{s.bio}</p>
                      </div>
                      <button style={{ background: '#F8F9FA', padding: '8px', borderRadius: '8px' }}>
                         <ExternalLink size={16} color="var(--text-muted)" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Call to Action */}
          <div style={{ 
            marginTop: '60px', 
            padding: '32px 20px', 
            textAlign: 'center',
            background: 'url("https://www.transparenttextures.com/patterns/cubes.png") rgba(74, 16, 29, 0.03)',
            borderRadius: '24px',
            border: '1px dashed var(--border)'
          }}>
            <Briefcase size={32} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>Quer expor sua marca no CIECC?</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
              Ainda temos cotas disponíveis para parceiros em 2026.
            </p>
            <button 
              onClick={() => window.open('https://wa.me/558393322457', '_blank')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '14px'
              }}
            >
              SOLICITAR APRESENTAÇÃO COMERCIAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsView;
