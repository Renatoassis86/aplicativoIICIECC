import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Heart, ChevronRight, Filter, 
  Search, Star, CheckCircle2, BookmarkPlus, Users
} from 'lucide-react';

const Agenda = () => {
  const [selectedDay, setSelectedDay] = useState('01 MAI');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const dias = [
    { label: '01 MAI', desc: 'Sexta-feira' },
    { label: '02 MAI', desc: 'Sábado' }
  ];

  const filtros = [
    'Todos', 'Plenárias', 'Palestras', 'Painéis', 'Oficinas', 'Networking'
  ];

  const atividades = [
    {
      id: 1,
      time: '08:00',
      title: 'Credenciamento e Recepção',
      location: 'Hall de Entrada',
      type: 'Logística',
      desc: 'Retirada de crachás, material do congressista e boas-vindas oficiais.',
      speaker: 'Equipe de Organização',
      isHighlight: false,
      isFav: false
    },
    {
      id: 2,
      time: '09:00',
      title: 'Educação Cristã e a Paideia Clássica',
      location: 'Auditório Magno',
      type: 'Plenária',
      desc: 'Sessão solene de abertura explorando as raízes da educação e sua conexão com a fé.',
      speaker: 'Dr. Chris Schlect',
      isHighlight: true,
      isFav: true,
      interested: true
    },
    {
      id: 3,
      time: '11:00',
      title: 'O Trivium e as Sete Artes Liberais',
      location: 'Sala Atenas',
      type: 'Palestra',
      desc: 'Uma análise profunda sobre a estrutura clássica do aprendizado e sua aplicação moderna.',
      speaker: 'Prof. Ricardo Assis',
      isHighlight: false,
      isFav: false
    },
    {
      id: 4,
      time: '14:00',
      title: 'Gestão Escolar e Liderança Acadêmica',
      location: 'Sala Roma',
      type: 'Oficina',
      desc: 'Workshop prático voltado para mantenedores e diretores de escolas clássicas.',
      speaker: 'Faculdade Internacional Cidade Viva',
      isHighlight: false,
      isFav: false
    }
  ];

  return (
    <div className="agenda-container h-full bg-secondary">
      {/* 1. Cabeçalho da Agenda */}
      <header className="agenda-header bg-burgundy-texture">
        <div className="laurel-decor top-0 right-0 opacity-10"></div>
        <div className="relative z-10 p-24 pt-48">
          <h1 className="serif text-white uppercase tracking-widest text-xl">Programação Oficial</h1>
          <p className="text-white/70 text-sm mt-4">Personalize sua jornada acadêmica no II CIECC.</p>
        </div>
      </header>

      <div className="agenda-content">
        {/* 6. Área "Minha Jornada" (Aparece no topo do conteúdo) */}
        <section className="px-20 mt-[-24px] relative z-20">
          <div className="my-journey-card bg-accent text-white p-16 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-12">
              <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center text-accent-light">
                <Star size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-accent-light uppercase tracking-widest">Minha Jornada</p>
                <h3 className="serif text-sm font-bold">3 Atividades Salvas</h3>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-8 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* 2. Navegação por Dias */}
        <section className="px-20 mt-24">
          <div className="flex gap-12">
            {dias.map((d) => (
              <button 
                key={d.label}
                onClick={() => setSelectedDay(d.label)}
                className={`flex-1 flex flex-col items-center py-12 rounded-2xl border transition-all ${selectedDay === d.label ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500'}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{d.desc}</span>
                <span className="serif text-lg font-bold mt-2">{d.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Filtros de Programação */}
        <section className="mt-20">
          <div className="flex gap-8 overflow-x-auto no-scrollbar px-20 pb-4">
            {filtros.map((f) => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-16 py-8 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${activeFilter === f ? 'bg-primary-bg text-primary border-primary/20' : 'bg-white text-gray-400 border-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Lista de Atividades */}
        <section className="px-20 mt-24 pb-120">
          <div className="space-y-16">
            {atividades.map((act) => (
              <div 
                key={act.id} 
                className={`academic-card relative ${act.isHighlight ? 'border-primary/30 bg-primary/2 shadow-md' : 'bg-white'}`}
              >
                {act.isHighlight && (
                   <div className="absolute top-0 right-24 transform -translate-y-1/2 bg-primary text-white text-[8px] font-extrabold px-12 py-4 rounded-full tracking-widest uppercase shadow-sm">
                      Destaque Principal
                   </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-6 text-primary">
                      <Clock size={14} />
                      <span className="text-xs font-bold serif">{act.time}</span>
                      <span className="text-[9px] bg-secondary px-6 py-1 rounded-sm border border-primary/10 text-primary font-bold uppercase">{act.type}</span>
                    </div>
                  </div>
                  <button className={`${act.isFav ? 'text-primary' : 'text-gray-300'} transition-transform active:scale-125`}>
                    <Heart size={20} fill={act.isFav ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="mt-12">
                  <h3 className="serif text-accent font-bold text-base leading-tight">
                    {act.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-6 text-gray-500">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{act.location}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-12 leading-relaxed">
                    {act.desc}
                  </p>
                  
                  <div className="mt-12 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-primary">
                      <Users size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-accent italic">{act.speaker}</span>
                  </div>
                </div>

                {/* 5. Ações do Usuário */}
                <div className="mt-20 pt-16 border-t border-gray-50 flex gap-8">
                  <button className={`flex-grow py-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-8 ${act.interested ? 'bg-primary text-white' : 'bg-gray-50 text-primary border border-primary/20'}`}>
                    {act.interested ? (
                      <><CheckCircle2 size={14} /> NA MINHA AGENDA</>
                    ) : (
                      <><BookmarkPlus size={14} /> TENHO INTERESSE</>
                    )}
                  </button>
                  <button className="px-12 py-12 bg-gray-50 text-gray-400 rounded-xl hover:text-primary transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .agenda-container {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .agenda-container::-webkit-scrollbar { display: none; }
        
        .agenda-header {
          position: relative;
        }

        .my-journey-card {
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }

        .bg-primary\/2 { background-color: rgba(214, 31, 38, 0.02); }
        .pb-120 { padding-bottom: 120px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .w-40 { width: 40px; }
        .h-40 { height: 40px; }
        .w-20 { width: 20px; }
        .h-20 { height: 20px; }
      `}} />
    </div>
  );
};

export default Agenda;
