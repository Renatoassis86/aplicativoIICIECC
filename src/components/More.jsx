import React from 'react';
import { 
  HelpCircle, Users, Trophy, Map, QrCode, Ticket, 
  Settings, MessageSquare, LogOut, ChevronRight,
  ShieldCheck, Share2, Info, BellRing, Smartphone
} from 'lucide-react';

const More = ({ onLogout }) => {
  const sections = [
    {
      title: 'Configurações do Evento',
      items: [
        { icon: HelpCircle, label: 'FAQ e Orientação' },
        { icon: Users, label: 'Lista de Palestrantes' },
        { icon: Trophy, label: 'Nossos Patrocinadores' },
        { icon: Map, label: 'Mapa do Centro de Convenções' },
      ]
    },
    {
      title: 'Minha Experiência',
      items: [
        { icon: QrCode, label: 'Meu Badge Digital' },
        { icon: Ticket, label: 'Vouchers e Ingressos' },
        { icon: BellRing, label: 'Gerenciar Notificações' },
      ]
    },
    {
      title: 'Suporte e Institucional',
      items: [
        { icon: MessageSquare, label: 'Falar com a Organização' },
        { icon: ShieldCheck, label: 'Termos e Privacidade' },
        { icon: Info, label: 'Sobre o II CIECC' },
      ]
    }
  ];

  return (
    <div className="more-container h-full bg-secondary">
      {/* Perfil do Usuário */}
      <header className="profile-header bg-burgundy-texture p-24 pt-64 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0 opacity-10"></div>
        <div className="flex items-center gap-20 relative z-10">
          <div className="relative">
            <div className="w-72 h-72 bg-white/10 rounded-3xl border-2 border-accent-light/30 flex items-center justify-center text-white backdrop-blur-md shadow-2xl">
              <span className="serif text-2xl font-bold">RA</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-accent p-6 rounded-lg text-white shadow-lg">
              <Settings size={14} />
            </div>
          </div>
          <div>
            <h2 className="serif text-white text-xl font-bold">Renato Assis</h2>
            <div className="flex items-center gap-6 mt-4">
              <span className="text-[10px] font-extrabold text-accent-light uppercase tracking-widest bg-white/10 px-8 py-2 rounded-md border border-white/10">Congressista</span>
              <ShieldCheck size={14} className="text-accent-light" />
            </div>
            <p className="text-white/40 text-[10px] mt-8 font-medium">renato.assis@exemplo.com.br</p>
          </div>
        </div>
      </header>

      <div className="more-content px-20 pt-24 pb-120">
        {/* Banner de Upgrade/Aviso */}
        <div className="bg-accent p-16 rounded-2xl flex items-center justify-between mb-24 shadow-lg border border-white/5">
           <div className="flex items-center gap-12">
              <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center text-accent-light">
                 <Smartphone size={16} />
              </div>
              <p className="text-white text-[11px] font-medium">Versão do App: <span className="font-bold text-accent-light">1.2.0 (Stable)</span></p>
           </div>
           <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Atualizado</span>
        </div>

        {/* Seções de Menu */}
        <div className="space-y-24">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest serif px-8 mb-12">
                {section.title}
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {section.items.map((item, i) => (
                  <button 
                    key={i} 
                    className="w-full flex items-center gap-16 px-16 py-16 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-all text-left"
                  >
                    <div className="w-36 h-36 bg-secondary rounded-xl flex items-center justify-center text-primary/80">
                      <item.icon size={18} />
                    </div>
                    <span className="flex-grow text-xs font-bold text-accent uppercase tracking-tight">{item.label}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Branch */}
          <div className="mt-40">
            <button 
              onClick={onLogout}
              className="w-full py-16 border border-red-100 rounded-2xl bg-red-50/20 flex items-center justify-center gap-12 text-red-600 font-bold text-[11px] serif tracking-widest shadow-sm active:scale-[0.98] transition-all"
            >
              <LogOut size={18} /> ENCERRAR SESSÃO
            </button>
            
            <div className="flex flex-col items-center mt-32 gap-8 opacity-40">
               <div className="w-40 h-1 bg-gray-200"></div>
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">FACULDADE CIDADE VIVA</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .more-container {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .more-container::-webkit-scrollbar { display: none; }
        
        .w-72 { width: 72px; }
        .h-72 { height: 72px; }
        .w-36 { width: 36px; }
        .h-36 { height: 36px; }
        .pt-64 { padding-top: 64px; }
        .pb-120 { padding-bottom: 120px; }
      `}} />
    </div>
  );
};

export default More;
