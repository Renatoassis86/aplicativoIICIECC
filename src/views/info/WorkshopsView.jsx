import React, { useState, useEffect } from 'react';
import {
  Check, Clock, ChevronLeft, Search,
  AlertCircle, Users, Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const WorkshopsView = ({ userCpf, onClose }) => {
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]); // IDs confirmados no DB
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fluxo de confirmação da 2ª oficina
  const [pendingWorkshop, setPendingWorkshop] = useState(null); // workshop a confirmar
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => { fetchData(); }, [userCpf]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: sessions, error: sessionError } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
        .order('session_date')
        .order('start_time');

      if (sessionError) throw sessionError;

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

      setWorkshops((sessions || []).map(s => ({
        ...s,
        registrations: countsMap[s.id] || 0,
        speakerName: s.speakers?.name || 'A confirmar'
      })));
      setRegistrations((userRegs || []).map(r => r.workshop_id));
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

  const isFull = (workshop) => (workshop.registrations || 0) >= getCapacity(workshop);

  const hasFinished = registrations.length >= 2;

  const getRegisteredWorkshops = () => workshops.filter(w => registrations.includes(w.id));

  const handleClickWorkshop = (workshop) => {
    if (saving) return;

    // Se já confirmou as duas, bloqueado
    if (hasFinished) {
      alert('Suas inscrições já foram finalizadas e não podem ser alteradas.');
      return;
    }

    const isRegistered = registrations.includes(workshop.id);

    // Desmarcar a única seleção (se só tem 1, pode desmarcar)
    if (isRegistered) {
      handleRemoveWorkshop(workshop.id);
      return;
    }

    // Bloquear conflito de horário
    const alreadyInSlot = workshops.find(w =>
      registrations.includes(w.id) && w.start_time === workshop.start_time
    );
    if (alreadyInSlot) {
      alert('Já existe uma oficina selecionada para este horário. Desmarque-a primeiro.');
      return;
    }

    // Bloquear se lotada
    if (isFull(workshop)) {
      alert('Desculpe, esta oficina já atingiu o limite de vagas.');
      return;
    }

    // Primeira oficina: registra direto
    if (registrations.length === 0) {
      saveWorkshop(workshop.id);
      return;
    }

    // Segunda oficina: abre modal de confirmação
    setPendingWorkshop(workshop);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!pendingWorkshop) return;
    setShowConfirmModal(false);
    await saveWorkshop(pendingWorkshop.id);
    setShowSuccessModal(true);
    setPendingWorkshop(null);
  };

  const saveWorkshop = async (workshopId) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workshop_registrations')
        .insert([{ user_cpf: userCpf, workshop_id: workshopId }]);
      if (error) throw error;
      setRegistrations(prev => [...prev, workshopId]);
      await fetchData();
    } catch (err) {
      console.error('Error saving workshop:', err);
      alert('Erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWorkshop = async (workshopId) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workshop_registrations')
        .delete()
        .eq('user_cpf', userCpf)
        .eq('workshop_id', workshopId);
      if (error) throw error;
      setRegistrations(prev => prev.filter(id => id !== workshopId));
      await fetchData();
    } catch (err) {
      console.error('Error removing workshop:', err);
    } finally {
      setSaving(false);
    }
  };

  const slots = {
    '1º Horário — 14h15 às 15h15': workshops.filter(w => w.start_time?.startsWith('14:15')),
    '2º Horário — 15h30 às 16h30': workshops.filter(w => w.start_time?.startsWith('15:30'))
  };

  const matchesSearch = (w) =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.speakerName.toLowerCase().includes(searchTerm.toLowerCase());

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
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#D4C19C' }}>Minhas Oficinas</h2>
          <div style={{ width: '80px' }} />
        </div>

        {/* Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0,
            background: hasFinished ? '#48BB78' : '#D4C19C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '900', color: '#111'
          }}>
            {hasFinished ? <Lock size={20} color="#111" /> : `${registrations.length}/2`}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800' }}>
              {hasFinished ? 'Inscrições Confirmadas e Bloqueadas' : registrations.length === 1 ? 'Escolha mais uma oficina' : 'Selecione suas Oficinas'}
            </p>
            <p style={{ fontSize: '11px', opacity: 0.75 }}>
              {hasFinished
                ? 'Suas escolhas foram salvas definitivamente.'
                : 'Escolha uma oficina para cada bloco de horário.'}
            </p>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 20px', paddingBottom: '120px' }}>

        {/* Resumo das escolhas */}
        {registrations.length > 0 && (
          <div style={{ marginBottom: '28px', background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `2px solid ${hasFinished ? '#48BB78' : '#D4C19C'}` }}>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: hasFinished ? '#22C55E' : 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasFinished ? <Lock size={14} /> : <Check size={14} />}
              {hasFinished ? 'INSCRIÇÕES CONFIRMADAS' : 'OFICINAS SELECIONADAS'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getRegisteredWorkshops().map(w => (
                <div key={w.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', flexShrink: 0 }}>
                    {w.start_time?.substring(0, 5)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A365D', lineHeight: '1.3' }}>{w.title}</p>
                    <p style={{ fontSize: '11px', color: '#718096' }}>{w.speakerName}</p>
                  </div>
                </div>
              ))}
            </div>
            {hasFinished && (
              <p style={{ fontSize: '11px', color: '#718096', marginTop: '14px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={10} /> Não é possível alterar após a confirmação.
              </p>
            )}
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
          Object.entries(slots).map(([slotName, items]) => (
            <div key={slotName} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Clock size={15} color="var(--primary)" />
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {slotName}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {items.filter(matchesSearch).map(workshop => {
                  const isRegistered = registrations.includes(workshop.id);
                  const full = isFull(workshop);
                  const capacity = getCapacity(workshop);
                  const isBlocked = !isRegistered && (full || hasFinished);

                  return (
                    <div
                      key={workshop.id}
                      onClick={() => handleClickWorkshop(workshop)}
                      style={{
                        background: 'white', borderRadius: '20px', padding: '18px 20px',
                        border: isRegistered ? '2px solid var(--primary)' : '2px solid transparent',
                        boxShadow: isRegistered ? '0 6px 20px rgba(107,20,26,0.1)' : '0 3px 10px rgba(0,0,0,0.04)',
                        opacity: isBlocked ? 0.45 : 1,
                        transition: 'all 0.2s ease',
                        cursor: isBlocked ? 'not-allowed' : 'pointer',
                        position: 'relative'
                      }}
                    >
                      {/* Título */}
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1A365D', marginBottom: '4px', lineHeight: '1.4' }}>
                        {workshop.title}
                      </h3>

                      {/* Palestrante */}
                      <p style={{ fontSize: '12px', color: '#718096', marginBottom: '10px' }}>
                        {workshop.speakerName}
                      </p>

                      {/* Footer: vagas + status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={12} color="#A0AEC0" />
                          <span style={{ fontSize: '11px', color: '#A0AEC0' }}>
                            {workshop.registrations}/{capacity} vagas
                          </span>
                        </div>

                        {isRegistered ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                            <Check size={11} /> SELECIONADO
                          </div>
                        ) : full ? (
                          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                            VAGAS ESGOTADAS
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Aviso */}
        <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: '20px', border: '1px solid #FCD34D', display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', marginBottom: '4px' }}>Atenção</p>
            <p style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.5' }}>
              Escolha <strong>uma oficina por horário</strong> (14h15 e 15h30). Após confirmar as duas escolhas, não será possível alterar.
            </p>
          </div>
        </div>
      </div>

      {/* ====== MODAL DE CONFIRMAÇÃO (2ª oficina) ====== */}
      {showConfirmModal && pendingWorkshop && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '32px 32px 28px 28px', padding: '32px 24px',
            width: '100%', maxWidth: '420px', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ width: '48px', height: '48px', background: '#FDF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={22} color="var(--primary)" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', textAlign: 'center', marginBottom: '8px' }}>
              Confirmar Inscrições?
            </h3>
            <p style={{ fontSize: '13px', color: '#718096', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
              Após confirmar, <strong>não será possível alterar</strong> suas escolhas.
            </p>

            {/* Resumo das 2 escolhas */}
            <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getRegisteredWorkshops().map(w => (
                <div key={w.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#FDF2F2', color: 'var(--primary)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', flexShrink: 0 }}>
                    {w.start_time?.substring(0, 5)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A365D', lineHeight: '1.3' }}>{w.title}</p>
                    <p style={{ fontSize: '11px', color: '#718096' }}>{w.speakerName}</p>
                  </div>
                </div>
              ))}
              {/* A que está sendo confirmada agora */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px dashed #E2E8F0', paddingTop: '12px' }}>
                <div style={{ background: '#F0FFF4', color: '#22C55E', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', flexShrink: 0 }}>
                  {pendingWorkshop.start_time?.substring(0, 5)}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A365D', lineHeight: '1.3' }}>{pendingWorkshop.title}</p>
                  <p style={{ fontSize: '11px', color: '#718096' }}>{pendingWorkshop.speakerName}</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', width: '100%' }}
              >
                {saving ? 'CONFIRMANDO...' : 'SIM, CONFIRMAR MINHAS ESCOLHAS'}
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); setPendingWorkshop(null); }}
                style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '16px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
              >
                Voltar e Alterar
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
              <Check size={40} color="#22C55E" strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>
              Inscrições Confirmadas!
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: '1.5' }}>
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
