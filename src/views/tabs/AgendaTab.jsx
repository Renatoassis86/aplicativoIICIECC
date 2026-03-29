import React, { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Search, 
  ChevronRight,
  Filter
} from 'lucide-react';

const AgendaTab = () => {
  const [selectedDay, setSelectedDay] = useState('01/05');
  const [favorites, setFavorites] = useState([]);

  const days = ['01/05', '02/05'];
  const events = [
    { 
      id: 1, 
      date: '02/05',
      time: '18:45', 
      title: 'Abertura: Futuro', 
      speaker: 'Equipe CIECC', 
      room: 'Plenária Principal',
      category: 'Geral',
      color: '#FDF2F2'
    },
    { 
      id: 2, 
      date: '02/05',
      time: '19:00', 
      title: 'O professor Clássico do Futuro', 
      speaker: 'Esp. Matheus Macedo', 
      room: 'Plenária Principal',
      category: 'Palestra',
      color: '#F0FFF4'
    },
    { 
      id: 3, 
      date: '02/05',
      time: '19:45', 
      title: 'A formação clássica generalista em um mundo de especialistas', 
      speaker: 'Esp. Maurício Fonseca', 
      room: 'Plenária Principal',
      category: 'Palestra',
      color: '#EBF8FF'
    },
    { 
      id: 4, 
      date: '02/05',
      time: '20:30', 
      title: 'Educação Cristã Clássica e a IA', 
      speaker: 'Ms. Elmer Pires', 
      room: 'Plenária Principal',
      category: 'Palestra',
      color: '#FAF5FF'
    },
    { 
      id: 5, 
      date: '02/05',
      time: '21:15', 
      title: 'Mesa Redonda 3', 
      speaker: 'Convidados', 
      room: 'Plenária Principal',
      category: 'Painel',
      color: '#FDF2F2'
    },
    { 
      id: 6, 
      date: '02/05',
      time: '21:45', 
      title: 'Encerramento', 
      speaker: 'Equipe Organizadora', 
      room: 'Plenária Principal',
      category: 'Geral',
      color: '#F0FFF4'
    },
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      <header style={{ 
        padding: '24px 20px 16px', 
        background: 'white', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)' }}>Agenda</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Filter size={20} color="var(--text-muted)" />
            <Search size={20} color="var(--text-muted)" />
          </div>
        </div>
        
        {/* Day Selector */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {days.map(day => (
            <button 
              key={day} 
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '600',
                background: selectedDay === day ? 'var(--primary)' : 'var(--bg-app)',
                color: selectedDay === day ? 'white' : 'var(--text-muted)',
                transition: 'var(--transition)',
                boxShadow: selectedDay === day ? '0 4px 12px rgba(216,30,30,0.3)' : 'none'
              }}
            >
              Dia {day}
            </button>
          ))}
        </div>
      </header>

      <section style={{ padding: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '20px' }}>
          {selectedDay === '01/05' ? '1º Dia (Sexta-feira)' : '2º Dia (Sábado)'}
        </p>

        {events.filter(e => e.date === selectedDay).map(event => (
          <div key={event.id} className="card" style={{ padding: '20px', marginBottom: '16px', display: 'flex', gap: '16px' }}>
            <div style={{ borderRight: '1px solid var(--border)', paddingRight: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '60px' }}>
              <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)' }}>{event.time}</p>
              <Clock size={12} color="var(--text-muted)" style={{ marginTop: '4px' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  {event.category}
                </span>
                <button onClick={() => toggleFavorite(event.id)}>
                  <Heart size={20} fill={favorites.includes(event.id) ? "var(--primary)" : "none"} color={favorites.includes(event.id) ? "var(--primary)" : "#CBD5E0"} />
                </button>
              </div>
              <p style={{ fontWeight: '700', fontSize: '16px', lineHeight: '1.2', color: 'var(--secondary)' }}>
                {event.title}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {event.speaker}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-muted)' }}>
                <MapPin size={12} />
                <span style={{ fontSize: '11px' }}>{event.room}</span>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button 
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    background: 'var(--bg-app)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--secondary)',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                >
                  Tenho Interesse
                </button>
                <button style={{ 
                  background: 'var(--bg-app)', 
                  padding: '8px', 
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AgendaTab;
