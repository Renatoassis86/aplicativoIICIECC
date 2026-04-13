import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import SessionDetailModal from '../../components/agenda/SessionDetailModal';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../hooks/useContent';
import { fetchUserFavorites, toggleFavoriteSession } from '../../services/agenda/agendaService';

const AgendaTab = ({ userCpf }) => {
  const { content: agendaTitle } = useContent('titles', 'page_agenda');
  
  const displaySafe = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.text) return val.text;
    if (typeof val === 'object' && val.rendered) return val.rendered;
    return String(val);
  };
  const [selectedDay, setSelectedDay] = useState('01/05');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchSessions();
    loadFavorites();
  }, [userCpf]);

  const loadFavorites = async () => {
    if (!userCpf) return;
    const favs = await fetchUserFavorites(userCpf);
    setFavorites(favs);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda_sessions')
        .select('*, speakers(*)');
      
      if (error) throw error;

      if (data) {
        // Formatar dados para o padrão esperado pelo componente
        const formatted = data.map(s => ({
          id: s.id,
          date: s.session_date ? s.session_date.split('-').reverse().slice(0, 2).join('/') : '01/05',
          time: s.start_time ? s.start_time.slice(0, 5) : '00:00',
          title: s.title || 'Sem título',
          speaker: Array.isArray(s.speakers) ? (s.speakers[0]?.name || 'A confirmar') : (s.speakers?.name || 'A confirmar'),
          room: s.room || 'Auditório Principal',
          category: s.category || 'Palestra',
          description: s.description || '',
          fullSpeaker: Array.isArray(s.speakers) ? s.speakers[0] : s.speakers
        }));
        setSessions(formatted);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Garantindo as 3 abas principais solicitadas
  const tabs = [
    { id: '01/05', label: 'Dia 01/05' },
    { id: '02/05', label: 'Dia 02/05' },
    { id: 'Oficinas', label: 'Oficinas' }
  ];

  const toggleFavorite = async (id) => {
    const isNowFavorite = await toggleFavoriteSession(userCpf, id);
    setFavorites(prev => isNowFavorite ? [...prev, id] : prev.filter(f => f !== id));
  };

  // Filtragem dos eventos
  const filteredEvents = sessions.filter(e => {
    if (selectedDay === 'Oficinas') return e.category === 'Oficina';
    if (e.date !== selectedDay) return false;
    if (onlyFavorites) return favorites.includes(e.id);
    return true;
  });

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
        background: 'var(--primary)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'white' }}>{displaySafe(agendaTitle) || 'Agenda Oficial'}</h2>
          <button 
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            style={{
              background: onlyFavorites ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
              padding: '8px 14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: onlyFavorites ? 'var(--secondary)' : 'white',
              fontSize: '11px',
              fontWeight: '900',
              border: 'none'
            }}
          >
            <Heart size={14} fill={onlyFavorites ? 'var(--secondary)' : 'none'} color={onlyFavorites ? 'var(--secondary)' : 'white'} />
            MINHA AGENDA
          </button>
        </div>
        
        {/* Tab Selector - Garantindo Exibição dos 3 Botões */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.25)', 
          padding: '4px', 
          borderRadius: '14px',
          gap: '4px'
        }}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setSelectedDay(tab.id)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                background: selectedDay === tab.id ? 'var(--gold)' : 'transparent',
                color: selectedDay === tab.id ? 'var(--secondary)' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <section style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '20px' }}>
          {selectedDay === '01/05' ? '1º Dia (Sexta-feira)' : selectedDay === '02/05' ? '2º Dia (Sábado)' : 'Grade Completa de Oficinas'}
        </p>

        {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Carregando programação...</p>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
             <Heart size={48} color="var(--border)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
             <p style={{ fontWeight: '700' }}>Nada programado para este dia.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredEvents.map(event => (
              <div key={event.id} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', cursor: 'pointer' }} onClick={() => setSelectedSession(event)}>
                <div style={{ borderRight: '1px solid var(--border)', paddingRight: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '60px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)' }}>{event.time}</p>
                  <Clock size={12} color="var(--text-muted)" style={{ marginTop: '4px' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      {event.category}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }} style={{ background: 'none', border: 'none' }}>
                      <Heart size={20} fill={favorites.includes(event.id) ? "var(--primary)" : "none"} color={favorites.includes(event.id) ? "var(--primary)" : "#CBD5E0"} />
                    </button>
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '16px', lineHeight: '1.2', color: 'var(--secondary)' }}>{event.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{event.speaker}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-muted)' }}>
                    <MapPin size={12} /><span style={{ fontSize: '11px' }}>{event.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SessionDetailModal 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        session={selectedSession} 
        isFavorite={selectedSession ? favorites.includes(selectedSession.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default AgendaTab;
