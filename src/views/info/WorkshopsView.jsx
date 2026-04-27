import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  MapPin, 
  Calendar, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Search,
  AlertCircle,
  Briefcase,
  Star,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const WorkshopsView = ({ userCpf, userName, onClose }) => {
  const [workshops, setWorkshops] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [userCpf]);

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

      const { data: userRegs, error: regError } = await supabase
        .from('workshop_registrations')
        .select('workshop_id')
        .eq('user_cpf', userCpf);
      
      if (regError) throw regError;

      const { data: counts, error: countError } = await supabase
        .from('workshop_counts')
        .select('*');

      const countsMap = (counts || []).reduce((acc, c) => {
        acc[c.workshop_id] = c.registration_count;
        return acc;
      }, {});

      const filteredSessions = (sessions || []).filter(s => {
        const title = s.title?.toLowerCase() || '';
        return !title.includes('abertura') && !title.includes('encerramento') && !title.includes('coffee');
      });

      setWorkshops(filteredSessions.map(s => ({
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

  const [showSuccess, setShowSuccess] = useState(false);

  // MOTOR COMPETITIVO: Define a capacidade baseada no ranking de inscritos do horário
  const getCompetitiveCapacity = (workshop) => {
    const slotWorkshops = workshops.filter(w => w.start_time === workshop.start_time);
    
    // Ordenamos pela quantidade de inscritos para definir o ranking
    const sorted = [...slotWorkshops].sort((a, b) => (b.registrations || 0) - (a.registrations || 0));
    
    // 1º lugar -> Sala de 100
    if (workshop.id === sorted[0]?.id) return 100;
    
    // 2º e 3º lugar -> Salas de 60
    if (workshop.id === sorted[1]?.id || workshop.id === sorted[2]?.id) return 60;
    
    // Demais -> Salas de 30
    return 30;
  };

  const isFull = (workshop) => {
    const capacity = getCompetitiveCapacity(workshop);
    const registrationsCount = workshop.registrations || 0;
    return registrationsCount >= capacity;
  };

  const hasFinished = registrations.length >= 2;

  const getRegisteredWorkshops = () => workshops.filter(w => registrations.includes(w.id));

  const handleToggleWorkshop = async (workshop) => {
    if (saving) return;
    
    // BLOQUEIO: Se já escolheu as duas, não pode mudar nada (conforme solicitado)
    if (hasFinished) {
      alert('Suas inscrições já foram finalizadas e não podem ser alteradas.');
      return;
    }

    const workshopId = workshop.id;
    const isRegistered = registrations.includes(workshopId);
    
    if (!isRegistered) {
      // 1. Slot Conflict
      const alreadyInSlot = workshops.find(w => 
        registrations.includes(w.id) && w.start_time === workshop.start_time
      );
      if (alreadyInSlot) {
        alert('Este horário já possui uma oficina selecionada. Escolha uma oficina no outro horário.');
        return;
      }

      // 2. Duplicity Conflict
      const sameTitleInOtherSlot = workshops.find(w => 
        registrations.includes(w.id) && w.title === workshop.title
      );
      if (sameTitleInOtherSlot) {
        alert('Você já selecionou esta oficina em outro horário. Escolha uma atividade diferente.');
        return;
      }

      // 3. Dynamic Capacity Check
      if (isFull(workshop)) {
        alert('Desculpe, esta oficina já atingiu o limite máximo de vagas.');
        return;
      }
    } else {
      // Se já está inscrito, mas o usuário quer desmarcar ANTES de completar as 2
      // Na verdade o usuário disse "Escolhendo as duas ele não poderá mudar". 
      // Então se ele tem 1, ele ainda PODE desmarcar a única que tem.
    }

    setSaving(true);
    try {
      if (isRegistered) {
        const { error } = await supabase
          .from('workshop_registrations')
          .delete()
          .eq('user_cpf', userCpf)
          .eq('workshop_id', workshopId);
        
        if (error) throw error;
        setRegistrations(prev => prev.filter(id => id !== workshopId));
      } else {
        const { error } = await supabase
          .from('workshop_registrations')
          .insert([{
            user_cpf: userCpf,
            workshop_id: workshopId
          }]);
        
        if (error) throw error;
        setRegistrations(prev => [...prev, workshopId]);
        
        // Se acabou de completar a segunda, mostra sucesso especial
        if (registrations.length === 1) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
        }
      }
      
      fetchData();
    } catch (err) {
      console.error('Error toggling workshop:', err);
      alert('Erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const slots = {
    '1º Horário (14:15h às 15:15h)': workshops.filter(w => w.start_time?.startsWith('14:15')),
    '2º Horário (15:30h às 16:30h)': workshops.filter(w => w.start_time?.startsWith('15:30'))
  };

  const matchesSearch = (w) => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.speakerName.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="workshops-view fade-in" style={{ 
      background: '#F7F8FA', minHeight: '100vh', maxWidth: '500px', margin: '0 auto', position: 'relative'
    }}>
      {/* Header */}
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 20px 24px', 
        background: 'linear-gradient(135deg, #4A101D 0%, #111111 100%)',
        color: 'white', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={onClose} style={{ 
            background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px 16px', borderRadius: '16px', 
            color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700'
          }}>
            <ChevronLeft size={20} /> Voltar
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gold)' }}>Minhas Oficinas</h2>
          <div style={{ width: '80px' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', background: registrations.length === 2 ? '#48BB78' : 'var(--gold)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#111'
          }}>
            {registrations.length}/2
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800' }}>
              {registrations.length === 2 ? 'Inscrições Finalizadas' : 'Selecione suas Oficinas'}
            </p>
            <p style={{ fontSize: '11px', opacity: 0.8 }}>
              {registrations.length === 2 ? 'Você já garantiu seus dois horários.' : 'Escolha uma para cada bloco de horário.'}
            </p>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 20px' }}>
        
        {/* SEÇÃO "MINHAS ESCOLHAS" - Visível após selecionar */}
        {registrations.length > 0 && (
          <div style={{ marginBottom: '32px', background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--gold)' }}>
             <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Check size={18} /> OFICINAS SELECIONADAS
             </h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getRegisteredWorkshops().map(w => (
                  <div key={w.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800' }}>
                      {w.start_time.substring(0, 5)}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{w.title}</p>
                  </div>
                ))}
             </div>
             {hasFinished && (
               <p style={{ fontSize: '11px', color: '#718096', marginTop: '16px', fontStyle: 'italic' }}>
                 * Suas escolhas foram salvas e não podem ser alteradas.
               </p>
             )}
          </div>
        )}

        <div style={{ 
          background: 'white', padding: '12px 16px', borderRadius: '16px', 
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Search size={18} color="#A0AEC0" />
          <input 
            type="text" placeholder="Filtrar por nome ou tema..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#4A5568' }}
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
                <Clock size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {slotName}
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.filter(matchesSearch).map(workshop => {
                  const isRegistered = registrations.includes(workshop.id);
                  const full = isFull(workshop);
                  const sameInOtherSlot = getRegisteredWorkshops().some(rw => rw.title === workshop.title && rw.id !== workshop.id);

                  return (
                    <div 
                      key={workshop.id}
                      onClick={() => handleToggleWorkshop(workshop)}
                      style={{ 
                        background: 'white', borderRadius: '24px', padding: '20px',
                        border: isRegistered ? '2px solid var(--primary)' : '2px solid transparent',
                        boxShadow: isRegistered ? '0 8px 20px rgba(107, 20, 26, 0.1)' : '0 4px 12px rgba(0,0,0,0.03)',
                        opacity: (full || sameInOtherSlot) && !isRegistered ? 0.5 : 1, 
                        transition: 'all 0.2s ease', position: 'relative',
                        cursor: (hasFinished || full || sameInOtherSlot) && !isRegistered ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1A365D', marginBottom: '6px', lineHeight: '1.4' }}>
                        {workshop.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#718096' }}>{workshop.speakerName}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        {isRegistered ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                            <Check size={12} /> SELECIONADO
                          </div>
                        ) : full ? (
                          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>
                            INSCRIÇÕES ENCERRADAS
                          </div>
                        ) : sameInOtherSlot ? (
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#718096' }}>Já escolhido em outro horário</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {items.filter(matchesSearch).length === 0 && (
                  <p style={{ fontSize: '12px', color: '#A0AEC0', textAlign: 'center' }}>Nenhuma oficina encontrada.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '0 20px 60px' }}>
        <div style={{ 
          background: 'rgba(212, 193, 156, 0.1)', padding: '20px', borderRadius: '24px', 
          border: '1px solid var(--gold)', display: 'flex', gap: '16px' 
        }}>
          <AlertCircle size={24} color="var(--gold)" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#111', marginBottom: '4px' }}>Atenção</p>
            <p style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.4' }}>
              Ao completar as duas escolhas, sua inscrição será finalizada. Não será possível trocar as oficinas após a confirmação.
            </p>
          </div>
        </div>
      </div>

{/* Success Modal Overlay */}
      {showSuccess && (
        <div 
          className="fade-in"
          style={{ 
            position: 'fixed', inset: 0,
            background: 'rgba(10, 15, 26, 0.9)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000000, padding: '24px'
          }}
        >
          <div style={{ 
            background: 'white', borderRadius: '32px', padding: '40px 24px', width: '100%', maxWidth: '340px',
            textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative'
          }}>
             <div style={{ width: '80px', height: '80px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
               <Check size={40} color="#22C55E" strokeWidth={3} />
             </div>
             <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>Confirmado!</h2>
             <p style={{ fontSize: '15px', color: '#475569', marginBottom: '24px' }}>Vaga garantida com sucesso.</p>
             <button onClick={() => setShowSuccess(false)} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>CONTINUAR</button>
          </div>
        </div>
      )}

      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#1A365D', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800' }}>PROCESSANDO...</div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsView;
