import React from 'react';
import { 
  Calendar, Users, HelpCircle, Map, QrCode, Ticket, 
  Bell, PlayCircle, Megaphone, ChevronRight, Award,
  Camera, Star, ExternalLink, ArrowRight
} from 'lucide-react';

const Home = () => {
  const atalhos = [
    { icon: Calendar, label: 'Programação' },
    { icon: Users, label: 'Palestrantes' },
    { icon: Star, label: 'Parceiros' },
    { icon: Award, label: 'Patrocinadores' },
    { icon: QrCode, label: 'Meu QR Code' },
    { icon: Ticket, label: 'Meus Tickets' },
    { icon: Map, label: 'Como chegar' },
    { icon: HelpCircle, label: 'FAQ' },
  ];

  return (
    <div className="home-container">
      {/* 1. Cabeçalho Institucional */}
      <header className="home-header">
        <div className="header-top">
          <div className="header-info">
            <span className="app-badge">APP OFICIAL</span>
            <h1 className="serif uppercase tracking-widest text-primary text-sm mt-4">II CIECC 2026</h1>
          </div>
          <div className="user-avatar-circle">
            <span className="serif text-xs font-bold">RA</span>
          </div>
        </div>
        <div className="header-greeting mt-16">
          <p className="text-gray-500 text-sm">Olá, <span className="text-primary font-bold">Renato Assis</span></p>
          <h2 className="serif text-xl text-accent mt-4">Bem-vindo ao Congresso</h2>
        </div>
      </header>

      {/* 2. Banner Principal de Destaque */}
      <section className="px-20 mt-16">
        <div className="hero-banner bg-burgundy-texture relative overflow-hidden">
          <div className="laurel-decor top-0 right-0 opacity-20"></div>
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">Experiência Oficial</p>
            <h3 className="serif text-white text-2xl mt-8 leading-tight">
              Educação Cristã <br /> e a Paideia Clássica
            </h3>
            <div className="flex items-center gap-12 mt-16">
              <div className="flex items-center gap-4 bg-white/10 px-8 py-4 rounded-full border border-white/20">
                <div className="w-6 h-6 bg-accent rounded-full"></div>
                <span className="text-white text-[10px] font-bold">FALTAM 12 DIAS</span>
              </div>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">São Paulo, SP</span>
            </div>
            <button className="mt-24 w-full bg-white text-primary py-12 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-8 shadow-xl">
              Explorar Evento <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Bloco de Comunicados Oficiais */}
      <section className="px-20 mt-24">
        <div className="official-announcement-card">
          <div className="flex items-start gap-12">
            <div className="p-10 bg-primary/10 text-primary rounded-xl">
              <Megaphone size={18} />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">Comunicado Oficial</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">Urgente</span>
              </div>
              <h4 className="serif text-accent font-bold text-sm mt-4">Credenciamento e Abertura</h4>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                O credenciamento estará disponível a partir das 07h30 no hall principal. Tenha seu QR Code em mãos.
              </p>
              <button className="mt-12 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-4">
                Ver todos os avisos <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Acessos Rápidos */}
      <section className="px-20 mt-32">
        <div className="flex justify-between items-center mb-16 px-4">
          <h3 className="serif text-accent uppercase font-bold text-xs tracking-wider">Acessos Rápidos</h3>
          <span className="text-[10px] text-gray-400 font-bold">Essenciais</span>
        </div>
        <div className="grid grid-cols-4 gap-12">
          {atalhos.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-8 group">
              <div className="w-56 h-56 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary shadow-sm group-active:scale-95 transition-transform">
                <s.icon size={20} />
              </div>
              <span className="text-[9px] font-bold text-gray-500 uppercase text-center leading-tight tracking-tighter px-2">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Resumo do Evento / O que está acontecendo */}
      <section className="px-20 mt-32">
        <div className="section-header-academic">
          <h3 className="serif text-accent uppercase font-bold text-xs tracking-wider">Acontecendo Agora</h3>
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>AO VIVO</span>
          </div>
        </div>
        <div className="happening-now-card mt-12 bg-white border border-gray-100 p-20 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Sessão Plenária</p>
              <h4 className="serif text-accent font-bold text-md mt-4 leading-tight">Filosofia Educacional <br /> e a Paideia Cristã</h4>
              <p className="text-[11px] text-gray-500 mt-8">Palestrante: <span className="font-bold">Dr. Chris Schlect</span></p>
            </div>
            <div className="bg-gray-50 px-8 py-4 rounded-lg border border-gray-100">
              <span className="text-[9px] font-bold text-gray-400">AUDITÓRIO PRINCIPAL</span>
            </div>
          </div>
          <div className="mt-16 pt-16 border-t border-gray-50 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-8 text-[10px] font-bold text-gray-400">
               <Calendar size={12} /> 09:00 - 10:30
            </div>
            <button className="bg-primary text-white px-12 py-6 rounded-lg text-[9px] font-bold tracking-widest hover:bg-primary-dark transition-colors">
              DETALHES
            </button>
          </div>
        </div>
      </section>

      {/* 6. Bloco Comercial / Institucional */}
      <section className="px-20 mt-32">
        <div className="bg-accent text-white p-24 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="laurel-decor top-0 right-0 opacity-10"></div>
          <div className="flex items-center gap-12 relative z-10">
            <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center text-accent-light border border-white/20">
              <Star size={24} />
            </div>
            <div>
              <h4 className="serif text-accent-light font-bold text-sm uppercase tracking-widest">Espaço dos Parceiros</h4>
              <p className="text-white/60 text-[10px] mt-4 leading-relaxed">Conheça os expositores e soluções que estão transformando a educação clássica.</p>
            </div>
          </div>
          <button className="mt-20 w-full py-12 border border-accent-light/30 text-accent-light rounded-xl font-bold text-[10px] tracking-widest flex items-center justify-center gap-8 hover:bg-white/5">
            VER EXPOSITORES <ExternalLink size={14} />
          </button>
        </div>
      </section>

      {/* 7. Bloco de Conteúdo e Cobertura */}
      <section className="px-20 mt-32 pb-120">
        <div className="flex justify-between items-center mb-16">
          <h3 className="serif text-accent uppercase font-bold text-xs tracking-wider">Cobertura Oficial</h3>
          <button className="text-primary font-bold text-[10px] flex items-center gap-4">VER GALERIA <Camera size={12} /></button>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div className="academic-card p-0 overflow-hidden relative group">
            <div className="aspect-video bg-gray-200">
              <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400" alt="Cobertura" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-12">
              <p className="text-white font-bold text-[10px] serif">Fotos da Abertura</p>
              <span className="text-white/60 text-[8px] uppercase font-bold mt-2">48 arquivos</span>
            </div>
          </div>
          <div className="academic-card p-0 overflow-hidden relative group">
            <div className="aspect-video bg-gray-200">
               <img src="https://images.unsplash.com/photo-1475721027785-f74dea327912?auto=format&fit=crop&q=80&w=400" alt="Entrevistas" className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle size={32} className="text-white/80" />
               </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-12">
              <p className="text-white font-bold text-[10px] serif">Entrevistas Exclusivas</p>
              <span className="text-white/60 text-[8px] uppercase font-bold mt-2">CIECC Insights</span>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-container {
          height: 100%;
          overflow-y: auto;
          background-color: var(--bg-app);
        }

        .home-header {
          padding: 48px 20px 20px;
          background-color: white;
          border-bottom-left-radius: 40px;
          border-bottom-right-radius: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-badge {
          background-color: var(--primary-bg);
          color: var(--primary);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .user-avatar-circle {
          width: 44px;
          height: 44px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .hero-banner {
          padding: 32px 24px;
          background-color: var(--accent);
          border-radius: 40px;
          box-shadow: 0 20px 40px -10px rgba(17, 24, 39, 0.4);
        }

        .official-announcement-card {
          background-color: white;
          border: 1px solid var(--border-light);
          padding: 16px;
          border-radius: 24px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
        }

        .section-header-academic {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #FEF2F2;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background-color: #EF4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .live-indicator span {
          font-size: 0.6rem;
          font-weight: 800;
          color: #EF4444;
          letter-spacing: 0.05em;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .w-56 { width: 56px; }
        .h-56 { height: 56px; }
        .w-64 { width: 64px; }
        .h-64 { height: 64px; }
        .w-48 { width: 48px; }
        .h-48 { height: 48px; }
        .mt-16 { margin-top: 16px; }
        .mt-24 { margin-top: 24px; }
        .mt-32 { margin-top: 32px; }
        .pb-120 { padding-bottom: 120px; }
        .text-accent-light { color: var(--accent-light); }
        .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)); }
        .from-black\/80 { --tw-gradient-from: rgba(0, 0, 0, 0.8); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0, 0, 0, 0)); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default Home;
