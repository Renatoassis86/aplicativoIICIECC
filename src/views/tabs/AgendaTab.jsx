import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Clock, 
  ChevronRight,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import SessionDetailModal from '../../components/agenda/SessionDetailModal';
import SpeakerDetailModal from '../../components/networking/SpeakerDetailModal';
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

  const [activeTab, setActiveTab] = useState('1');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
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
        setSessions(data.map(s => ({
          id: s.id,
          date: s.session_date ? s.session_date.split('-').reverse().slice(0, 2).join('/') : '01/05',
          fullDate: s.session_date,
          time: s.start_time ? s.start_time.slice(0, 5) : '00:00',
          title: s.title || 'Sem título',
          speaker: Array.isArray(s.speakers) ? (s.speakers[0]?.name || 'A confirmar') : (s.speakers?.name || 'A confirmar'),
          room: s.room || 'Auditório Principal',
          category: s.category || 'Palestra',
          description: s.description || '',
          photo: Array.isArray(s.speakers) ? (s.speakers[0]?.photo_url) : (s.speakers?.photo_url),
          fullSpeaker: Array.isArray(s.speakers) ? s.speakers[0] : (s.speakers || { name: s.speaker, institution: s.location })
        })));
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: '1', label: 'Dia 01 (01/05)', date: '2026-05-01' },
    { id: '2', label: 'Dia 02 (02/05)', date: '2026-05-02' },
    { id: 'Oficinas', label: 'Oficinas', category: 'Oficina' }
  ];

  const toggleFavorite = async (id) => {
    const isNowFavorite = await toggleFavoriteSession(userCpf, id);
    setFavorites(prev => isNowFavorite ? [...prev, id] : prev.filter(f => f !== id));
  };

  // Filtragem dos eventos pela aba ativa
  const currentTabData = tabs.find(t => t.id === activeTab);
  const filteredEvents = sessions.filter(event => {
    let matchesTab = false;
    if (activeTab === 'Oficinas') {
      matchesTab = event.category?.toLowerCase() === 'oficina';
    } else {
      matchesTab = event.fullDate === currentTabData.date;
    }
    
    if (!matchesTab) return false;
    if (onlyFavorites) return favorites.includes(event.id);
    return true;
  }).sort((a, b) => {
    if (a.fullDate !== b.fullDate) return a.fullDate.localeCompare(b.fullDate);
    return a.time.localeCompare(b.time);
  });

  // Agrupamento por dia para exibição
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
        background: 'var(--primary)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'white' }}>{displaySafe(agendaTitle) || 'Agenda Oficial'}</h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '8px',
                borderRadius: '10px',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {viewMode === 'list' ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
            </button>

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
        </div>
        
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
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800',
                background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                color: activeTab === tab.id ? 'var(--secondary)' : 'rgba(255,255,255,0.8)',
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

      <section style={{ padding: '0 20px' }}>
        {loading ? (
            <p style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontWeight: '700' }}>Carregando cronograma...</p>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Heart size={32} color="var(--border)" style={{ opacity: 0.3 }} />
             </div>
             <p style={{ fontWeight: '800', fontSize: '16px', color: 'var(--secondary)' }}>Nada para exibir aqui.</p>
             <p style={{ fontSize: '13px', marginTop: '4px' }}>Tente mudar de aba ou limpar os favoritos.</p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([day, dayEvents]) => (
            <div key={day} style={{ marginTop: '24px' }}>
               <div style={{ 
                 position: 'sticky', 
                 top: '115px', 
                 zIndex: 90, 
                 background: 'var(--bg-app)', 
                 padding: '8px 0',
                 borderBottom: '1px solid var(--border)',
                 marginBottom: '16px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '12px'
               }}>
                 <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {day === '01/05' ? 'Sexta-feira, 01 de Maio' : 'Sábado, 02 de Maio'}
                 </span>
                 <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
               </div>
               
               <div style={{ 
                 display: viewMode === 'grid' ? 'grid' : 'flex', 
                 gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
                 flexDirection: viewMode === 'grid' ? 'none' : 'column', 
                 gap: '16px' 
               }}>
                {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="card" 
                      style={{ 
                          padding: '20px', 
                          display: 'flex', 
                          flexDirection: viewMode === 'grid' ? 'column' : 'row',
                          gap: '16px', 
                          transition: 'transform 0.2s',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'default'
                      }} 
                    >
                    {/* Borda lateral colorida por categoria se for lista */}
                    {viewMode === 'list' && (
                        <div style={{ 
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', 
                            background: event.category === 'Oficina' ? '#48BB78' : event.category === 'Palestra' ? 'var(--gold)' : '#3182CE'
                        }}></div>
                    )}

                    <div style={{ 
                        borderRight: viewMode === 'list' ? '1px solid var(--border)' : 'none', 
                        borderBottom: viewMode === 'grid' ? '1px solid var(--border)' : 'none',
                        paddingRight: viewMode === 'list' ? '16px' : '0', 
                        paddingBottom: viewMode === 'grid' ? '12px' : '0',
                        display: 'flex', 
                        flexDirection: viewMode === 'list' ? 'column' : 'row', 
                        justifyContent: viewMode === 'list' ? 'center' : 'space-between', 
                        alignItems: viewMode === 'list' ? 'flex-start' : 'center',
                        minWidth: viewMode === 'list' ? '60px' : 'auto'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="var(--primary)" />
                        <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>{event.time}</p>
                      </div>
                      
                      {viewMode === 'grid' && (
                         <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', background: 'rgba(107, 20, 26, 0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                            {event.category}
                         </span>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        {viewMode === 'list' && (
                            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase' }}>
                                {event.category}
                            </span>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }} 
                            style={{ 
                                background: 'none', border: 'none', marginLeft: 'auto',
                                position: viewMode === 'grid' ? 'absolute' : 'static',
                                top: '20px', right: '20px'
                            }}
                        >
                          <Heart size={20} fill={favorites.includes(event.id) ? "var(--primary)" : "none"} color={favorites.includes(event.id) ? "var(--primary)" : "#CBD5E0"} />
                        </button>
                      </div>

                      <h4 style={{ fontWeight: '800', fontSize: '17px', lineHeight: '1.3', color: 'var(--secondary)', marginBottom: '8px' }}>{event.title}</h4>
                      
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                         {event.photo && (
                            <img src={event.photo} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                         )}
                         <p style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '700' }}>{event.speaker}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-muted)' }}>
                        <MapPin size={12} fill="var(--text-muted)" style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: '11px', fontWeight: '600' }}>{event.room}</span>
                      </div>
                    </div>

                    {/* Seta removida conforme pedido */}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <SessionDetailModal 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
        session={selectedSession} 
        isFavorite={selectedSession ? favorites.includes(selectedSession.id) : false}
        onToggleFavorite={toggleFavorite}
        userCpf={userCpf}
        onOpenSpeaker={(speaker) => {
           if (!speaker) return;
           const mappedSpeaker = {
             id: speaker.id,
             name: speaker.name,
             desc: speaker.institution,
             img: speaker.photo_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
             category: speaker.category || 'Palestrante',
             longBio: speaker.bio,
             websiteUrl: speaker.website_url
           };
           setSelectedSpeaker(mappedSpeaker);
           setSelectedSession(null);
        }}
      />

      {selectedSpeaker && (
        <SpeakerDetailModal 
          speaker={selectedSpeaker} 
          onClose={() => setSelectedSpeaker(null)}
          onSaveFavorite={(s) => alert(`${s.name} salvo nos seus favoritos!`)}
        />
      )}
    </div>
  );
};

export default AgendaTab;
