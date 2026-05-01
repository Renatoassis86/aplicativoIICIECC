import React, { useState, useEffect, useMemo } from 'react';
import {
  Check, Clock, ChevronLeft, AlertCircle, Lock, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Agrupa workshops por título e retorna lista de grupos com instâncias por horário
const groupByTitle = (workshops) => {
  const map = {};
  const order = [];
  workshops.forEach(w => {
    if (!map[w.title]) {
      map[w.title] = { title: w.title, speakerName: w.speakerName, slots: {} };
      order.push(w.title);
    }
    map[w.title].slots[w.start_time.substring(0, 5)] = w;
  });
  return order.map(t => map[t]);
};

const SLOT_A = '14:15';
const SLOT_B = '15:30';
const SLOT_LABELS = {
  [SLOT_A]: '14h15',
  [SLOT_B]: '15h30',
};

const WorkshopsView = ({ userCpf, onClose }) => {
  const [workshops, setWorkshops] = useState([]);
  // confirmed: { [slotKey]: workshopId } — salvo definitivamente no DB
  const [confirmed, setConfirmed] = useState({});
  // pending: { [slotKey]: workshopId } — seleção local ainda não confirmada
  const [pending, setPending] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userModality, setUserModality] = useState(null); // 'presencial' | 'online'
  const [checkingModality, setCheckingModality] = useState(true);

  useEffect(() => { fetchData(); }, [userCpf]);

  const fetchData = async () => {
    setLoading(true);
    setCheckingModality(true);
    try {
      // Busca modalidade do membro
      const { data: member } = await supabase
        .from('members')
        .select('modality')
        .eq('cpf', userCpf)
        .single();
      
      const modality = (member?.modality || '').toLowerCase();
      const isOnline = modality.includes('online');
      setUserModality(isOnline ? 'online' : 'presencial');
      setCheckingModality(false);

      if (isOnline) {
        setLoading(false);
        return;
      }

      const { data: sessions } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
        .order('title')
        .order('start_time');

      const { data: userRegs } = await supabase
        .from('workshop_registrations')
        .select('workshop_id')
        .eq('user_cpf', userCpf);

      const { data: counts } = await supabase
        .from('workshop_counts')
        .select('*');

      const countsMap = (counts || []).reduce((acc, c) => {
        acc[c.workshop_id] = parseInt(c.registration_count, 10);
        return acc;
      }, {});

      const mapped = (sessions || []).map(s => ({
        ...s,
        registrations: countsMap[s.id] || 0,
        speakerName: s.speakers?.name || 'A confirmar',
        slotKey: s.start_time.substring(0, 5),
      }));

      setWorkshops(mapped);

      // Reconstruir confirmed a partir das inscrições do usuário
      const regIds = (userRegs || []).map(r => r.workshop_id);
      if (regIds.length > 0) {
        const confMap = {};
        mapped.forEach(w => {
          if (regIds.includes(w.id)) {
            confMap[w.slotKey] = w.id;
          }
        });
        setConfirmed(confMap);
        setPending({});
      }
    } catch (err) {
      console.error('Error fetching workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Regras de lotação:
  // Permitimos que as oficinas cresçam até 100 SE elas forem uma das 2 mais procuradas.
  // Caso contrário, o limite é 30.
  const LIMIT_AUDITORIO = 100;
  const LIMIT_SALA = 30;
  const MAX_AUDITORIO = 2; 

  const auditorioIds = useMemo(() => {
    // Identifica as 2 oficinas com mais inscritos em toda a grade
    const sortedByRegs = [...workshops].sort((a, b) => (b.registrations || 0) - (a.registrations || 0));
    const top2Ids = sortedByRegs.slice(0, MAX_AUDITORIO).map(w => w.id);
    return new Set(top2Ids);
  }, [workshops]);

  const getCapacity = (w) => {
    // Se estiver no Top 2 global, o limite é o do Auditório (100)
    // Caso contrário, o limite é o da Sala (30)
    return auditorioIds.has(w.id) ? LIMIT_AUDITORIO : LIMIT_SALA;
  };
  const isFull = (w) => (w.registrations || 0) >= getCapacity(w);

  const isFinished = Object.keys(confirmed).length >= 2;

  const groups = groupByTitle(workshops);



  const handleSelect = (slotKey, workshop) => {
    if (saving || isFinished) return;
    if (isFull(workshop)) return;

    // Toggle: desmarca se já está pendente neste slot
    if (pending[slotKey] === workshop.id) {
      setPending(prev => { const n = { ...prev }; delete n[slotKey]; return n; });
      return;
    }

    // Bloqueia se este título já foi escolhido no outro slot (pending ou confirmed)
    const otherSlot = slotKey === SLOT_A ? SLOT_B : SLOT_A;
    const otherPendingId = pending[otherSlot] || confirmed[otherSlot];
    const otherTitle = workshops.find(w => w.id === otherPendingId)?.title;
    if (otherTitle && otherTitle === workshop.title) return;

    const newPending = { ...pending, [slotKey]: workshop.id };
    setPending(newPending);

    // Se os dois slots foram escolhidos, abre confirmação
    if (Object.keys(newPending).length === 2) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async () => {
    if (Object.keys(pending).length < 2) return;
    setSaving(true);
    setShowConfirmModal(false);
    try {
      const toInsert = Object.values(pending).map(id => ({ user_cpf: userCpf, workshop_id: id }));
      const { error } = await supabase.from('workshop_registrations').insert(toInsert);
      if (error) throw error;
      const newConfirmed = { ...pending };
      setConfirmed(newConfirmed);
      setPending({});
      await fetchData();
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Erro ao confirmar. Tente novamente.');
      setShowConfirmModal(true);
    } finally {
      setSaving(false);
    }
  };

  const getWorkshopById = (id) => workshops.find(w => w.id === id);

  const pendingList = Object.entries(pending)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slot, id]) => ({ slot, workshop: getWorkshopById(id) }))
    .filter(x => x.workshop);

  const confirmedList = Object.entries(confirmed)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slot, id]) => ({ slot, workshop: getWorkshopById(id) }))
    .filter(x => x.workshop);

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', maxWidth: '500px', margin: '0 auto' }}>

      {/* Header */}
      <header style={{
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 20px 24px',
        background: 'linear-gradient(135deg, #4A101D 0%, #111111 100%)',
        color: 'white', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px 16px',
            borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer'
          }}>
            <ChevronLeft size={20} /> Voltar
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#D4C19C' }}>Oficinas</h2>
          <div style={{ width: '80px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0,
            background: isFinished ? '#48BB78' : '#D4C19C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '900', color: '#111'
          }}>
            {isFinished ? <Lock size={20} color="#111" /> : `${Object.keys(pending).length}/2`}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800' }}>
              {isFinished ? 'Inscrições Confirmadas' : Object.keys(pending).length === 1 ? 'Escolha mais uma oficina' : 'Escolha suas oficinas'}
            </p>
            <p style={{ fontSize: '11px', opacity: 0.75 }}>
              {isFinished ? 'Suas escolhas são definitivas.' : 'Selecione um horário para cada oficina que irá.'}
            </p>
          </div>
        </div>
      </header>
      
      {userModality === 'online' && !checkingModality ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#EBF8FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <AlertCircle size={40} color="#3182CE" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#2D3748', marginBottom: '16px' }}>
            Acesso Exclusivo Presencial
          </h3>
          <p style={{ fontSize: '15px', color: '#4A5568', lineHeight: '1.6', marginBottom: '24px' }}>
            Identificamos que sua inscrição é para participação <strong>Online</strong>. 
          </p>
          <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: '1.5' }}>
              As oficinas práticas com escolha de vagas são destinadas apenas aos participantes que estarão fisicamente no evento.
              <br/><br/>
              <strong>Para você:</strong> Teremos uma transmissão especial com conteúdos exclusivos para o público online durante o horário das oficinas. Fique atento à agenda!
            </p>
          </div>
          <button onClick={onClose} style={{ width: '100%', background: '#3182CE', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontWeight: 'bold' }}>
            ENTENDIDO
          </button>
        </div>
      ) : (
      <div style={{ padding: '20px', paddingBottom: '120px' }}>

        {/* Resumo das confirmadas */}
        {isFinished && (
          <div style={{ marginBottom: '24px', background: 'white', padding: '20px', borderRadius: '24px', border: '2px solid #48BB78', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#22C55E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} /> INSCRIÇÕES CONFIRMADAS
            </h4>
            {confirmedList.map(({ slot, workshop }) => (
              <div key={workshop.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                  {SLOT_LABELS[slot]}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A365D', lineHeight: '1.3' }}>{workshop.title}</p>
                  <p style={{ fontSize: '11px', color: '#718096' }}>{workshop.speakerName}</p>
                </div>
              </div>
            ))}
            <p style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={10} /> Não é possível alterar após a confirmação.
            </p>
          </div>
        )}

        {/* Instrução */}
        {!isFinished && (
          <div style={{ background: '#FFFBEB', padding: '14px 16px', borderRadius: '16px', border: '1px solid #FCD34D', display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.6' }}>
              Cada oficina acontece nos <strong>dois horários</strong>. Escolha <strong>em qual horário</strong> você vai participar de cada uma. Você <strong>não pode</strong> escolher a mesma oficina nos dois horários. Após confirmar, <strong>não será possível alterar</strong>.
            </p>
          </div>
        )}

        {/* Cabeçalho de colunas */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 88px', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
            <div />
            {[SLOT_A, SLOT_B].map(slot => (
              <div key={slot} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Clock size={11} color="var(--primary)" />
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)' }}>{SLOT_LABELS[slot]}</span>
                </div>
                <p style={{ fontSize: '10px', color: '#A0AEC0', fontWeight: '500' }}>
                  {slot === SLOT_A ? '14h15–15h15' : '15h30–16h30'}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>Carregando oficinas...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groups.map(group => {
              const confirmedSlot = Object.entries(confirmed).find(([, id]) => getWorkshopById(id)?.title === group.title)?.[0];
              const pendingSlot = Object.entries(pending).find(([, id]) => getWorkshopById(id)?.title === group.title)?.[0];
              const chosenSlot = confirmedSlot || pendingSlot;

              return (
                <div key={group.title} style={{
                  background: 'white', borderRadius: '18px', padding: '14px 16px',
                  boxShadow: chosenSlot ? '0 4px 16px rgba(107,20,26,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: chosenSlot ? '2px solid var(--primary)' : '2px solid transparent',
                  display: 'grid', gridTemplateColumns: '1fr 88px 88px', gap: '8px', alignItems: 'center'
                }}>
                  {/* Nome + palestrante */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#1A365D', lineHeight: '1.35', marginBottom: '2px' }}>
                      {group.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#718096' }}>{group.speakerName}</p>
                  </div>

                  {/* Botão para cada horário */}
                  {[SLOT_A, SLOT_B].map(slot => {
                    const w = group.slots[slot];
                    if (!w) {
                      return <div key={slot} style={{ height: '48px' }} />;
                    }

                    const isConfirmedHere = confirmed[slot] === w.id;
                    const isPendingHere = pending[slot] === w.id;
                    const isSelected = isConfirmedHere || isPendingHere;
                    const full = isFull(w);
                    const capacity = getCapacity(w);

                    // Bloqueado: já confirmou no outro slot com este mesmo título
                    const otherSlot = slot === SLOT_A ? SLOT_B : SLOT_A;
                    const otherChosenId = confirmed[otherSlot] || pending[otherSlot];
                    const otherTitle = workshops.find(x => x.id === otherChosenId)?.title;
                    const blockedSameTitle = otherTitle === group.title;

                    const disabled = isFinished || full || blockedSameTitle;

                    return (
                      <button
                        key={slot}
                        onClick={() => !disabled && handleSelect(slot, w)}
                        style={{
                          height: '52px', borderRadius: '14px', border: 'none',
                          cursor: disabled && !isSelected ? 'not-allowed' : 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
                          background: isConfirmedHere ? '#22C55E'
                            : isPendingHere ? 'var(--primary)'
                            : blockedSameTitle ? '#F8F9FA'
                            : full ? '#FEF2F2'
                            : '#F7F8FA',
                          opacity: disabled && !isSelected ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                      >
                        {isConfirmedHere ? (
                          <>
                            <Lock size={14} color="white" />
                            <span style={{ fontSize: '9px', fontWeight: '900', color: 'white' }}>CONFIRMADO</span>
                          </>
                        ) : isPendingHere ? (
                          <>
                            <Check size={14} color="white" />
                            <span style={{ fontSize: '9px', fontWeight: '900', color: 'white' }}>ESCOLHIDO</span>
                          </>
                        ) : blockedSameTitle ? (
                          <span style={{ fontSize: '9px', fontWeight: '700', color: '#A0AEC0', textAlign: 'center', lineHeight: '1.3', padding: '0 4px' }}>já escolheu este</span>
                        ) : full ? (
                          <span style={{ fontSize: '9px', fontWeight: '800', color: '#EF4444', textAlign: 'center', lineHeight: '1.3', padding: '0 4px' }}>esgotado</span>
                        ) : (
                          <>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)' }}>{SLOT_LABELS[slot]}</span>
                            <span style={{ fontSize: '9px', color: '#A0AEC0' }}>{w.registrations} inscritos</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* ====== MODAL DE CONFIRMAÇÃO ====== */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '32px 32px 28px 28px', padding: '32px 24px',
            width: '100%', maxWidth: '420px', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ width: '56px', height: '56px', background: '#FDF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', textAlign: 'center', marginBottom: '12px' }}>
              Confirmar inscrições?
            </h3>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#991B1B', lineHeight: '1.6', fontWeight: '600', margin: 0 }}>
                <strong>Atenção!</strong> Após confirmar, <strong>não será possível alterar</strong> suas escolhas de oficinas. Esta decisão é definitiva.
              </p>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingList.map(({ slot, workshop }) => (
                <div key={workshop.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                    {SLOT_LABELS[slot]}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#1A365D', lineHeight: '1.3' }}>{workshop.title}</p>
                    <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{workshop.speakerName}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', padding: '18px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', width: '100%' }}
              >
                {saving ? 'CONFIRMANDO...' : 'SIM, CONFIRMAR MINHAS ESCOLHAS'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
              >
                NÃO, VOLTAR E ALTERAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL DE SUCESSO ====== */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,15,26,0.9)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '24px'
        }}>
          <div style={{
            background: 'white', borderRadius: '32px', padding: '40px 24px',
            width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: '80px', height: '80px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={44} color="#22C55E" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>Inscrições Confirmadas!</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: '1.6' }}>Suas vagas nas oficinas estão garantidas.</p>
            <p style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '28px' }}>Você receberá o local das salas no dia do evento.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', width: '100%' }}
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#1A365D', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', fontSize: '14px' }}>PROCESSANDO...</div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsView;
