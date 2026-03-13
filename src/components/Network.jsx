import React from 'react';
import { UserPlus, MessageCircle, UserCheck, Clock, Search } from 'lucide-react';

const Network = () => {
  const [activeTab, setActiveTab] = React.useState('discover');

  const participants = [
    { name: 'Dr. Ricardo Assis', role: 'Diretor Escolar', tags: ['Gestão', 'Artes Liberais'], connected: false, pending: true },
    { name: 'Ana Paula Souza', role: 'Educadora Cristã', tags: ['Trivium', 'Educação Infantil'], connected: true },
    { name: 'Prof. Marcos Vinícius', role: 'Palestrante', tags: ['Teologia', 'História'], connected: false, pending: false },
    { name: 'Juliana Mendes', role: 'Mãe e Educadora', tags: ['Home Schooling', 'Música'], connected: false, pending: false },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Header */}
      <header className="bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0"></div>
        <h2 className="text-white serif uppercase tracking-widest text-xl">Networking</h2>
        <p className="text-white/70 text-sm mt-4">Conecte-se com a comunidade CIECC.</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-16 text-xs font-bold serif transition-all ${activeTab === 'discover' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
        >
          DESCOBRIR
        </button>
        <button 
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-16 text-xs font-bold serif transition-all ${activeTab === 'my' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
        >
          MEUS CONTATOS (12)
        </button>
        <button 
          onClick={() => setActiveTab('partners')}
          className={`flex-1 py-16 text-xs font-bold serif transition-all ${activeTab === 'partners' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
        >
          PARCEIROS
        </button>
      </div>

      {/* Search */}
      <div className="px-20 py-12">
        <div className="relative">
          <Search className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou interesse..." 
            className="w-full pl-36 pr-12 py-10 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-grow overflow-y-auto px-20 pb-100">
        <div className="space-y-12">
          {participants.map((person, i) => (
            <div key={i} className="academic-card flex items-center gap-16 p-16">
              <div className="w-56 h-56 bg-burgundy-texture rounded-full flex items-center justify-center text-white border-2 border-accent">
                <span className="serif font-bold text-sm">{person.name[0]}</span>
              </div>
              <div className="flex-grow">
                <h4 className="serif text-primary font-bold text-sm leading-none">{person.name}</h4>
                <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-tight">{person.role}</p>
                <div className="flex gap-4 mt-6">
                  {person.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-6 py-1 bg-secondary text-primary border border-primary/10 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {person.connected ? (
                  <button className="p-10 bg-gray-50 text-accent border border-accent/20 rounded-xl">
                    <MessageCircle size={18} />
                  </button>
                ) : person.pending ? (
                  <div className="p-10 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl">
                    <Clock size={18} />
                  </div>
                ) : (
                  <button className="p-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <UserPlus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Commercial Space Badge */}
        <div className="mt-24 p-20 bg-accent/5 border border-accent/30 rounded-2xl flex items-center justify-between">
          <div>
            <h5 className="serif text-accent font-bold text-xs uppercase">Espaço dos Parceiros</h5>
            <p className="text-[10px] text-gray-600 mt-2">Visite os estandes e gere conexões comerciais.</p>
          </div>
          <button className="bg-accent text-white px-12 py-6 rounded text-[10px] font-bold">VER EXPOSITORES</button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .w-56 { width: 56px; }
        .h-56 { height: 56px; }
        .p-16 { padding: 16px; }
        .p-10 { padding: 10px; }
        .py-6 { padding-top: 6px; padding-bottom: 6px; }
        .px-12 { padding-left: 12px; padding-right: 12px; }
        .gap-16 { gap: 16px; }
        .mt-6 { margin-top: 6px; }
        .mt-24 { margin-top: 24px; }
        .border-2 { border-width: 2px; }
        .shadow-primary\/20 { box-shadow: 0 10px 15px -3px rgba(88, 0, 0, 0.2); }
      `}} />
    </div>
  );
};

export default Network;
