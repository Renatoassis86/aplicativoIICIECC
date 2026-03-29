import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  ChevronRight, 
  Filter,
  User,
  Users,
  ExternalLink,
  Award,
  Calendar
} from 'lucide-react';
import SpeakerDetailModal from '../../components/networking/SpeakerDetailModal';

const SpeakersTab = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  const speakers = [
    { 
      id: 1, 
      name: 'Dr. Chris Schlect', 
      desc: 'DIRETOR DO PROGRAMA DE PÓS-GRADUAÇÃO NO NEW SAINT ANDREWS COLLEGE', 
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      category: 'Internacional',
      time: '01 Mai • 09:30',
      longBio: 'Christopher Schlect trabalha na área da educação clássica e cristã há mais de trinta anos. Em sua instituição de origem, o New Saint Andrews College, ele atua como Chefe do Departamento de Humanidades e Diretor do programa de pós-graduação em estudos clássicos e cristãos. Leciona regularmente cursos de graduação e pós-graduação nas áreas de história, retórica clássica e educação. Também lecionou na Washington State University e atualmente integra o corpo docente do programa de Liderança Clássica para Pós-Graduados do Gordon College. Além de seu trabalho no ensino superior, Schlect possui muitos anos de experiência docente no ensino médio.'
    },
    { 
      id: 2, 
      name: 'Dr. Keith Nix', 
      desc: 'DIRETOR DA VERITAS SCHOOL EM RICHMOND', 
      img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      category: 'Internacional',
      time: '02 Mai • 09:00',
      longBio: 'Keith Nix atua como Diretor da Veritas School em Richmond, Virgínia, desde 2010. Antes de sua passagem pela Veritas, foi membro do conselho e, posteriormente, Diretor da The Westminster School em Birmingham, Alabama. Keith utiliza sua vasta experiência para apoiar outros líderes e escolas no movimento da educação clássica, oferecendo frequentemente consultoria e orientação a conselhos e líderes escolares. Keith é membro do Conselho Consultivo do Presidente da Society for Classical Learning (SCL).'
    },
    { 
      id: 3, 
      name: 'Ms. Thiago Dutra', 
      desc: 'CHANCELER DE EDUCAÇÃO DA CIDADE VIVA', 
      img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      category: 'Nacional',
      time: '01 Mai • 14:00',
      longBio: 'Bacharel em Direito (UFPB), Bacharel em Teologia (FTSA), Especialista em Educação Cristã Clássica (FICV), Mestre em Direitos Humanos (UFPB), Mestre em Gestão de Organizações Aprendentes (UFPB). Diretor de Educação da Fundação Cidade Viva (Cidade Viva Education, Escola Internacional Cidade Viva, Faculdade Internacional Cidade Viva e Escola Bíblica Cidade Viva). Pastor Mestre da Igreja Cidade Viva Natal. Professor de Teologia e autor de livros com foco em Família, Igreja e Educação (FICV). Casado com Dayane há 13 anos e pai de Bella (9 anos), Davi (5 anos) e João Miguel (3 anos).'
    },
    { 
      id: 7, 
      name: 'Rosely Garcia', 
      desc: 'EMPRESÁRIA E FUNDADORA DA PACTUM', 
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      category: 'Nacional',
      time: 'Painel Empresarial',
      longBio: 'Rosely Garcia é cristã, esposa de Ademir Garcia e mãe de Elisa, Ana e Benício. É empresária e fundadora da PACTUM, empresa dedicada à implantação, consultoria e desenvolvimento de escolas cristãs clássicas, oferecendo suporte estratégico, pedagógico e institucional a igrejas e mantenedores. Possui formação em Economia, Administração e Marketing pela Syracuse University (Nova York, 2003). Concluiu o MBA em Gestão de Pessoas pela FGV (2014) e o programa Owner/President Management (OPM) pela Harvard Business School (Boston, 2023).'
    },
    { 
      id: 4, 
      name: 'Esp. Matheus Macedo', 
      desc: 'DIRETOR DA ZOE CHRISTIAN SCHOOL', 
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      category: 'Nacional',
      time: '02 Mai • 15:30',
      longBio: 'Casado com Tatiana, pai de Malu, Lara e Timóteo. Matheus é formado em Direito pela Universidade Federal de Pernambuco e em Teologia pelo IBRMEC. Possui LLM em Direito Societário pela FGV e é pós graduado em Educação Cristã Clássica pela Faculdade Internacional Cidade Viva. Dedica-se ao estudo da Educação Cristã Clássica desde 2017. Hoje, exerce seu ministério como pastor da Igreja Nova Vida em Boa Viagem, e é diretor da Zoe Christian School, primeira escola de educação cristã clássica de Pernambuco.'
    },
    { 
      id: 5, 
      name: 'Esp. Maurício Fonseca', 
      desc: 'EDITOR-CHEFE NA EDITORA TRINITAS', 
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      category: 'Indústria',
      time: '01 Mai • 16:00',
      longBio: 'Maurício Fonseca é presbítero na Igreja Presbiteriana do Brasil e editor-chefe da Editora Trinitas. Graduado em Administração (Mackenzie) e Pedagogia, possui especialização pela FIA e Master em Gestão Internacional (França). É fundador da Escola Cristã Clássica Trinitas.'
    },
    { 
      id: 6, 
      name: 'Ms. Elmer Pires', 
      desc: 'SÓCIO CO-FUNDADOR DA EDITORA TRINITAS', 
      img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      category: 'Indústria',
      time: '02 Mai • 11:30',
      longBio: 'Mestre em Educação pela Universidade Bob Jones (EUA). É sócio co-fundador da editora Trinitas e da Escola Cristã Clássica Trinitas, onde trabalha como diretor. É pastor da Igreja Batista Reformada de São Bernardo do Campo.'
    }
  ];

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Header com Busca */}
      <header style={{ 
        padding: 'env(safe-area-inset-top, 40px) 20px 24px', 
        background: 'white', 
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <div>
              <h2 style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>Palestrantes</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Conheça as mentes por trás do II CIECC</p>
           </div>
           <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Users size={24} />
           </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} color="#A0AEC0" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou instituição..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              background: '#F8F9FA', 
              border: 'none', 
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '600'
            }}
          />
        </div>
      </header>

      {/* Lista de Palestrantes */}
      <div style={{ padding: '24px 20px' }}>
        
        {/* Call to Action - Programação */}
        <div 
          onClick={() => onNavigate('agenda')}
          style={{ 
            background: 'var(--accent)', 
            padding: '18px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '32px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212, 193, 156, 0.2)'
          }}
        >
          <div style={{ background: 'white', padding: '10px', borderRadius: '14px' }}>
             <Calendar size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
             <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>Grade de Horários</p>
             <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Veja quando cada um irá falar</p>
          </div>
          <ChevronRight size={18} color="var(--primary)" />
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredSpeakers.map((speaker) => (
            <div 
              key={speaker.id} 
              onClick={() => setSelectedSpeaker(speaker)}
              className="card" 
              style={{ 
                padding: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                border: '1px solid rgba(0,0,0,0.03)',
                background: 'white'
              }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2.5px solid var(--gold)', padding: '2px' }}>
                 <img src={speaker.img} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(107, 20, 26, 0.08)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {speaker.category}
                   </span>
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.2', marginBottom: '4px' }}>{speaker.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {speaker.desc}
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                 <ChevronRight size={18} color="#CBD5E0" />
              </div>
            </div>
          ))}
        </div>

        {filteredSpeakers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
             <Search size={40} color="#CBD5E0" style={{ margin: '0 auto 16px' }} />
             <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>Nenhum palestrante encontrado.</p>
             <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tente buscar por outro termo.</p>
          </div>
        )}
      </div>

      {selectedSpeaker && (
        <SpeakerDetailModal 
          speaker={selectedSpeaker} 
          onClose={() => setSelectedSpeaker(null)}
          onSaveFavorite={(s) => alert(`${s.name} salvo nos seus favoritos!`)}
        />
      )}
    </div>
  );
};

export default SpeakersTab;
