import React, { useState, useEffect } from 'react';
import { Award, Briefcase, ExternalLink, ArrowLeft, Info, ShieldCheck, Zap, Handshake } from 'lucide-react';
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
      
      if (data) {
        setSponsors(data);
      }
      setLoading(false);
    };
    fetchSponsors();
  }, []);

  const tiers = [
    {
      name: 'Master & Diamante',
      icon: <Zap size={20} color="var(--gold)" />,
      color: 'var(--gold)',
      sponsors: sponsors.filter(s => s.tier === 'Master' || s.tier === 'Diamante').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: s.tier,
          website: s.website_url,
          tierColor: '#B9F2FF'
      }))
    },
    {
      name: 'Cota Ouro',
      icon: <Award size={20} color="#FFD700" />,
      color: '#FFD700',
      sponsors: sponsors.filter(s => s.tier === 'Ouro').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: s.tier,
          website: s.website_url,
          tierColor: '#FFD700'
      }))
    },
    {
      name: 'Cota Prata & Bronze',
      icon: <Briefcase size={20} color="#C0C0C0" />,
      color: '#C0C0C0',
      sponsors: sponsors.filter(s => s.tier === 'Prata' || s.tier === 'Bronze').map(s => ({
          ...s,
          logo: s.logo_url,
          tierName: s.tier,
          website: s.website_url,
          tierColor: '#C0C0C0'
      }))
    }
  ];

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

          {loading ? (
             <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Carregando parceiros...</p>
          ) : (
            <div style={{ display: 'grid', gap: '40px' }}>
              {tiers.map((tier, idx) => tier.sponsors.length > 0 && (
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
          )}

          <button 
            onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/patrocinio/index.html', '_blank')} 
            className="btn-primary" 
            style={{ marginTop: '40px', width: '100%' }}
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
