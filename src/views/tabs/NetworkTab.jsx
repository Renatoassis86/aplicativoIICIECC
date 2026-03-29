import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, MapPin, Building, Briefcase, Award, ArrowRight, UserCog, User, Users, RefreshCw, X } from 'lucide-react';
import { fetchNetworkProfiles } from '../../services/networking/networkService';

export default function NetworkTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States de Filtro e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'Todos', icon: <Users size={14} /> },
    { id: 'palestrante', label: 'Palestrantes', icon: <Award size={14} /> },
    { id: 'congressista', label: 'Congressistas', icon: <User size={14} /> },
    { id: 'expositor', label: 'Expositores', icon: <Building size={14} /> },
    { id: 'parceiro', label: 'Parceiros', icon: <Briefcase size={14} /> },
    { id: 'staff', label: 'Organização', icon: <UserCog size={14} /> }
  ];

  useEffect(() => {
    let isMounted = true;
    
    const loadNetwork = async () => {
      setLoading(true);
      const data = await fetchNetworkProfiles(searchTerm, activeFilter);
      if (isMounted) {
        setProfiles(data);
        setLoading(false);
      }
    };

    // Delay leve de busca para não travar enquanto digita
    const timer = setTimeout(() => {
      loadNetwork();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, activeFilter]);

  // Função utilitária para obter a identidade visual de cada tipo de usuário
  const getBadgeStyle = (type) => {
    switch(type) {
      case 'palestrante':
        return { bg: 'rgba(212, 193, 156, 0.2)', color: 'var(--gold)', label: 'Palestrante', icon: <Award size={12}/> };
      case 'expositor':
        return { bg: 'rgba(56, 161, 105, 0.1)', color: '#38A169', label: 'Expositor', icon: <Building size={12}/> };
      case 'parceiro':
        return { bg: 'rgba(43, 108, 176, 0.1)', color: '#2B6CB0', label: 'Parceiro', icon: <Briefcase size={12}/> };
      case 'staff':
        return { bg: 'var(--primary)', color: 'white', label: 'Organização', icon: <UserCog size={12}/> };
      default: // Congressista
        return { bg: 'rgba(0,0,0,0.05)', color: 'var(--text-main)', label: 'Congressista', icon: <User size={12}/> };
    }
  };

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* 1. Header Fixo & Barra de Busca */}
      <section style={{ 
        padding: '24px 20px', 
        background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)',
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
          Networking CIECC
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
          Conecte-se com professores, palestrantes e diretores de todo o Brasil.
        </p>

        {/* Input de Busca */}
        <div style={{ position: 'relative' }}>
          <Search size={20} color="var(--primary)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou instituição..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 16px 14px 44px', 
              borderRadius: '12px', 
              border: 'none',
              background: 'white',
              color: 'var(--primary)',
              fontWeight: '600',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ position: 'absolute', right: '16px', top: '14px', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </section>

      {/* 2. Filtros Horizontais (Pills) */}
      <section style={{ 
        padding: '20px',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {filterOptions.map(opt => (
          <button 
            key={opt.id}
            onClick={() => setActiveFilter(opt.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: '1px solid',
              borderColor: activeFilter === opt.id ? 'var(--gold)' : 'rgba(0,0,0,0.1)',
              background: activeFilter === opt.id ? 'var(--gold)' : 'white',
              color: activeFilter === opt.id ? 'var(--secondary)' : 'var(--text-muted)',
              fontWeight: activeFilter === opt.id ? '800' : '600',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {opt.label}
          </button>
        ))}
      </section>

      {/* 3. Lista de Perfis & Estados de UI */}
      <section style={{ padding: '0 20px 20px' }}>
        
        {loading ? (
          /* Loading Skeleton */
          <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <RefreshCw size={32} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px' }}>Buscando conexões...</p>
          </div>
        ) : profiles.length === 0 ? (
          /* Empty State Severo e Elegante */
          <div className="card fade-in" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(107, 20, 26, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Filter size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>Nenhum perfil encontrado</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Não localizamos ninguém com estes termos no nosso diretório autorizado.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
              style={{ display: 'inline-flex', padding: '12px 24px', width: 'auto' }}
            >
              Resgatar Filtros
            </button>
          </div>
        ) : (
          /* Lista Renderizada */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
              {profiles.length} resultados encontrados
            </p>
            
            {profiles.map(profile => {
              const badge = getBadgeStyle(profile.type);
              const initial = profile.name.charAt(0).toUpperCase();
              
              return (
                <div key={profile.id} className="card fade-in" style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  borderLeft: profile.type === 'palestrante' || profile.type === 'staff' ? `4px solid ${badge.color}` : 'none'
                }}>
                  
                  {/* Avatar / Initials */}
                  <div style={{ 
                    minWidth: '56px', height: '56px', borderRadius: '50%', 
                    background: profile.type === 'palestrante' ? 'var(--gold)' : 'var(--bg-app)', 
                    color: profile.type === 'palestrante' ? 'var(--primary)' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)',
                    border: '2px solid rgba(0,0,0,0.05)'
                  }}>
                    {initial}
                  </div>

                  {/* Detalhes Institucionais */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.name}
                      </h4>
                      {profile.verified && <ShieldCheck size={16} color="#38A169" />}
                    </div>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.role}
                    </p>
                    
                    {profile.institution && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {profile.institution}
                      </p>
                    )}
                  </div>

                  {/* Botão de Conexão ou Detalhes */}
                  <div style={{ marginLeft: '8px' }}>
                    <button style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                    }}>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

    </div>
  );
}

