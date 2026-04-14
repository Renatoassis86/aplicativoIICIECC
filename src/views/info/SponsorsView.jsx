import React, { useState, useEffect } from 'react';
import { Award, Briefcase, ExternalLink, Info, Zap, ArrowLeft } from 'lucide-react';
import SponsorDetailModal from '../../components/networking/SponsorDetailModal';
import { supabase } from '../../lib/supabase';

const SponsorsView = ({ onClose }) => {
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('active', true)
        .order('order_index');
      
      if (data) setSponsors(data);
      setLoading(false);
    };
    fetchSponsors();
  }, []);

  const tierConfigs = [
    {
      id: 'diamond',
      name: 'Cota Diamante',
      icon: <Award size={22} color="#E2E8F0" />,
      color: '#4A5568',
      layout: 'grid',
      sponsors: sponsors.filter(s => s.tier?.toLowerCase() === 'diamond').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: 'Diamante',
          website: s.website_url,
          tierColor: '#4A5568'
      }))
    },
    {
      id: 'ouro',
      name: 'Cota Ouro',
      icon: <Zap size={20} color="#FFD700" />,
      color: '#DAA520',
      layout: 'grid',
      sponsors: sponsors.filter(s => s.tier?.toLowerCase() === 'ouro' || s.tier?.toLowerCase() === 'gold').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: 'Ouro',
          website: s.website_url,
          tierColor: '#FFD700'
      }))
    },
    {
      id: 'prata',
      name: 'Cota Prata',
      icon: <Award size={20} color="#C1C1C1" />,
      color: '#718096',
      layout: 'list',
      sponsors: sponsors.filter(s => s.tier?.toLowerCase() === 'prata' || s.tier?.toLowerCase() === 'silver').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: 'Prata',
          website: s.website_url,
          tierColor: '#C1C1C1'
      }))
    },
    {
      id: 'bronze',
      name: 'Cota Bronze',
      icon: <Briefcase size={20} color="#CD7F32" />,
      color: '#8B4513',
      layout: 'list',
      sponsors: sponsors.filter(s => s.tier?.toLowerCase() === 'bronze').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: 'Bronze',
          website: s.website_url,
          tierColor: '#CD7F32'
      }))
    }
  ];

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: 'calc(env(safe-area-inset-top, 24px) + 12px) 20px 12px',
        background: 'var(--primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <button onClick={onClose} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', border: 'none', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'white', margin: 0 }}>Parceiros e Patrocínio</h2>
      </header>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 24px) + 70px) 20px 100px' }}>
        
        {/* Título Principal */}
        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
           <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>Patrocinadores</h2>
           <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Instituições do CIECC 2026</p>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: '32px', background: 'var(--accent)', border: 'none', borderRadius: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={20} color="var(--primary)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', lineHeight: '1.5' }}>
              Conheça nossos parceiros estratégicos. Toque em uma marca para ver a biografia e detalhes de contato.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Carregando parceiros...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '64px' }}>
            {tierConfigs.map((tier, idx) => tier.sponsors.length > 0 && (
              <section key={idx}>
                {/* TIER HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                   <div style={{ width: '48px', height: '1px', background: tier.color, opacity: 0.3 }}></div>
                   <h4 style={{ 
                     fontSize: '15px', fontWeight: '900', color: tier.color, 
                     textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' 
                   }}>
                     {tier.name}
                   </h4>
                   <div style={{ flex: 1, height: '1px', background: tier.color, opacity: 0.3 }}></div>
                </div>
                
                {tier.layout === 'grid' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: tier.id === 'diamond' ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
                    {tier.sponsors.map((s, si) => (
                      <div 
                        key={si} 
                        onClick={() => setSelectedSponsor(s)}
                        className="card clickable" 
                        style={{ 
                          padding: tier.id === 'diamond' ? '48px 24px' : '32px 18px', 
                          display: 'flex', flexDirection: 'column', 
                          alignItems: 'center', gap: '20px', 
                          border: tier.id === 'diamond' ? `2px solid ${tier.color}30` : '1px solid rgba(0,0,0,0.03)',
                          textAlign: 'center', 
                          background: tier.id === 'diamond' ? 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)' : 'white', 
                          borderRadius: '32px',
                          boxShadow: tier.id === 'diamond' ? '0 20px 40px rgba(0,0,0,0.05)' : 'var(--shadow-sm)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                         {tier.id === 'diamond' && (
                           <div style={{ 
                             position: 'absolute', top: '16px', right: '16px', 
                             background: tier.color, color: 'white', padding: '6px 14px', 
                             borderRadius: '10px', fontSize: '10px', fontWeight: '900' 
                           }}>
                             DESTAQUE DIAMANTE
                           </div>
                         )}
                         <div style={{ 
                           width: tier.id === 'diamond' ? '180px' : '100px', 
                           height: tier.id === 'diamond' ? '120px' : '80px', 
                           padding: '12px', background: 'white', 
                           borderRadius: '24px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                           display: 'flex', alignItems: 'center', justifyContent: 'center'
                         }}>
                            <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                         </div>
                         <div style={{ width: '100%' }}>
                            <h5 style={{ 
                              fontSize: tier.id === 'diamond' ? '22px' : '16px', 
                              fontWeight: '900', color: 'var(--secondary)', marginBottom: '6px',
                              fontFamily: 'var(--font-serif)'
                            }}>
                              {s.name}
                            </h5>
                            <p style={{ 
                              fontSize: tier.id === 'diamond' ? '14px' : '11px', 
                              color: 'var(--text-muted)', fontWeight: '700',
                              lineHeight: '1.4'
                            }}>
                              {s.tagline}
                            </p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {tier.sponsors.map((s, si) => (
                      <div 
                        key={si} 
                        onClick={() => setSelectedSponsor(s)}
                        className="card clickable" 
                        style={{ 
                          padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', 
                          border: '1px solid rgba(0,0,0,0.02)', background: 'rgba(255,255,255,0.8)', 
                          borderRadius: '20px',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                         <div style={{ 
                           width: '70px', height: '70px', borderRadius: '14px', 
                           border: '1px solid #f1f1f1', overflow: 'hidden', 
                           background: 'white', padding: '10px', flexShrink: 0 
                         }}>
                            <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                         </div>
                         <div style={{ flex: 1, overflow: 'hidden' }}>
                            <h5 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '4px' }}>{s.name}</h5>
                            <p style={{ 
                              fontSize: '12px', color: 'var(--text-muted)', 
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              fontWeight: '600'
                            }}>
                              {s.tagline}
                            </p>
                         </div>
                         <div style={{ 
                           padding: '10px', background: 'var(--accent)', borderRadius: '12px',
                           color: 'var(--primary)', display: 'flex'
                         }}>
                            <ExternalLink size={18} />
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        <button 
          onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/patrocinio/index.html', '_blank')} 
          className="btn-primary" 
          style={{ marginTop: '48px', width: '100%', padding: '18px', borderRadius: '16px' }}
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
  );
};

export default SponsorsView;
