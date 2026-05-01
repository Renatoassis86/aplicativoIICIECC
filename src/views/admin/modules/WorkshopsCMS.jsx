import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Download, Briefcase, ChevronRight, ChevronDown,
  MapPin, Clock, Edit3, Check, X as XIcon, Info
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const WorkshopsCMS = () => {
  const [workshops, setWorkshops] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkshops, setExpandedWorkshops] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null); // { id, value }
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    fetchData();

    // Realtime: atualiza automaticamente quando alguém se inscreve
    const channel = supabase
      .channel('workshop_registrations_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshop_registrations' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sessions } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
        .order('session_date')
        .order('start_time');

      const { data: regs } = await supabase
        .from('workshop_registrations')
        .select('workshop_id, user_cpf, created_at');

      const cpfs = [...new Set((regs || []).map(r => r.user_cpf))];
      const { data: membersData } = cpfs.length > 0
        ? await supabase.from('members').select('cpf, name, institution, email').in('cpf', cpfs)
        : { data: [] };

      const membersMap = (membersData || []).reduce((acc, m) => { acc[m.cpf] = m; return acc; }, {});

      const participantsList = (regs || []).map(r => ({
        workshop_id: r.workshop_id,
        registered_at: r.created_at,
        cpf: r.user_cpf,
        name: membersMap[r.user_cpf]?.name || r.user_cpf,
        institution: membersMap[r.user_cpf]?.institution || '',
        email: membersMap[r.user_cpf]?.email || '',
      }));

      setWorkshops(sessions || []);
      setParticipants(participantsList);
    } catch (err) {
      console.error('Error fetching admin workshop data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Regras de lotação global:
  // As 2 primeiras a atingir 100 inscritos → Auditório Principal (trava em 100)
  // As demais que atingirem 30 → Sala (A definir) (trava em 30)
  const LIMIT_AUDITORIO = 100;
  const LIMIT_SALA = 30;
  const MAX_AUDITORIO = 2;

  const auditorioIds = useMemo(() => {
    const counts = (w) => participants.filter(p => p.workshop_id === w.id).length;
    
    // Agrupa por horário
    const slots = {};
    workshops.forEach(w => {
      if (!slots[w.start_time]) slots[w.start_time] = [];
      slots[w.start_time].push(w);
    });

    const winners = [];
    Object.values(slots).forEach(workshopList => {
      // A mais popular de cada slot ganha o auditório
      const winner = [...workshopList].sort((a, b) => counts(b) - counts(a))[0];
      if (winner) winners.push(winner.id);
    });

    return new Set(winners);
  }, [workshops, participants]);

  const getCompetitiveCapacity = (workshop) =>
    auditorioIds.has(workshop.id) ? LIMIT_AUDITORIO : LIMIT_SALA;

  const getRoomLabel = (workshop) => {
    const wsCount = participants.filter(p => p.workshop_id === workshop.id).length;
    if (auditorioIds.has(workshop.id))
      return { label: 'Auditório Principal', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', locked: true };
    if (wsCount >= LIMIT_SALA)
      return { label: 'Sala — A definir', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', locked: true };
    return { label: `Sala — A definir (${wsCount}/${LIMIT_SALA})`, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', locked: false };
  };

  const handleSaveRoom = async (workshopId) => {
    setSavingRoom(true);
    try {
      await supabase
        .from('agenda_sessions')
        .update({ room: editingRoom.value.trim() || null })
        .eq('id', workshopId);
      setWorkshops(prev => prev.map(w =>
        w.id === workshopId ? { ...w, room: editingRoom.value.trim() || null } : w
      ));
      setEditingRoom(null);
    } catch (err) {
      alert('Erro ao salvar nome da sala: ' + err.message);
    } finally {
      setSavingRoom(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedWorkshops(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getParticipantsForWorkshop = (workshopId) =>
    participants.filter(p => p.workshop_id === workshopId);

  const exportToCSV = (workshop) => {
    const wsParticipants = getParticipantsForWorkshop(workshop.id);
    const headers = ['Nome', 'Email', 'Instituição', 'CPF', 'Data Inscrição'];
    const rows = wsParticipants.map(p => [
      p.name, p.email || 'N/A', p.institution || 'N/A', p.cpf,
      new Date(p.registered_at).toLocaleString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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

  const slots = ['14:15', '15:30'];

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
      Carregando dados das oficinas...
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Gestão de Oficinas</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Acompanhe inscrições e defina os nomes das salas no dia do evento.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="stat-card" style={{ padding: '12px 24px', minWidth: 'auto', marginBottom: 0 }}>
            <p style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Total Inscrições</p>
            <p style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{participants.length}</p>
          </div>
          <div className="stat-card" style={{ padding: '12px 24px', minWidth: 'auto', marginBottom: 0 }}>
            <p style={{ fontSize: '10px', color: '#48BB78', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Oficinas Ativas</p>
            <p style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{workshops.length}</p>
          </div>
        </div>
      </div>

      {/* Regra de negócio */}
      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: '800', color: '#F59E0B', marginBottom: '4px' }}>Regra de Alocação de Salas</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
            As <strong style={{ color: '#F59E0B' }}>2 primeiras a atingir 100 inscritos → Auditório Principal</strong> (inscrições travadas).
            As demais que <strong style={{ color: '#60A5FA' }}>atingirem 30 inscritos → Sala (A definir)</strong> (inscrições travadas).
            <br />Todas as oficinas ficam abertas até atingir o limite. O nome da sala pode ser editado clicando em <Edit3 size={11} style={{ display:'inline', verticalAlign:'middle' }} />.
          </p>
        </div>
      </div>

      {/* Search + Refresh */}
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
        <button onClick={fetchData} className="sync-btn" style={{ margin: 0 }}>ATUALIZAR</button>
      </div>

      {/* Workshops grouped by slot */}
      {slots.map(slot => {
        const slotWorkshops = filteredWorkshops.filter(w => w.start_time?.startsWith(slot));
        if (slotWorkshops.length === 0) return null;

        const slotLabel = slot === '14:15' ? '1º Horário — 14h15 às 15h15' : '2º Horário — 15h30 às 16h30';

        return (
          <div key={slot} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingLeft: '4px' }}>
              <Clock size={16} color="var(--gold)" />
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {slotLabel}
              </h3>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {slotWorkshops.map(workshop => {
                const wsParticipants = getParticipantsForWorkshop(workshop.id);
                const capacity = getCompetitiveCapacity(workshop);
                const roomInfo = getRoomLabel(workshop);
                const isExpanded = expandedWorkshops.includes(workshop.id);
                const isFull = wsParticipants.length >= capacity;
                const isEditing = editingRoom?.id === workshop.id;

                return (
                  <div key={workshop.id} className="card-main" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                      onClick={() => !isEditing && toggleExpand(workshop.id)}
                      style={{
                        padding: '20px 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: isEditing ? 'default' : 'pointer',
                        background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                        {/* Capacity badge */}
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                          background: roomInfo.bg, border: `1px solid ${roomInfo.color}40`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: roomInfo.color, lineHeight: 1 }}>{capacity}</span>
                          <span style={{ fontSize: '9px', color: roomInfo.color, opacity: 0.7 }}>vagas</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {workshop.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                              {workshop.speakers?.name || 'Sem palestrante'}
                            </span>
                            <span style={{ fontSize: '10px', background: roomInfo.bg, color: roomInfo.color, padding: '2px 8px', borderRadius: '6px', fontWeight: '700', border: `1px solid ${roomInfo.color}30` }}>
                              {roomInfo.label}
                            </span>
                          </div>

                          {/* Room field — editable */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
                            onClick={e => e.stopPropagation()}
                          >
                            <MapPin size={12} color="rgba(255,255,255,0.3)" />
                            {isEditing ? (
                              <>
                                <input
                                  autoFocus
                                  value={editingRoom.value}
                                  onChange={e => setEditingRoom({ id: workshop.id, value: e.target.value })}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveRoom(workshop.id); if (e.key === 'Escape') setEditingRoom(null); }}
                                  placeholder="Nome da sala..."
                                  style={{
                                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '8px', padding: '4px 10px', fontSize: '12px',
                                    outline: 'none', width: '160px'
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveRoom(workshop.id)}
                                  disabled={savingRoom}
                                  style={{ background: '#48BB78', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
                                >
                                  <Check size={13} color="white" />
                                </button>
                                <button
                                  onClick={() => setEditingRoom(null)}
                                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
                                >
                                  <XIcon size={13} color="white" />
                                </button>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '12px', color: workshop.room ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', fontStyle: workshop.room ? 'normal' : 'italic' }}>
                                  {workshop.room || 'A definir no dia'}
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); setEditingRoom({ id: workshop.id, value: workshop.room || '' }); }}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0.5 }}
                                  title="Editar nome da sala"
                                >
                                  <Edit3 size={12} color="white" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Inscritos counter */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Inscritos
                          </p>
                          <p style={{ fontSize: '22px', fontWeight: '900', color: isFull ? '#F87171' : 'var(--gold)', lineHeight: 1 }}>
                            {wsParticipants.length}<span style={{ fontSize: '14px', opacity: 0.5 }}>/{capacity}</span>
                          </p>
                          {isFull && (
                            <span style={{ fontSize: '9px', background: '#EF4444', color: 'white', padding: '1px 6px', borderRadius: '4px', fontWeight: '900' }}>LOTADA</span>
                          )}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Participants list */}
                    {isExpanded && (
                      <div style={{ padding: '0 24px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={15} /> INSCRITOS ({wsParticipants.length})
                          </h4>
                          <button
                            onClick={(e) => { e.stopPropagation(); exportToCSV(workshop); }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Download size={13} /> EXPORTAR CSV
                          </button>
                        </div>

                        {wsParticipants.length === 0 ? (
                          <div style={{ padding: '28px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '14px' }}>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Nenhum inscrito ainda.</p>
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '14px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                                  <th style={{ padding: '11px 16px', fontWeight: '700' }}>Congressista</th>
                                  <th style={{ padding: '11px 16px', fontWeight: '700' }}>Instituição</th>
                                  <th style={{ padding: '11px 16px', fontWeight: '700' }}>CPF</th>
                                  <th style={{ padding: '11px 16px', fontWeight: '700' }}>Inscrição</th>
                                </tr>
                              </thead>
                              <tbody>
                                {wsParticipants.map((p, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'white' }}>
                                    <td style={{ padding: '11px 16px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', flexShrink: 0 }}>
                                          {p.name?.charAt(0)}
                                        </div>
                                        <div>
                                          <p style={{ fontWeight: '700', fontSize: '13px' }}>{p.name}</p>
                                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{p.email}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{p.institution || '-'}</td>
                                    <td style={{ padding: '11px 16px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{p.cpf}</td>
                                    <td style={{ padding: '11px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
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
          </div>
        );
      })}

      {filteredWorkshops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px', background: 'var(--card-bg)', borderRadius: '32px', border: '1px dashed var(--border-color)' }}>
          <Briefcase size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>Nenhuma oficina encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopsCMS;
