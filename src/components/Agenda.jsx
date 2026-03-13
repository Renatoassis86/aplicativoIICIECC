import React from 'react';
import { Calendar, Search, Filter, Heart, ChevronRight, Clock, MapPin } from 'lucide-react';

const Agenda = () => {
  const days = ['01 MAI', '02 MAI'];
  const [selectedDay, setSelectedDay] = React.useState('01 MAI');

  const activities = [
    {
      time: '08:30',
      title: 'Credenciamento e Café',
      location: 'Foyer Principal',
      track: 'Geral',
      fav: false
    },
    {
      time: '09:00',
      title: 'Solenidade de Abertura',
      speaker: 'Reitoria FICV',
      location: 'Auditório Magno',
      track: 'Cerimonial',
      fav: true
    },
    {
      time: '10:30',
      title: 'A Raiz da Educação Clássica',
      speaker: 'Dr. Chris Schlect',
      location: 'Auditório Magno',
      track: 'Palestra Magna',
      interest: true,
      fav: false
    },
    {
      time: '14:00',
      title: 'Workshop: Primeiras Letras',
      speaker: 'Dra. Sarah Johnson',
      location: 'Sala 102',
      track: 'Séries Iniciais',
      fav: false
    }
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <header className="bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0"></div>
        <h1 className="text-white serif uppercase tracking-widest text-xl">Programação</h1>
        <p className="text-white/70 text-sm mt-4">Organize sua jornada no CIECC II.</p>
      </header>

      {/* Day Selector */}
      <div className="flex px-20 py-16 gap-12 bg-white border-b border-gray-200">
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-16 py-8 rounded-full text-xs font-bold transition-all ${selectedDay === day ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
          >
            {day}
          </button>
        ))}
        <div className="flex-grow"></div>
        <button className="p-8 text-primary">
          <Filter size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-20 py-12">
        <div className="relative">
          <Search className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por tema ou palestrante..." 
            className="w-full pl-36 pr-12 py-10 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-grow overflow-y-auto px-20 pb-100">
        <div className="space-y-16">
          {activities.map((act, i) => (
            <div key={i} className="academic-card relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-8 text-primary font-bold text-xs uppercase serif">
                  <Clock size={14} /> {act.time}
                </div>
                <button className={`p-4 ${act.fav ? 'text-primary' : 'text-gray-300'}`}>
                  <Heart size={18} fill={act.fav ? "currentColor" : "none"} />
                </button>
              </div>
              <h3 className="serif text-primary font-bold text-base mt-8 leading-tight">{act.title}</h3>
              {act.speaker && <p className="text-xs text-gray-600 mt-4 font-medium">{act.speaker}</p>}
              
              <div className="flex items-center gap-12 mt-12 pt-12 border-t border-gray-50">
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  <MapPin size={12} /> {act.location}
                </div>
                <span className="text-[10px] bg-gray-100 px-6 py-2 rounded font-bold text-gray-500 uppercase">{act.track}</span>
              </div>

              <div className="mt-12 flex gap-8">
                <button className="flex-grow py-8 bg-gray-50 text-[10px] font-bold text-primary border border-primary/20 rounded-lg tracking-wider">
                  {act.interest ? '✓ TENHO INTERESSE' : 'SINALIZAR INTERESSE'}
                </button>
                <button className="px-12 py-8 bg-gray-50 rounded-lg text-primary">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .h-full { height: 100%; }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-white { background-color: white; }
        .p-20 { padding: 20px; }
        .px-20 { padding-left: 20px; padding-right: 20px; }
        .py-16 { padding-top: 16px; padding-bottom: 16px; }
        .py-12 { padding-top: 12px; padding-bottom: 12px; }
        .px-16 { padding-left: 16px; padding-right: 16px; }
        .py-8 { padding-top: 8px; padding-bottom: 8px; }
        .p-8 { padding: 8px; }
        .p-4 { padding: 4px; }
        .p-24 { padding: 24px; }
        .pt-48 { padding-top: 48px; }
        .mt-4 { margin-top: 4px; }
        .mt-8 { margin-top: 8px; }
        .mt-12 { margin-top: 12px; }
        .mt-16 { margin-top: 16px; }
        .pt-12 { padding-top: 12px; }
        .space-y-16 > * + * { margin-top: 16px; }
        .gap-12 { gap: 12px; }
        .gap-8 { gap: 8px; }
        .flex-grow { flex-grow: 1; }
        .overflow-y-auto { overflow-y: auto; }
        .pb-100 { padding-bottom: 100px; }
        .text-white { color: white; }
        .text-white\/70 { color: rgba(255,255,255,0.7); }
        .text-primary { color: var(--primary); }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-300 { color: #d1d5db; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-base { font-size: 1rem; }
        .text-xl { font-size: 1.25rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .rounded-full { border-radius: 9999px; }
        .rounded-xl { border-radius: 12px; }
        .rounded-lg { border-radius: 8px; }
        .border-b { border-bottom-width: 1px; }
        .border-t { border-top-width: 1px; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-gray-50 { border-color: #f9fafb; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-12 { left: 12px; }
        .top-1\/2 { top: 50%; }
        .-translate-y-1\/2 { transform: translateY(-50%); }
        .pl-36 { padding-left: 36px; }
        .pr-12 { padding-right: 12px; }
        .pl-12 { padding-left: 12px; }
        .w-full { width: 100%; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .leading-tight { line-height: 1.25; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-gray-50 { background-color: #f9fafb; }
      `}} />
    </div>
  );
};

export default Agenda;
