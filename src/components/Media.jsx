import React, { useState } from 'react';
import { 
  PlayCircle, Image as ImageIcon, Camera, Film, Radio, 
  FileText, Download, Share2, Play, Eye, 
  ChevronRight, ArrowRight, ExternalLink
} from 'lucide-react';

const Media = () => {
  const [activeFilter, setActiveFilter] = useState('Tudo');

  const filters = ['Tudo', 'Fotos', 'Vídeos', 'Lives', 'Documentos'];

  const mediaItems = [
    {
      id: 1,
      type: 'live',
      title: 'Educação e Paideia: Transmissão ao Vivo do Auditório Principal',
      venue: 'Sessão Plenária',
      stats: '1.2k assistindo',
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74dea327912?auto=format&fit=crop&q=80&w=600',
      isLive: true
    },
    {
      id: 2,
      type: 'photo',
      title: 'Melhores Momentos: Cerimônia de Abertura CIECC',
      count: '156 fotos',
      date: 'Ontem',
      thumbnail: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 3,
      type: 'video',
      title: 'Entrevista Exclusiva: O Futuro da Educação Clássica',
      duration: '12:45',
      author: 'Dr. Chris Schlect',
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b0cd?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      type: 'doc',
      title: 'Guia de Diretrizes Curriculares (Edição 2026)',
      size: '4.8 MB',
      format: 'PDF',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div className="media-container h-full bg-secondary">
      {/* 1. Cabeçalho Institucional de Mídia */}
      <header className="media-header bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0 opacity-10"></div>
        <div className="relative z-10">
          <h1 className="serif text-white uppercase tracking-widest text-xl">Mídia & Conteúdo</h1>
          <p className="text-white/70 text-sm mt-4">Acompanhe a cobertura oficial e materiais do congresso.</p>
        </div>
      </header>

      <div className="media-content">
        {/* Chips de Filtragem */}
        <section className="px-20 mt-[-20px] relative z-20">
          <div className="flex gap-8 overflow-x-auto no-scrollbar bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {filters.map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-16 py-8 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === filter ? 'bg-primary text-white shadow-md' : 'text-gray-400 bg-gray-50'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* 7. Bloco de Conteúdo e Cobertura (Destaque Principal) */}
        <section className="px-20 mt-28">
           <div className="main-media-highlight rounded-3xl overflow-hidden shadow-2xl relative aspect-video bg-accent">
              <img 
                src={mediaItems[0].thumbnail} 
                alt="Highlight" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent to-transparent"></div>
              
              <div className="absolute top-16 left-16 flex items-center gap-6 bg-red-600 px-8 py-4 rounded-lg animate-pulse">
                <Radio size={12} className="text-white" />
                <span className="text-white text-[9px] font-extrabold tracking-widest">AO VIVO</span>
              </div>

              <div className="absolute bottom-20 left-20 right-20">
                <p className="text-accent-light text-[10px] font-bold uppercase tracking-widest">{mediaItems[0].venue}</p>
                <h3 className="serif text-white text-lg font-bold mt-4 leading-tight">{mediaItems[0].title}</h3>
                <div className="flex items-center gap-12 mt-12">
                   <div className="flex items-center gap-4 text-white/60 text-[10px]">
                      <Eye size={12} /> {mediaItems[0].stats}
                   </div>
                   <button className="bg-white text-primary px-12 py-6 rounded-lg text-[9px] font-bold tracking-widest flex items-center gap-4">
                      ASSISTIR <Play size={10} fill="currentColor" />
                   </button>
                </div>
              </div>
           </div>
        </section>

        {/* Grid de Conteúdos */}
        <section className="px-20 mt-32 pb-120">
          <div className="flex justify-between items-center mb-16">
            <h3 className="serif text-accent uppercase font-bold text-xs tracking-wider">Últimas Atualizações</h3>
            <button className="text-primary font-bold text-[10px]">VER TUDO</button>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {mediaItems.slice(1).map((item) => (
              <div key={item.id} className="academic-card p-0 overflow-hidden group">
                <div className="relative aspect-[4/3] bg-gray-200">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  
                  {/* Icons per type */}
                  <div className="absolute top-8 right-8 w-24 h-24 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white border border-white/30">
                    {item.type === 'photo' && <Camera size={14} />}
                    {item.type === 'video' && <Play size={14} fill="currentColor" />}
                    {item.type === 'doc' && <FileText size={14} />}
                  </div>

                  {item.type === 'video' && (
                    <div className="absolute bottom-8 right-8 bg-black/60 px-6 py-2 rounded text-[8px] font-bold text-white">
                      {item.duration}
                    </div>
                  )}
                </div>
                
                <div className="p-12">
                  <h4 className="serif text-accent font-bold text-[11px] leading-tight h-32 overflow-hidden">
                    {item.title}
                  </h4>
                  <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-50">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{item.date || item.format}</span>
                    {item.type === 'doc' ? (
                      <button className="text-primary"><Download size={14} /></button>
                    ) : (
                      <span className="text-[9px] text-primary font-bold uppercase">{item.count || item.author}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional CTA */}
          <div className="mt-32 p-24 bg-burgundy-texture rounded-3xl relative overflow-hidden text-center shadow-xl">
            <div className="laurel-decor top-0 right-0 opacity-10"></div>
            <h3 className="serif text-white text-base font-bold uppercase tracking-widest">Galeria Institucional</h3>
            <p className="text-white/60 text-[10px] mt-8 leading-relaxed max-w-[200px] mx-auto">Acesso ao acervo completo de fotos oficiais e materiais acadêmicos do FICV.</p>
            <button className="mt-20 px-24 py-12 bg-accent text-white rounded-xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-8 mx-auto hover:bg-accent/90">
              ACESSAR PORTAL <ExternalLink size={14} />
            </button>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .media-container {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .media-container::-webkit-scrollbar { display: none; }
        
        .aspect-video { aspect-ratio: 16 / 9; }
        .aspect-4\/3 { aspect-ratio: 4 / 3; }
        .mt-28 { margin-top: 28px; }
        .h-32 { height: 32px; }
        .pb-120 { padding-bottom: 120px; }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}} />
    </div>
  );
};

export default Media;
