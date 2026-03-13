import React from 'react';
import { Bell, Search, MapPin, ChevronRight, PlayCircle, Users, Camera } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex-grow overflow-y-auto pb-20 scrollbar-hide">
      {/* Header */}
      <header className="p-20 flex justify-between items-center sticky top-0 bg-white z-50 border-b border-gray-50">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">CIECC II EDITION</p>
          <h2 className="text-xl font-bold text-accent">Olá, Congressista</h2>
        </div>
        <div className="flex gap-4">
          <button className="bg-gray-100 p-2 rounded-full text-accent">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Hero / Highlight */}
      <section className="p-20">
        <div className="hero-card">
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 inline-block">
              Ao Vivo Agora
            </span>
            <h3 className="text-xl font-extrabold text-white mb-2 leading-tight">
              Abertura Oficial: A Raiz da Educação Cristã
            </h3>
            <p className="text-white/80 text-sm mb-16">Auditório Principal • 09:00 - 10:30</p>
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transform active:scale-95 transition-all text-sm">
              <PlayCircle size={18} /> Ver Detalhes
            </button>
          </div>
          <div className="abs-decor"></div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="p-20 pt-0">
        <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-16">Navegação Rápida</h4>
        <div className="modules-grid">
          <div className="module-item">
            <div className="module-icon bg-red-50 text-red-600">
              <Users size={24} />
            </div>
            <span className="text-xs font-semibold text-accent">Relacionamento</span>
          </div>
          <div className="module-item">
            <div className="module-icon bg-blue-50 text-blue-600">
              <Camera size={24} />
            </div>
            <span className="text-xs font-semibold text-accent">Galeria</span>
          </div>
          <div className="module-item">
            <div className="module-icon bg-amber-50 text-amber-600">
              <MapPin size={24} />
            </div>
            <span className="text-xs font-semibold text-accent">Localização</span>
          </div>
          <div className="module-item">
            <div className="module-icon bg-slate-50 text-slate-600">
              <Search size={24} />
            </div>
            <span className="text-xs font-semibold text-accent">Onde Comer</span>
          </div>
        </div>
      </section>

      {/* Timeline / Agenda Preview */}
      <section className="p-20 pt-0">
        <div className="flex justify-between items-center mb-16">
          <h4 className="text-sm font-bold text-accent uppercase tracking-wider">Próximos destaques</h4>
          <button className="text-xs font-bold text-primary flex items-center">
            Ver Tudo <ChevronRight size={12} />
          </button>
        </div>

        <div className="space-y-4">
          <TimelineItem 
            time="11:00" 
            title="Sessão Plenária II" 
            speaker="Dr. Chris Schlect"
            tag="Acadêmico"
          />
          <TimelineItem 
            time="14:00" 
            title="Workshop: Gestão Escolar" 
            speaker="Faculdade Cidade Viva"
            tag="Prática"
          />
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-card {
          background: linear-gradient(135deg, var(--primary) 0%, #7F1D1D 100%);
          border-radius: 24px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(192, 38, 38, 0.2);
        }

        .abs-decor {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 150px;
          height: 150px;
          background: white;
          opacity: 0.1;
          border-radius: 50%;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .module-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .module-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .module-item:active .module-icon {
          transform: translateY(-4px);
        }

        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-16 { margin-bottom: 16px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .bg-red-50 { background-color: #FEF2F2; }
        .text-red-600 { color: #DC2626; }
        .bg-blue-50 { background-color: #EFF6FF; }
        .text-blue-600 { color: #2563EB; }
        .bg-amber-50 { background-color: #FFFBEB; }
        .text-amber-600 { color: #D97706; }
        .bg-slate-50 { background-color: #F8FAFC; }
        .text-slate-600 { color: #475569; }
      `}} />
    </div>
  );
};

const TimelineItem = ({ time, title, speaker, tag }) => (
  <div className="flex gap-4 items-start p-16 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="text-center min-w-[50px]">
      <p className="text-xs font-bold text-accent">{time}</p>
      <div className="w-[1px] h-10 bg-slate-200 mx-auto mt-4"></div>
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start">
        <h5 className="font-bold text-gray-900 text-sm">{title}</h5>
        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-500">{tag}</span>
      </div>
      <p className="text-xs text-slate-600 mt-1">{speaker}</p>
    </div>
    <ChevronRight size={16} className="text-slate-400 mt-1" />
  </div>
);

export default Home;
