import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Briefcase, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  MapPin,
  Clock,
  Filter,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const WorkshopsCMS = () => {
  const [workshops, setWorkshops] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkshops, setExpandedWorkshops] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Workshops
      const { data: sessions } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
        .order('session_date')
        .order('start_time');
      
      // 2. Fetch Participants (joined)
      const { data: regs } = await supabase
        .from('workshop_registrations')
        .select(`
          workshop_id,
          created_at,
          members (
            name,
            cpf,
            institution,
            email
          )
        `);

      const participantsList = (regs || []).map(r => ({
        workshop_id: r.workshop_id,
        registered_at: r.created_at,
        ...r.members
      }));

      const filteredSessions = (sessions || []).filter(s => {
        const title = s.title?.toLowerCase() || '';
        return !title.includes('abertura') && !title.includes('encerramento') && !title.includes('coffee');
      });

      setWorkshops(filteredSessions || []);
      setParticipants(participantsList);
    } catch (err) {
      console.error('Error fetching admin workshop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedWorkshops(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getParticipantsForWorkshop = (workshopId) => {
    return participants.filter(p => p.workshop_id === workshopId);
  };

  const exportToCSV = (workshop) => {
    const wsParticipants = getParticipantsForWorkshop(workshop.id);
    const headers = ['Nome', 'Email', 'Instituição', 'CPF', 'Data Inscrição'];
    const rows = wsParticipants.map(p => [
      p.name,
      p.email || 'N/A',
      p.institution || 'N/A',
      p.cpf,
      new Date(p.registered_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inscritos_oficina_${workshop.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredWorkshops = workshops.filter(w => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
      Carregando dados das oficinas...
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Gestão de Oficinas</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Acompanhe a demanda e a lista de inscritos por atividade.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="stat-card" style={{ padding: '12px 24px', minWidth: 'auto', marginBottom: 0 }}>
             <p style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Total de Inscrições</p>
             <p style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{participants.length}</p>
          </div>
          <div className="stat-card" style={{ padding: '12px 24px', minWidth: 'auto', marginBottom: 0 }}>
             <p style={{ fontSize: '10px', color: '#48BB78', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Oficinas Ativas</p>
             <p style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{workshops.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-main" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Search size={18} color="rgba(255,255,255,0.3)" />
          <input 
            type="text" 
            placeholder="Buscar oficina..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '14px' }}
          />
        </div>
        <button onClick={fetchData} className="sync-btn" style={{ margin: 0 }}>ATUALIZAR LISTA</button>
      </div>

      {/* Workshops List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredWorkshops.map(workshop => {
          const wsParticipants = getParticipantsForWorkshop(workshop.id);
          const isExpanded = expandedWorkshops.includes(workshop.id);

          return (
            <div key={workshop.id} className="card-main" style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                onClick={() => toggleExpand(workshop.id)}
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '16px', 
                    background: 'rgba(212, 193, 156, 0.1)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Briefcase size={24} color="var(--gold)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{workshop.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <Calendar size={14} /> 
                        {workshop.session_date ? new Date(workshop.session_date + 'T00:00:00').toLocaleDateString() : 'Data N/D'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <Clock size={14} /> {workshop.start_time?.slice(0, 5)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <MapPin size={14} /> {workshop.room || 'Auditório'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                   <div style={{ textAlign: 'right' }}>
                    {(() => {
                      // Motor Competitivo no Admin
                      const slotWorkshops = workshops.filter(w => w.start_time === workshop.start_time);
                      const sorted = [...slotWorkshops].sort((a, b) => {
                        const aCount = participants.filter(p => p.workshop_id === a.id).length;
                        const bCount = participants.filter(p => p.workshop_id === b.id).length;
                        return bCount - aCount;
                      });
                      
                      let capacity = 30;
                      if (workshop.id === sorted[0]?.id) capacity = 100;
                      else if (workshop.id === sorted[1]?.id || workshop.id === sorted[2]?.id) capacity = 60;
                      
                      const isFull = wsParticipants.length >= capacity;
                      
                      return (
                        <>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Inscritos / Limite Dinâmico</p>
                          <p style={{ fontSize: '24px', fontWeight: '900', color: isFull ? '#F87171' : 'var(--gold)' }}>
                            {wsParticipants.length} / {capacity}
                          </p>
                          {isFull && (
                            <span style={{ fontSize: '9px', background: '#EF4444', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '900' }}>ENCERRADA</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 24px 24px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} /> LISTA DE INSCRITOS
                    </h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); exportToCSV(workshop); }}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', 
                        color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '12px',
                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <Download size={14} /> EXPORTAR CSV
                    </button>
                  </div>

                  {wsParticipants.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Nenhum congressista inscrito nesta oficina até o momento.</p>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '16px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>Congressista</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>Instituição</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>CPF</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>Inscrição</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wsParticipants.map((p, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'white' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>
                                    {p.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p style={{ fontWeight: '700' }}>{p.name}</p>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{p.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>{p.institution || '-'}</td>
                              <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{p.cpf}</td>
                              <td style={{ padding: '12px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                                {new Date(p.registered_at).toLocaleDateString()} {new Date(p.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredWorkshops.length === 0 && (
         <div style={{ textAlign: 'center', padding: '80px', background: 'var(--card-bg)', borderRadius: '32px', border: '1px dashed var(--border-color)' }}>
            <Briefcase size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>Nenhuma oficina encontrada com os critérios de busca.</p>
         </div>
      )}
    </div>
  );
};

export default WorkshopsCMS;
