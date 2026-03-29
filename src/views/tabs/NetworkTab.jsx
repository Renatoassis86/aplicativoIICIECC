import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  UserPlus, 
  Heart, 
  Check, 
  Search, 
  Briefcase 
} from 'lucide-react';

const NetworkTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('conectados');

  const participants = [
    { 
      id: 1, 
      name: 'Dr. Roberto Santos', 
      role: 'Diretor Escolar', 
      location: 'São Paulo, SP', 
      interests: ['Gestão', 'Teologia'],
      status: 'pendente' 
    },
    { 
      id: 2, 
      name: 'Ana Claudia Melo', 
      role: 'Educadora Cristã', 
      location: 'João Pessoa, PB', 
      interests: ['Artes', 'Latim'],
      status: 'conectado' 
    },
    { 
      id: 3, 
      name: 'Marcelo Vieira', 
      role: 'Gestor FICV', 
      location: 'João Pessoa, PB', 
      interests: ['Administração', 'CIECC'],
      status: 'conectado' 
    },
    { 
      id: 4, 
      name: 'Juliana Paes', 
      role: 'Palestrante Convidada', 
      location: 'Brasília, DF', 
      interests: ['Alfabetização', 'Fônicos'],
      status: 'novo' 
    },
  ];

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      <header style={{ 
        padding: '24px 20px 16px', 
        background: 'white', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)', marginBottom: '16px' }}>Network</h2>
        
        {/* Connection Stats / Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} color="#CBD5E0" style={{ position: 'absolute', left: '16px', top: '14px' }} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou cargo..."
            style={{
              width: '100%',
              padding: '14px 14px 14px 44px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: '#F8F9FA'
            }}
          />
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={() => setActiveSubTab('conectados')}
            style={{ 
              fontSize: '13px', 
              fontWeight: activeSubTab === 'conectados' ? '700' : '600', 
              color: activeSubTab === 'conectados' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeSubTab === 'conectados' ? '2px solid var(--primary)' : 'none',
              paddingBottom: '8px',
              transition: 'var(--transition)'
            }}
          >
            Conectados
          </button>
          <button 
            onClick={() => setActiveSubTab('pendentes')}
            style={{ 
              fontSize: '13px', 
              fontWeight: activeSubTab === 'pendentes' ? '700' : '600', 
              color: activeSubTab === 'pendentes' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeSubTab === 'pendentes' ? '2px solid var(--primary)' : 'none',
              paddingBottom: '8px',
              position: 'relative'
            }}
          >
            Solicitações 
            <span style={{ 
              marginLeft: '4px', 
              background: 'var(--primary)', 
              color: 'white', 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '50px' 
            }}>1</span>
          </button>
          <button 
            onClick={() => setActiveSubTab('explorar')}
            style={{ 
              fontSize: '13px', 
              fontWeight: activeSubTab === 'explorar' ? '700' : '600', 
              color: activeSubTab === 'explorar' ? 'var(--text-muted)' : 'var(--text-muted)',
              paddingBottom: '8px'
            }}
          >
            Explorar
          </button>
        </div>
      </header>

      {/* Participants List */}
      <section style={{ padding: '20px' }}>
        {participants.filter(p => activeSubTab === 'explorar' || p.status === 'conectado' || (activeSubTab === 'pendentes' && p.status === 'pendente')).map(p => (
          <div key={p.id} className="card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              color: 'var(--primary)',
              fontSize: '20px',
              flexShrink: 0
            }}>
              {p.name.charAt(0)}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </h4>
                {p.status === 'conectado' && <Check size={16} color="#38A169" />}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {p.role} • {p.location}
              </p>
              
              {/* Special Interest Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {p.interests.map(t => (
                  <span key={t} style={{ 
                    fontSize: '10px', 
                    padding: '4px 8px', 
                    background: '#F1F3F5', 
                    borderRadius: '4px', 
                    color: 'var(--text-muted)',
                    fontWeight: '600' 
                  }}>#{t}</span>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ 
                  flex: 1, 
                  padding: '10px', 
                  background: p.status === 'conectado' ? 'var(--primary)' : 'white', 
                  color: p.status === 'conectado' ? 'white' : 'var(--primary)',
                  border: p.status === 'conectado' ? 'none' : '1px solid var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  {p.status === 'conectado' ? <MessageSquare size={16} /> : <UserPlus size={16} />}
                  {p.status === 'conectado' ? 'Enviar Mensagem' : 'Solicitar Conexão'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Space for Sponsors / Partners */}
        <section style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Briefcase size={18} color="var(--primary)" />
            <h4 style={{ fontWeight: '700', fontSize: '16px' }}>Parceiros & Conexão Comercial</h4>
          </div>
          <div className="card" style={{ background: 'var(--bg-app)', border: '1px dashed #CBD5E0', textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Encontre aqui todos os patrocinadores disponíveis para reuniões e networking comercial.
            </p>
            <button style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '700', marginTop: '16px' }}>
              Ver lista de parceiros
            </button>
          </div>
        </section>
      </section>
    </div>
  );
};

export default NetworkTab;
