import React from 'react';
import { 
  Calendar, Users, HelpCircle, Map, QrCode, Ticket, 
  Bell, PlayCircle, Megaphone, ChevronRight, Award
} from 'lucide-react';

const Home = () => {
  const shortcuts = [
    { icon: Calendar, label: 'Agenda' },
    { icon: Users, label: 'Parceiros' },
    { icon: HelpCircle, label: 'Dúvidas' },
    { icon: Map, label: 'Onde Ir' },
    { icon: Ticket, label: 'Tickets' },
    { icon: QrCode, label: 'Badge' },
  ];

  return (
    <div className="home-scroll-container">
      {/* Dynamic Header Banner */}
      <header className="home-header-banner bg-burgundy-texture">
        <div className="laurel-decor top-0 right-0"></div>
        <div className="laurel-decor bottom-0 left-0 rotate-180"></div>
        
        <div className="header-badge">II CIECC 2026</div>
        <h1 className="header-title serif uppercase tracking-widest text-white">Bem-vindo ao Congresso</h1>
        <p className="header-subtitle text-white/70">Acompanhe a agenda, networking e conteúdos exclusivos em tempo real.</p>
        
        <div className="header-action-card mt-24">
          <div className="flex items-center gap-12">
            <div className="w-40 h-40 bg-accent rounded-full flex items-center justify-center text-white">
              <Award size={20} />
            </div>
            <div className="flex-grow">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Credenciamento</span>
              <h3 className="serif text-white font-bold text-sm">Acesse seu QR Code para entrada</h3>
            </div>
            <ChevronRight size={18} className="text-accent" />
          </div>
        </div>
      </header>

      {/* Announcements */}
      <section className="px-20 py-24">
        <div className="flex justify-between items-center mb-16">
          <h2 className="serif text-primary uppercase font-bold text-xs tracking-wider">Comunicados Oficiais</h2>
          <button className="text-secondary font-bold text-[10px]">VER TODOS</button>
        </div>
        <div className="flex gap-12 overflow-x-auto no-scrollbar pb-8">
          <div className="min-w-280 bg-white p-16 rounded-2xl border border-gray-200 flex gap-12 items-start">
            <div className="p-8 bg-red-50 text-primary rounded-lg"><Megaphone size={16} /></div>
            <div>
              <h4 className="font-bold text-xs text-primary serif">Submissão de artigos científicos</h4>
              <p className="text-[10px] text-gray-500 mt-4">Prazo final para envio na plataforma Summit...</p>
            </div>
          </div>
          <div className="min-w-280 bg-white p-16 rounded-2xl border border-gray-200 flex gap-12 items-start">
            <div className="p-8 bg-blue-50 text-blue-600 rounded-lg"><Bell size={16} /></div>
            <div>
              <h4 className="font-bold text-xs text-primary serif">Alteração de Sala: Workshop III</h4>
              <p className="text-[10px] text-gray-500 mt-4">A atividade das 14h ocorrerá na Sala Beta...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Shortcuts */}
      <section className="px-20 py-8">
        <h2 className="serif text-primary uppercase font-bold text-xs tracking-wider mb-16">Acesso Rápido</h2>
        <div className="grid grid-cols-3 gap-12">
          {shortcuts.map((s, i) => (
            <div key={i} className="academic-card flex flex-col items-center gap-8 py-16 text-center">
              <div className="w-48 h-48 bg-secondary rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                <s.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter serif">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Happening Now */}
      <section className="px-20 py-24 pb-48">
        <div className="bg-burgundy-texture p-24 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-extrabold text-white uppercase tracking-widest">Sessão Atual</span>
             </div>
             <span className="text-[9px] font-bold text-white/50">Auditório Principal</span>
          </div>
          <h3 className="serif text-white font-bold text-lg mt-12 leading-tight">Filosofia Educacional e a Paideia Cristã</h3>
          <p className="text-white/60 text-[10px] mt-4 uppercase font-medium tracking-wide">Speaker: Dr. Chris Schlect</p>
          <button className="mt-20 w-full py-12 bg-accent text-white rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-center gap-8">
             <PlayCircle size={14} /> DETALHES DA PROGRAMAÇÃO
          </button>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-header-banner {
          padding: 60px 24px 40px;
          text-align: center;
          border-bottom-left-radius: 40px;
          border-bottom-right-radius: 40px;
          box-shadow: var(--shadow-lg);
        }

        .header-badge {
          display: inline-block;
          padding: 4px 16px;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--font-heading);
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          margin-bottom: 20px;
        }

        .header-title { font-size: 1.4rem; padding: 0 10px; line-height: 1.25; }
        .header-subtitle { font-size: 0.8rem; margin-top: 12px; max-width: 260px; margin-left: auto; margin-right: auto; line-height: 1.6; }

        .header-action-card {
          background-color: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }

        .w-40 { width: 40px; }
        .h-40 { height: 40px; }
        .w-48 { width: 48px; }
        .h-48 { height: 48px; }
        .w-80 { width: 80px; }
        .h-80 { height: 80px; }
        .min-w-280 { min-width: 280px; }
        .rotate-180 { transform: rotate(180deg); }
        .bg-red-50 { background-color: #fef2f2; }
        .bg-blue-50 { background-color: #eff6ff; }
        .text-blue-600 { color: #2563eb; }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      `}} />
    </div>
  );
};

export default Home;
