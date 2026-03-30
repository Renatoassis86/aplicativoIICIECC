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
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('ciecc_favorite_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const days = ['01/05', '02/05'];
  const events = [
    // 01 de Maio - Tarde (Passado)
    { id: 101, date: '01/05', time: '14:00', title: 'Check-in', speaker: 'Equipe CIECC', room: 'Recepção', category: 'Geral', color: '#F8F9FA' },
    { id: 102, date: '01/05', time: '14:30', title: 'Abertura Passado', speaker: 'Diretoria CIECC', room: 'Auditório Principal', category: 'Geral', color: '#FDF2F2' },
    { id: 103, date: '01/05', time: '15:00', title: 'História da Educação Cristã Clássica (Paideia Grega)', speaker: 'Thiago Dutra', room: 'Auditório Principal', category: 'Palestra', color: '#F0FFF4' },
    { id: 104, date: '01/05', time: '15:45', title: 'História da Educação Cristã Clássica (Roma e o Cristianismo Primitivo)', speaker: 'Chris Schlect', room: 'Auditório Principal', category: 'Palestra', color: '#EBF8FF' },
    { id: 105, date: '01/05', time: '16:30', title: 'História da Educação Cristã Clássica (Cristianismo Medieval)', speaker: 'Chris Schlect', room: 'Auditório Principal', category: 'Palestra', color: '#FAF5FF' },
    { id: 106, date: '01/05', time: '17:15', title: 'Mesa Redonda 1', speaker: 'Convidados', room: 'Auditório Principal', category: 'Painel', color: '#FDF2F2' },
    { id: 107, date: '01/05', time: '17:45', title: 'Encerramento Tarde', speaker: 'Equipe CIECC', room: 'Auditório Principal', category: 'Geral', color: '#F8F9FA' },

    // 01 de Maio - Noite (Presente)
    { id: 108, date: '01/05', time: '18:45', title: 'Abertura Presente', speaker: 'Equipe CIECC', room: 'Auditório Principal', category: 'Geral', color: '#FDF2F2' },
    { id: 109, date: '01/05', time: '19:00', title: 'Educação Clássica x Educação Moderna', speaker: 'Keith Nix', room: 'Auditório Principal', category: 'Palestra', color: '#F0FFF4' },
    { id: 110, date: '01/05', time: '19:45', title: 'Professor Clássico x Professor Moderno', speaker: 'Rosely Garcia', room: 'Auditório Principal', category: 'Palestra', color: '#EBF8FF' },
    { id: 111, date: '01/05', time: '20:30', title: 'Escola Clássica x Escola Moderna', speaker: 'Keith Nix', room: 'Auditório Principal', category: 'Palestra', color: '#FAF5FF' },
    { id: 112, date: '01/05', time: '21:15', title: 'Mesa Redonda 2', speaker: 'Convidados', room: 'Auditório Principal', category: 'Painel', color: '#FDF2F2' },
    { id: 113, date: '01/05', time: '21:45', title: 'Encerramento Noite', speaker: 'Equipe CIECC', room: 'Auditório Principal', category: 'Geral', color: '#F8F9FA' },

    // 02 de Maio - Manhã
    { id: 201, date: '02/05', time: '09:00', title: 'Abertura FICV / Coffee Break', speaker: 'Líderes FICV', room: 'Hall / Auditório', category: 'Geral', color: '#FDF2F2' },
    { id: 202, date: '02/05', time: '09:15', title: 'Exposição de Artigos Científicos', speaker: 'Pesquisadores', room: 'Auditório Secundário', category: 'Acadêmico', color: '#F0FFF4' },
    { id: 203, date: '02/05', time: '09:30', title: 'Palestra Líderes 1 - A vida de um diretor de escola clássica', speaker: 'Keith Nix', room: 'Auditório Principal', category: 'Liderança', color: '#EBF8FF' },
    { id: 204, date: '02/05', time: '10:15', title: 'Palestra Líderes 2 - Liderando uma escola Clássica', speaker: 'Chris Schlect', room: 'Auditório Principal', category: 'Liderança', color: '#FAF5FF' },
    { id: 205, date: '02/05', time: '11:00', title: 'Mesa Redonda / Apresentação Paideia', speaker: 'Equipe FICV', room: 'Auditório Principal', category: 'Painel', color: '#FDF2F2' },
    { id: 206, date: '02/05', time: '12:00', title: 'Intervalo Almoço', speaker: 'Livre', room: 'Externo', category: 'Geral', color: '#F8F9FA' },

    // 02 de Maio - Tarde (Oficinas)
    { id: 207, date: '02/05', time: '14:00', title: 'Abertura Oficinas', speaker: 'Equipe CIECC', room: 'Auditório Principal', category: 'Geral', color: '#FDF2F2' },
    { id: 208, date: '02/05', time: '14:15', title: 'Sessão de Oficinas 1 (Múltiplas Salas)', speaker: 'Confira a Lista de Oficinas', room: 'Salas Acadêmicas', category: 'Workshop', color: '#F0FFF4' },
    { id: 209, date: '02/05', time: '15:30', title: 'Sessão de Oficinas 2 (Múltiplas Salas)', speaker: 'Confira a Lista de Oficinas', room: 'Salas Acadêmicas', category: 'Workshop', color: '#EBF8FF' },
    { id: 210, date: '02/05', time: '17:00', title: 'Stands e Networking Especial', speaker: 'Expositores', room: 'Foyer', category: 'Networking', color: '#FAF5FF' },

    // 02 de Maio - Noite (Futuro)
    { id: 211, date: '02/05', time: '18:45', title: 'Abertura Noite: Futuro', speaker: 'Equipe CIECC', room: 'Auditório Principal', category: 'Geral', color: '#FDF2F2' },
    { id: 212, date: '02/05', time: '19:00', title: 'O professor Clássico do Futuro', speaker: 'Matheus Macedo', room: 'Auditório Principal', category: 'Palestra', color: '#F0FFF4' },
    { id: 213, date: '02/05', time: '19:45', title: 'A formação clássica generalista em um mundo de especialistas', speaker: 'Maurício Fonseca', room: 'Auditório Principal', category: 'Palestra', color: '#EBF8FF' },
    { id: 214, date: '02/05', time: '20:30', title: 'Educação Cristã Clássica e a IA', speaker: 'Elmer Pires', room: 'Auditório Principal', category: 'Palestra', color: '#FAF5FF' },
    { id: 215, date: '02/05', time: '21:15', title: 'Mesa Redonda 3 / Encerramento', speaker: 'Todos os Palestrantes', room: 'Auditório Principal', category: 'Geral', color: '#FDF2F2' }
  ];

  const filteredEvents = events.filter(e => {
    const matchesDay = e.date === selectedDay;
    const matchesFavorites = onlyFavorites ? favorites.includes(e.id) : true;
    return matchesDay && matchesFavorites;
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('ciecc_favorite_sessions', JSON.stringify(updated));
      return updated;
    });
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              style={{
                background: onlyFavorites ? 'var(--gold)' : 'transparent',
                border: '1px solid ' + (onlyFavorites ? 'var(--gold)' : 'var(--border)'),
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: onlyFavorites ? 'var(--secondary)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                transition: 'var(--transition)'
              }}
            >
              <Heart size={14} fill={onlyFavorites ? 'var(--secondary)' : 'none'} color={onlyFavorites ? 'var(--secondary)' : 'currentColor'} />
              MINHA AGENDA
            </button>
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
          {onlyFavorites && ' • Filtrado por Favoritos'}
        </p>

        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
             <Heart size={48} color="var(--border)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
             <p style={{ fontWeight: '700' }}>{onlyFavorites ? 'Nenhum item salvo para este dia.' : 'Nada programado.'}</p>
             {onlyFavorites && <button onClick={() => setOnlyFavorites(false)} style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: '800', fontSize: '12px' }}>VER AGENDA COMPLETA</button>}
          </div>
        ) : filteredEvents.map(event => (
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
