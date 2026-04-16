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

  // Helper to calculate dynamic capacity for a workshop
  const getDynamicCapacity = (workshop) => {
    const slotWorkshops = workshops.filter(w => w.start_time === workshop.start_time);
    
    // As "salas de 60" são para as duas primeiras oficinas que ultrapassarem 30 inscritos
    // Contamos quantas oficinas já ocuparam as 2 salas de 60 (excluindo a própria se ela for uma delas)
    const largeRoomsTaken = slotWorkshops.filter(w => w.registrations > 30 && w.id !== workshop.id).length;
    
    // Se esta oficina já ultrapassou 30 OU se ainda restam salas de 60 no slot
    if (workshop.registrations > 30 || largeRoomsTaken < 2) {
      return 60;
    }
    
    return 30; // Limite padrão
  };

  const isFull = (workshop) => {
    const capacity = getDynamicCapacity(workshop);
    return workshop.registrations >= capacity;
  };

  const getRegisteredWorkshops = () => workshops.filter(w => registrations.includes(w.id));

  const handleToggleWorkshop = async (workshop) => {
    if (saving) return;

    const workshopId = workshop.id;
    const isRegistered = registrations.includes(workshopId);
    
    if (!isRegistered) {
      // 1. Slot Conflict
      const alreadyInSlot = workshops.find(w => 
        registrations.includes(w.id) && w.start_time === workshop.start_time
      );
      if (alreadyInSlot) {
        alert('Este horário já possui uma oficina selecionada. Desmarque a anterior para mudar.');
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

      // 3. Overall Limit
      if (registrations.length >= 2) {
        alert('Você já selecionou o limite máximo de 2 oficinas.');
        return;
      }

      // 4. Dynamic Capacity Check
      if (isFull(workshop)) {
        alert('Desculpe, esta oficina já atingiu o limite de vagas para a sala designada.');
        return;
      }
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
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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
    'Bloco 1 (14:15)': workshops.filter(w => w.start_time === '14:15:00'),
    'Bloco 2 (15:15)': workshops.filter(w => w.start_time === '15:15:00')
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
        background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
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
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Escolha de Oficinas</h2>
          <div style={{ width: '80px' }}></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', background: 'var(--gold)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#1A365D'
          }}>
            {registrations.length}/2
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800' }}>Inscrições Efetuadas</p>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>O sistema reserva sua vaga em tempo real.</p>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ 
          background: 'white', padding: '12px 16px', borderRadius: '16px', 
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Search size={18} color="#A0AEC0" />
          <input 
            type="text" placeholder="Pesquisar oficina..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#4A5568' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>Carregando opções...</p>
          </div>
        ) : (
          Object.entries(slots).map(([slotName, items]) => (
            <div key={slotName} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Clock size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase' }}>
                  {slotName}
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.filter(matchesSearch).map(workshop => {
                  const isRegistered = registrations.includes(workshop.id);
                  const capacity = getDynamicCapacity(workshop);
                  const full = isFull(workshop);
                  const sameInOtherSlot = getRegisteredWorkshops().some(rw => rw.title === workshop.title && rw.id !== workshop.id);

                  return (
                    <div 
                      key={workshop.id}
                      onClick={() => !full && !sameInOtherSlot ? handleToggleWorkshop(workshop) : isRegistered ? handleToggleWorkshop(workshop) : null}
                      style={{ 
                        background: 'white', borderRadius: '24px', padding: '20px',
                        border: isRegistered ? '2px solid #2C5282' : (full || sameInOtherSlot) ? '1px solid #E2E8F0' : '2px solid transparent',
                        boxShadow: isRegistered ? '0 8px 16px rgba(44, 82, 130, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                        opacity: (full || sameInOtherSlot) && !isRegistered ? 0.6 : 1, transition: 'all 0.2s ease', position: 'relative',
                        cursor: (full || sameInOtherSlot) && !isRegistered ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isRegistered && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#2C5282', color: 'white', padding: '4px', borderRadius: '50%' }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}

                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1A365D', marginBottom: '8px', lineHeight: '1.4' }}>
                        {workshop.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568' }}>{workshop.speakerName}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F0F4F8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: capacity === 60 ? 'var(--gold)' : '#718096' }}>
                            SALA COM ATÉ {capacity} VAGAS
                          </span>
                        </div>
                        
                        {isRegistered ? (
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#2C5282' }}>INSCRITO</span>
                        ) : full ? (
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#E53E3E' }}>LOTADO</span>
                        ) : sameInOtherSlot ? (
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#718096' }}>INDISPONÍVEL</span>
                        ) : (
                          <div style={{ fontSize: '11px', fontWeight: '700', color: workshop.registrations >= 25 ? '#E53E3E' : '#48BB78' }}>
                            {workshop.registrations} inscritos
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ 
          background: 'rgba(212, 193, 156, 0.1)', padding: '20px', borderRadius: '24px', 
          border: '1px dashed var(--gold)', display: 'flex', gap: '16px' 
        }}>
          <Info size={24} color="var(--gold)" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#1A365D', marginBottom: '4px' }}>Alocação Automática</p>
            <p style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.4' }}>
              As duas primeiras oficinas a atingirem 30 inscritos em cada bloco serão movidas para salas maiores (60 vagas). As demais serão travadas em 30.
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
