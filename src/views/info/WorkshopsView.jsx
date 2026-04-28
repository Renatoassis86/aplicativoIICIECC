import React, { useState, useEffect } from 'react';
import {
  Check, Clock, ChevronLeft, Search,
  AlertCircle, Users, Lock, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const WorkshopsView = ({ userCpf, onClose }) => {
  const [workshops, setWorkshops] = useState([]);
  const [confirmed, setConfirmed] = useState([]); // IDs salvos definitivamente no DB
  const [pending, setPending] = useState({});     // { [slotKey]: workshopId } — seleção local ainda não confirmada
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => { fetchData(); }, [userCpf]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sessions } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
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
        speakerName: s.speakers?.name || 'A confirmar'
      }));

      setWorkshops(mapped);

      const regIds = (userRegs || []).map(r => r.workshop_id);
      setConfirmed(regIds);

      // Se já tem inscrições confirmadas, limpa o pending
      if (regIds.length > 0) {
        setPending({});
      }
    } catch (err) {
      console.error('Error fetching workshop data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Motor competitivo de capacidade (1º=100, 2º/3º=60, demais=30)
  const getCapacity = (workshop) => {
    const slotWorkshops = workshops.filter(w => w.start_time === workshop.start_time);
    const sorted = [...slotWorkshops].sort((a, b) => (b.registrations || 0) - (a.registrations || 0));
    if (workshop.id === sorted[0]?.id) return 100;
    if (workshop.id === sorted[1]?.id || workshop.id === sorted[2]?.id) return 60;
    return 30;
  };

  const isFull = (w) => (w.registrations || 0) >= getCapacity(w);

  // Já confirmou as 2 → tudo bloqueado
  const isFinished = confirmed.length >= 2;

  const slotKeys = ['14:15', '15:30'];
  const slotLabels = {
    '14:15': '1º Horário — 14h15 às 15h15',
    '15:30': '2º Horário — 15h30 às 16h30'
  };

  const getSlotKey = (w) => w.start_time?.substring(0, 5);

  const getWorkshopById = (id) => workshops.find(w => w.id === id);

  const pendingList = Object.values(pending).map(id => getWorkshopById(id)).filter(Boolean);
  const confirmedList = confirmed.map(id => getWorkshopById(id)).filter(Boolean);

  const handleSelect = (workshop) => {
    if (saving || isFinished) return;

    const slotKey = getSlotKey(workshop);
    if (!slotKey) return;

    // Toggle: se já está pendente neste slot, desmarca
    if (pending[slotKey] === workshop.id) {
      setPending(prev => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
      return;
    }

    // Bloquear lotada
    if (isFull(workshop)) return;

    // Seleciona neste slot (substituindo qualquer outro do mesmo slot)
    const newPending = { ...pending, [slotKey]: workshop.id };
    setPending(newPending);

    // Se os dois slots foram escolhidos, abre modal de confirmação
    const selectedSlots = Object.keys(newPending);
    if (selectedSlots.length === 2) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = async () => {
    if (Object.keys(pending).length < 2) return;
    setSaving(true);
    setShowConfirmModal(false);
    try {
      const toInsert = Object.values(pending).map(id => ({
        user_cpf: userCpf,
        workshop_id: id
      }));
      const { error } = await supabase
        .from('workshop_registrations')
        .insert(toInsert);
      if (error) throw error;
      setConfirmed(Object.values(pending));
      setPending({});
      await fetchData();
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving workshops:', err);
      alert('Erro ao confirmar inscrições. Tente novamente.');
      setShowConfirmModal(true);
    } finally {
      setSaving(false);
    }
  };

  const matchesSearch = (w) =>
    !searchTerm ||
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.speakerName.toLowerCase().includes(searchTerm.toLowerCase());

  const getCardState = (workshop) => {
    const slotKey = getSlotKey(workshop);
    if (confirmed.includes(workshop.id)) return 'confirmed';
    if (pending[slotKey] === workshop.id) return 'pending';
    return 'default';
  };

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>

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

        {/* Status pill */}
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
              {isFinished
                ? 'Inscrições Confirmadas'
                : Object.keys(pending).length === 1
                  ? 'Falta escolher mais uma'
                  : 'Escolha suas oficinas'}
            </p>
            <p style={{ fontSize: '11px', opacity: 0.75 }}>
              {isFinished
                ? 'Suas escolhas são definitivas.'
                : 'Uma oficina por bloco de horário.'}
            </p>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 20px', paddingBottom: '120px' }}>

        {/* Resumo das confirmadas */}
        {isFinished && (
          <div style={{ marginBottom: '28px', background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '2px solid #48BB78' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#22C55E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} /> INSCRIÇÕES CONFIRMADAS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {confirmedList.map(w => (
                <div key={w.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                    {w.start_time?.substring(0, 5)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A365D', lineHeight: '1.3' }}>{w.title}</p>
                    <p style={{ fontSize: '11px', color: '#718096' }}>{w.speakerName}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#A0AEC0', marginTop: '14px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={10} /> Não é possível alterar após a confirmação.
            </p>
          </div>
        )}

        {/* Instrução geral */}
        {!isFinished && (
          <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '20px', border: '1px solid #FCD34D', display: 'flex', gap: '12px', marginBottom: '28px' }}>
            <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', marginBottom: '4px' }}>Como funciona</p>
              <p style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.6' }}>
                Escolha <strong>uma oficina para o 1º horário</strong> e <strong>uma para o 2º horário</strong>. Após confirmar as duas escolhas, <strong>não será possível alterar</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ background: 'white', padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Search size={18} color="#A0AEC0" />
          <input
            type="text"
            placeholder="Filtrar por nome ou palestrante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#4A5568', background: 'transparent' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>Carregando oficinas...</p>
          </div>
        ) : (
          slotKeys.map(slotKey => {
            const slotWorkshops = workshops.filter(w => getSlotKey(w) === slotKey).filter(matchesSearch);
            const selectedInSlot = pending[slotKey] || confirmed.find(id => {
              const w = getWorkshopById(id);
              return w && getSlotKey(w) === slotKey;
            });

            return (
              <div key={slotKey} style={{ marginBottom: '36px' }}>

                {/* Cabeçalho do bloco */}
                <div style={{
                  background: 'white', borderRadius: '16px', padding: '14px 16px',
                  marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: `4px solid ${selectedInSlot ? '#22C55E' : 'var(--primary)'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Clock size={15} color="var(--primary)" />
                    <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {slotLabels[slotKey]}
                    </h4>
                  </div>
                  <p style={{ fontSize: '12px', color: selectedInSlot ? '#22C55E' : '#718096', fontWeight: selectedInSlot ? '700' : '500' }}>
                    {isFinished
                      ? selectedInSlot
                        ? `✓ ${getWorkshopById(selectedInSlot)?.title || ''}`
                        : '—'
                      : selectedInSlot
                        ? `Selecionada: ${getWorkshopById(selectedInSlot)?.title || ''}`
                        : 'Escolha uma oficina abaixo para este horário'}
                  </p>
                </div>

                {/* Lista de oficinas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {slotWorkshops.map(workshop => {
                    const state = getCardState(workshop);
                    const full = isFull(workshop);
                    const capacity = getCapacity(workshop);
                    const isBlocked = state === 'default' && (full || isFinished);
                    const isSelectedInOtherSlot = !pending[slotKey] && Object.values(pending).includes(workshop.id);

                    return (
                      <div
                        key={workshop.id}
                        onClick={() => !isBlocked && !isSelectedInOtherSlot && handleSelect(workshop)}
                        style={{
                          background: state === 'confirmed' ? '#F0FFF4'
                            : state === 'pending' ? '#FDF2F2'
                            : 'white',
                          borderRadius: '20px', padding: '18px 20px',
                          border: state === 'confirmed' ? '2px solid #48BB78'
                            : state === 'pending' ? '2px solid var(--primary)'
                            : '2px solid transparent',
                          boxShadow: state !== 'default' ? '0 6px 20px rgba(0,0,0,0.08)' : '0 3px 10px rgba(0,0,0,0.04)',
                          opacity: isBlocked ? 0.4 : 1,
                          transition: 'all 0.2s ease',
                          cursor: isBlocked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A365D', marginBottom: '4px', lineHeight: '1.4' }}>
                          {workshop.title}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>
                          {workshop.speakerName}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Users size={12} color="#A0AEC0" />
                            <span style={{ fontSize: '11px', color: '#A0AEC0' }}>
                              {workshop.registrations}/{capacity} vagas
                            </span>
                          </div>

                          {state === 'confirmed' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#22C55E', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                              <Lock size={10} /> CONFIRMADO
                            </div>
                          ) : state === 'pending' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                              <Check size={11} /> SELECIONADO
                            </div>
                          ) : full ? (
                            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                              ESGOTADO
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

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

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', textAlign: 'center', marginBottom: '8px' }}>
              Tem certeza?
            </h3>
            <p style={{ fontSize: '13px', color: '#718096', textAlign: 'center', marginBottom: '24px', lineHeight: '1.6' }}>
              Após confirmar, <strong>não será mais possível alterar</strong> suas escolhas. Verifique abaixo se está tudo certo.
            </p>

            {/* Resumo das 2 escolhas pendentes */}
            <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingList.map(w => (
                <div key={w.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                    {w.start_time?.substring(0, 5)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#1A365D', lineHeight: '1.3' }}>{w.title}</p>
                    <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{w.speakerName}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{
                  background: 'var(--primary)', color: 'white', border: 'none',
                  borderRadius: '16px', padding: '18px', fontSize: '15px', fontWeight: '900',
                  cursor: 'pointer', width: '100%'
                }}
              >
                {saving ? 'CONFIRMANDO...' : 'SIM, CONFIRMAR MINHAS ESCOLHAS'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: '#F1F5F9', color: '#475569', border: 'none',
                  borderRadius: '16px', padding: '16px', fontSize: '14px', fontWeight: '700',
                  cursor: 'pointer', width: '100%'
                }}
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
            width: '100%', maxWidth: '340px', textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: '80px', height: '80px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={44} color="#22C55E" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>
              Inscrições Confirmadas!
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: '1.6' }}>
              Suas vagas nas oficinas estão garantidas.
            </p>
            <p style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '28px' }}>
              Você receberá o local das salas no dia do evento.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', width: '100%' }}
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#1A365D', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', fontSize: '14px' }}>PROCESSANDO...</div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsView;
