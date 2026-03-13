import React from 'react';
import { 
  HelpCircle, Users, Trophy, Map, QrCode, Ticket, 
  Calendar, Settings, MessageSquare, LogOut, ChevronRight
} from 'lucide-react';

const More = ({ onLogout }) => {
  const sections = [
    {
      title: 'Configurações do Evento',
      items: [
        { icon: HelpCircle, label: 'FAQ do Evento' },
        { icon: Users, label: 'Lista de Palestrantes' },
        { icon: Trophy, label: 'Nossos Patrocinadores' },
        { icon: Map, label: 'Mapa & Localização' },
      ]
    },
    {
      title: 'Minha Experiência',
      items: [
        { icon: QrCode, label: 'Acesso Rápido / Scanner' },
        { icon: Ticket, label: 'Meus Tickets' },
        { icon: Calendar, label: 'Minha Agenda Salva' },
      ]
    },
    {
      title: 'Suporte & Conta',
      items: [
        { icon: Settings, label: 'Configurações de Perfil' },
        { icon: MessageSquare, label: 'Falar com Organização' },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header with User Info */}
      <header className="bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0"></div>
        <div className="flex items-center gap-16 relative z-10">
          <div className="w-64 h-64 bg-white/10 rounded-full border border-accent flex items-center justify-center text-white backdrop-blur">
            <span className="serif text-xl font-bold">RA</span>
          </div>
          <div>
            <h2 className="text-white serif text-lg font-bold">Renato Assis</h2>
            <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mt-2 border border-accent/30 px-6 py-2 inline-block">Congressista</p>
          </div>
        </div>
      </header>

      {/* List Sections */}
      <div className="flex-grow overflow-y-auto pb-100">
        <div className="mt-12">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-24">
              <h3 className="px-20 py-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest serif">{section.title}</h3>
              <div className="bg-white border-y border-gray-100">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-16 px-20 py-16 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors">
                    <div className="text-primary opacity-80">
                      <item.icon size={20} />
                    </div>
                    <span className="flex-grow text-sm font-medium text-gray-700">{item.label}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Branch */}
          <div className="px-20 mt-12 mb-40">
            <button 
              onClick={onLogout}
              className="w-full py-16 border border-red-100 rounded-xl bg-red-50/30 flex items-center justify-center gap-12 text-red-600 font-bold text-sm serif tracking-widest"
            >
              <LogOut size={18} /> SAIR DO APLICATIVO
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-20 font-bold">v1.0.2 • FACULDADE CIDADE VIVA</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .w-64 { width: 64px; }
        .h-64 { height: 64px; }
        .bg-white\/10 { background-color: rgba(255,255,255,0.1); }
        .backdrop-blur { backdrop-filter: blur(8px); }
        .border-y { border-top-width: 1px; border-bottom-width: 1px; }
        .last\:border-0:last-child { border-bottom-width: 0; }
        .mb-24 { margin-bottom: 24px; }
        .mb-40 { margin-bottom: 40px; }
        .text-red-600 { color: #dc2626; }
        .bg-red-50\/30 { background-color: rgba(254, 242, 242, 0.3); }
        .border-red-100 { border-color: #fee2e2; }
      `}} />
    </div>
  );
};

export default More;
