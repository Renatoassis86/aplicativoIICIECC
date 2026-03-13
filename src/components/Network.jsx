import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, MessageCircle, Clock, 
  Filter, Star, Building2, UserCheck, ShieldCheck,
  ChevronRight, ExternalLink
} from 'lucide-react';

const Network = () => {
  const [activeTab, setActiveTab] = useState('Descobrir');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Descobrir', 'Meus Contatos', 'Parceiros'];

  const participants = [
    {
      id: 1,
      name: 'Dr. Ricardo Assis',
      role: 'Diretor Geral',
      org: 'Colégio Cidade Viva',
      tags: ['Gestão Escolar', 'Trivium'],
      status: 'none', // none, pending, connected
      isVerified: true,
      avatar: 'RA'
    },
    {
      id: 2,
      name: 'Dra. Ana Paula Souza',
      role: 'Coordenadora Pedagógica',
      org: 'Instituto Logos',
      tags: ['Artes Liberais', 'Alfabetização'],
      status: 'connected',
      isVerified: true,
      avatar: 'AS'
    },
    {
      id: 3,
      name: 'Marcos Vinícius',
      role: 'Pai Educador',
      org: 'Home Schooling',
      tags: ['Educação Domiciliar', 'Música'],
      status: 'pending',
      isVerified: false,
      avatar: 'MV'
    }
  ];

  return (
    <div className="network-container h-full bg-secondary">
      {/* 1. Cabeçalho Institucional de Network */}
      <header className="network-header bg-burgundy-texture p-24 pt-48 relative overflow-hidden">
        <div className="laurel-decor top-0 right-0 opacity-10"></div>
        <div className="relative z-10">
          <h1 className="serif text-white uppercase tracking-widest text-xl">Networking</h1>
          <p className="text-white/70 text-sm mt-4">Conecte-se com a maior comunidade de educação clássica.</p>
        </div>
      </header>

      <div className="network-content">
        {/* Barra de Pesquisa e Filtros */}
        <section className="px-20 mt-[-20px] relative z-20">
          <div className="search-box bg-white p-8 rounded-2xl shadow-xl flex items-center gap-12 border border-gray-100">
            <Search className="text-gray-400 ml-8" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, cargo ou interesse..." 
              className="flex-grow bg-transparent border-none outline-none text-sm py-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="p-8 bg-gray-50 text-primary rounded-xl">
              <Filter size={18} />
            </button>
          </div>
        </section>

        {/* 2. Navegação por Abas */}
        <section className="mt-24 px-20">
          <div className="flex bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* 6. Bloco Comercial / Destaque de Parceiros (Visível em Descobrir e Parceiros) */}
        {activeTab !== 'Meus Contatos' && (
          <section className="px-20 mt-24">
            <div className="institutional-partner-card bg-accent text-white p-16 rounded-24 shadow-lg border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="flex items-center gap-16 relative z-10">
                <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center text-accent-light border border-white/20">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="serif text-sm font-bold text-accent-light">Espaço de Negócios</h3>
                  <p className="text-[10px] text-white/60 mt-2 leading-relaxed">Visite os estandes dos nossos mantenedores e patrocinadores oficiais.</p>
                </div>
              </div>
              <button className="mt-16 w-full py-10 bg-white/5 border border-white/20 rounded-xl text-[9px] font-bold tracking-widest flex items-center justify-center gap-8 hover:bg-white/10 transition-colors">
                CONHECER EXPOSITORES <ExternalLink size={12} />
              </button>
            </div>
          </section>
        )}

        {/* 4. Lista de Participantes */}
        <section className="px-20 mt-24 pb-120">
          <div className="flex justify-between items-center mb-16">
            <h3 className="serif text-accent uppercase font-bold text-xs tracking-wider">
              {activeTab === 'Parceiros' ? 'Expositores e Instituições' : 'Perfis Recomendados'}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">Total: {participants.length}</span>
          </div>

          <div className="space-y-12">
            {participants.map((person) => (
              <div key={person.id} className="academic-card p-16 flex items-center gap-16 group transition-all active:scale-[0.98]">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-56 h-56 bg-burgundy-texture rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md">
                    <span className="serif text-sm font-bold">{person.avatar}</span>
                  </div>
                  {person.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm">
                      <ShieldCheck size={12} className="text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-4">
                    <h4 className="serif text-accent font-bold text-sm">{person.name}</h4>
                    {person.status === 'connected' && <UserCheck size={14} className="text-primary opacity-60" />}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{person.role} • {person.org}</p>
                  <div className="flex flex-wrap gap-4 mt-8">
                    {person.tags.map(tag => (
                      <span key={tag} className="text-[8px] bg-secondary px-6 py-2 rounded-md text-primary font-bold border border-primary/5">
                        #{tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-6">
                  {person.status === 'none' && (
                    <button className="p-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">
                      <UserPlus size={18} />
                    </button>
                  )}
                  {person.status === 'pending' && (
                    <div className="p-10 bg-gray-50 text-gray-300 border border-gray-100 rounded-xl">
                      <Clock size={18} />
                    </div>
                  )}
                  {person.status === 'connected' && (
                    <button className="p-10 bg-primary-bg text-primary rounded-xl border border-primary/10 hover:bg-primary-bg/80 transition-colors">
                      <MessageCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Estado de "Ver Mais" */}
          <button className="mt-20 w-full py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
            Carregar mais participantes
          </button>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .network-container {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .network-container::-webkit-scrollbar { display: none; }
        
        .p-10 { padding: 10px; }
        .mb-16 { margin-bottom: 16px; }
        .rounded-24 { border-radius: 24px; }
        .w-56 { width: 56px; }
        .h-56 { height: 56px; }
        .pb-120 { padding-bottom: 120px; }
        
        .shadow-primary\/20 { box-shadow: 0 10px 15px -3px rgba(214, 31, 38, 0.2); }
      `}} />
    </div>
  );
};

export default Network;
