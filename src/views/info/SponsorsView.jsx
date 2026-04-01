import React, { useState } from 'react';
import { Award, Briefcase, ExternalLink, ArrowLeft, Info, ShieldCheck, Zap, Handshake } from 'lucide-react';
import SponsorDetailModal from '../../components/networking/SponsorDetailModal';

const SponsorsView = ({ onClose }) => {
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const tiers = [
    {
      name: 'Master & Diamante',
      icon: <Zap size={20} color="var(--gold)" />,
      color: 'var(--gold)',
      description: 'Autoridade de Influência. Parceiros de nível estratégico.',
      sponsors: [
        { 
          id: 1, 
          name: 'OIKOS', 
          tierName: 'Patrocinador Master', 
          tierColor: '#B9F2FF',
          tagline: 'Líder em gestão académica clássica.',
          bio: 'A OIKOS é a maior parceira tecnológica do movimento de educação clássica na América Latina. \n\nEspecializada em sistemas de gestão que respeitam as particularidades da pedagogia clássica, a OIKOS oferece ferramentas robustas para controle acadêmico, financeiro e pedagógico.',
          logo: 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=400&h=400&fit=crop&q=80',
          website: 'https://oikos.com.br',
          booth: 'Pavilhão Central • Estande 01'
        },
        { 
          id: 2, 
          name: 'PACTUM', 
          tierName: 'Patrocinador Diamante', 
          tierColor: '#B9F2FF',
          tagline: 'Consultoria e Implantação.',
          bio: 'A PACTUM atua no suporte estratégico e institucional a escolas clássicas em todo o Brasil. \n\nCom uma equipe de especialistas renomados, ajudamos instituições a transicionarem para o modelo clássico com segurança e excelência acadêmica.',
          logo: 'https://images.unsplash.com/photo-1543286386-713bdd54865e?w=400&h=400&fit=crop&q=80',
          website: 'https://pactum.edu.br',
          booth: 'Pavilhão Norte • Estande 12'
        },
        { 
          id: 4, 
          name: 'FICV', 
          tierName: 'Parceiro Master', 
          tierColor: '#B9F2FF',
          tagline: 'Educação Superior Clássica.',
          bio: 'A Faculdade Internacional Cidade Viva é o braço acadêmico do CIECC, oferecendo Pós-graduação e formação contínua de professores na tradição clássica cristã.',
          logo: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?w=400&h=400&fit=crop&q=80',
          website: 'https://ficv.edu.br',
          booth: 'Hall de Entrada'
        }
      ]
    },
    {
      name: 'Cota Ouro',
      icon: <Award size={20} color="#FFD700" />,
      color: '#FFD700',
      description: 'Autoridade Máxima. Destaque premium em todas as plataformas.',
      sponsors: [
        { 
          id: 3, 
          name: 'Editora Trinitas', 
          tierName: 'Patrocinador Ouro', 
          tierColor: '#FFD700',
          tagline: 'Livros e Formação.',
          bio: 'A Editora Trinitas é a maior editora especializada em conteúdos clássicos e cristãos do Brasil. \n\nNossa missão é resgatar a tradição das letras e da sabedoria cristã através de publicações de alta qualidade.',
          logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&q=80',
          website: 'https://editoratrinitas.com.br',
          booth: 'Lounge dos Autores'
        },
        { 
          id: 6, 
          name: 'Schola Classics', 
          tierName: 'Patrocinador Ouro', 
          tierColor: '#FFD700',
          tagline: 'Ensino de Excelência.',
          bio: 'A Schola Classics oferece uma plataforma de ensino completa voltada ao currículo clássico, com ferramentas digitais exclusivas para pais e professores.',
          logo: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?w=400&h=400&fit=crop&q=80',
          website: 'https://schola.com.br',
          booth: 'Auditório 2'
        }
      ]
    }
  ];

  return (
    <div className="fixed-modal-overlay" style={{ background: '#F7F8FA' }}>
      <div className="modal-wrapper" style={{ background: '#F7F8FA' }}>
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
          {!selectedSponsor ? (
            <button onClick={onClose} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
              <ArrowLeft size={24} color="white" />
            </button>
          ) : (
            <button onClick={() => setSelectedSponsor(null)} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
              <ArrowLeft size={24} color="white" />
            </button>
          )}
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
                Conheça nossos parceiros estratégicos. Toque em uma marca para ver a biografia e detalhes de contato.
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
                    <div 
                      key={si} 
                      onClick={() => setSelectedSponsor(s)}
                      className="card clickable" 
                      style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}
                    >
                       <div style={{ width: '56px', height: '56px', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', background: 'white', padding: '4px' }}>
                          <img src={s.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{s.name}</h5>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{s.tagline}</p>
                       </div>
                       <ExternalLink size={16} color="var(--border)" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <button 
            onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/patrocinio/index.html', '_blank')} 
            className="btn-primary" 
            style={{ marginTop: '40px', background: 'var(--gold)', color: 'var(--primary)', fontWeight: '900' }}
          >
             QUERO SER UM PATROCINADOR
          </button>
        </div>

        {selectedSponsor && (
          <SponsorDetailModal 
            sponsor={selectedSponsor} 
            onClose={() => setSelectedSponsor(null)}
            onSaveFavorite={(s) => {
              const stored = localStorage.getItem('ciecc_favorite_sponsors');
              let favs = stored ? JSON.parse(stored) : [];
              if (favs.includes(s.id)) favs = favs.filter(id => id !== s.id);
              else favs.push(s.id);
              localStorage.setItem('ciecc_favorite_sponsors', JSON.stringify(favs));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SponsorsView;
