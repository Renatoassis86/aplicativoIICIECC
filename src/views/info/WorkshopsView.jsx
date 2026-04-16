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
      // 1. Fetch all workshops
      const { data: sessions, error: sessionError } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)')
        .eq('category', 'Oficina')
        .order('session_date')
        .order('start_time');
      
      if (sessionError) throw sessionError;

      // 2. Fetch current user registrations
      const { data: regs, error: regError } = await supabase
        .from('workshop_registrations')
        .select('workshop_id')
        .eq('user_cpf', userCpf);
      
      if (regError) throw regError;

      // 3. Fetch registration counts for each workshop
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
      setRegistrations((regs || []).map(r => r.workshop_id));
    } catch (err) {
      console.error('Error fetching workshop data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkshop = async (workshopId) => {
    if (saving) return;

    const isRegistered = registrations.includes(workshopId);
    
    if (!isRegistered && registrations.length >= 2) {
      alert('Você já selecionou o limite máximo de 2 oficinas.');
      return;
    }

    setSaving(true);
    try {
      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from('workshop_registrations')
          .delete()
          .eq('user_cpf', userCpf)
          .eq('workshop_id', workshopId);
        
        if (error) throw error;
        setRegistrations(prev => prev.filter(id => id !== workshopId));
      } else {
        // Register
        const { error } = await supabase
          .from('workshop_registrations')
          .insert([{
            user_cpf: userCpf,
            workshop_id: workshopId
          }]);
        
        if (error) throw error;
        setRegistrations(prev => [...prev, workshopId]);
      }
      
      // Update local counts
      fetchData();
    } catch (err) {
      console.error('Error toggling workshop:', err);
      alert('Erro ao processar sua inscrição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const filteredWorkshops = workshops.filter(w => 
    w.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.speakerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="workshops-view fade-in" style={{ 
      background: '#F7F8FA', 
      minHeight: '100vh',
      maxWidth: '500px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Header */}
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 20px) 20px 24px', 
        background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
        color: 'white',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={onClose} style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            padding: '10px 16px', 
            borderRadius: '16px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '700'
          }}>
            <ChevronLeft size={20} />
            Voltar
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Escolha de Oficinas</h2>
          <div style={{ width: '80px' }}></div> {/* Balanced Spacer */}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '900', color: '#1A365D'
          }}>
            {registrations.length}/2
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800' }}>Suas Oficinas</p>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>Você pode escolher até 2 atividades.</p>
          </div>
        </div>
      </header>

      <div style={{ padding: '24px 20px' }}>
        {/* Search */}
        <div style={{ 
          background: 'white', padding: '12px 16px', borderRadius: '16px', 
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Search size={18} color="#A0AEC0" />
          <input 
            type="text" 
            placeholder="Buscar oficina ou palestrante..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#4A5568' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>Carregando oficinas...</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <AlertCircle size={48} color="#CBD5E0" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#718096', fontSize: '14px' }}>Nenhuma oficina encontrada.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredWorkshops.map(workshop => {
              const isRegistered = registrations.includes(workshop.id);
              return (
                <div 
                  key={workshop.id}
                  onClick={() => handleToggleWorkshop(workshop.id)}
                  style={{ 
                    background: 'white', 
                    borderRadius: '24px', 
                    padding: '20px',
                    border: isRegistered ? '2px solid #2C5282' : '2px solid transparent',
                    boxShadow: isRegistered ? '0 8px 16px rgba(44, 82, 130, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  {isRegistered && (
                    <div style={{ 
                      position: 'absolute', top: '12px', right: '12px', 
                      background: '#2C5282', color: 'white', padding: '4px', borderRadius: '50%'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', 
                      padding: '4px 8px', borderRadius: '6px', 
                      background: 'rgba(44, 82, 130, 0.1)', color: '#2C5282' 
                    }}>
                      {workshop.session_date ? new Date(workshop.session_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'Data'}
                    </span>
                    <span style={{ 
                      fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', 
                      padding: '4px 8px', borderRadius: '6px', 
                      background: 'rgba(0,0,0,0.05)', color: '#4A5568' 
                    }}>
                      {workshop.start_time?.slice(0, 5)} - {workshop.end_time?.slice(0, 5)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1A365D', marginBottom: '8px', lineHeight: '1.4' }}>
                    {workshop.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    {workshop.speakers?.photo_url ? (
                      <img src={workshop.speakers.photo_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={12} color="#718096" />
                      </div>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#4A5568' }}>{workshop.speakerName}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F0F4F8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#718096' }}>
                      <MapPin size={12} />
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>{workshop.room || 'Auditório'}</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: workshop.registrations >= 50 ? '#E53E3E' : '#48BB78' }}>
                      {workshop.registrations} inscritos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ 
          background: 'rgba(212, 193, 156, 0.1)', padding: '20px', borderRadius: '24px', 
          border: '1px dashed var(--gold)', display: 'flex', gap: '16px' 
        }}>
          <Info size={24} color="var(--gold)" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#1A365D', marginBottom: '4px' }}>Importante</p>
            <p style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.4' }}>
              Ao escolher uma oficina, seu nome será adicionado à lista oficial. Caso mude de ideia, você pode desmarcar e escolher outra até o dia do evento.
            </p>
          </div>
        </div>
      </div>
      
      {saving && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', 
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ background: '#1A365D', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            PROCESSANDO...
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsView;
