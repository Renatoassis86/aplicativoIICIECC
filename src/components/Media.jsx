import React from 'react';
import { PlayCircle, Image as ImageIcon, Camera, Film, Radio, FileText, Download } from 'lucide-react';

const Media = () => {
  const [filter, setFilter] = React.useState('all');

  const items = [
    { type: 'photo', title: 'Galeria Oficial: Abertura', count: '48 fotos', date: '01/05/2026' },
    { type: 'video', title: 'Entrevista: Chris Schlect', duration: '12:45', date: '01/05/2026' },
    { type: 'live', title: 'TRANSMISSÃO AO VIVO', status: 'Auditório 2', date: 'Agora' },
    { type: 'doc', title: 'Manual do Congressista', size: '2.4 MB', date: 'PDF' },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <header className="bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0"></div>
        <h2 className="text-white serif uppercase tracking-widest text-xl">Mídia & Conteúdo</h2>
        <p className="text-white/70 text-sm mt-4">A cobertura oficial do congresso em um só lugar.</p>
      </header>

      {/* Filter Chips */}
      <div className="flex px-20 py-16 gap-8 overflow-x-auto no-scrollbar bg-white">
        {['Tudo', 'Fotos', 'Vídeos', 'Lives', 'Materiais'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat.toLowerCase())}
            className={`px-16 py-6 rounded-lg text-[10px] font-bold serif border transition-all whitespace-nowrap ${filter === cat.toLowerCase() ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto px-20 pb-100 mt-12">
        <div className="grid grid-cols-2 gap-12">
          {items.map((item, i) => (
            <div key={i} className="academic-card p-0 overflow-hidden">
              <div className="aspect-video bg-gray-200 relative flex items-center justify-center">
                {item.type === 'photo' && <ImageIcon size={24} className="text-gray-400" />}
                {item.type === 'video' && <PlayCircle size={32} className="text-white drop-shadow-lg" />}
                {item.type === 'live' && <div className="absolute top-8 left-8 flex items-center gap-4 bg-red-600 px-6 py-2 rounded text-[8px] font-extrabold text-white animate-pulse">● AO VIVO</div>}
                {item.type === 'doc' && <FileText size={24} className="text-primary" />}
                <div className="absolute inset-0 bg-primary/10"></div>
              </div>
              <div className="p-12">
                <h4 className="serif text-primary font-bold text-xs leading-tight h-32 overflow-hidden">{item.title}</h4>
                <div className="flex justify-between items-center mt-8">
                  <span className="text-[9px] text-gray-400 font-bold">{item.date}</span>
                  {item.type === 'doc' ? (
                    <Download size={12} className="text-primary" />
                  ) : (
                    <span className="text-[9px] text-primary font-bold">{item.count || item.duration || item.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Highlight */}
        <div className="mt-24 p-20 bg-burgundy-texture rounded-2xl text-center relative overflow-hidden">
          <div className="laurel-decor top-0 right-0 opacity-10"></div>
          <h5 className="serif text-white font-bold text-xs uppercase tracking-widest">Galeria Institucional FICV</h5>
          <p className="text-[10px] text-white/60 mt-4">Fotos oficiais em alta resolução para download.</p>
          <button className="mt-12 px-16 py-8 bg-accent text-white rounded text-[10px] font-bold">ACESSAR GALERIA</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .aspect-video { aspect-ratio: 16 / 9; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .whitespace-nowrap { white-space: nowrap; }
        .drop-shadow-lg { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .h-32 { height: 32px; }
      `}} />
    </div>
  );
};

export default Media;
