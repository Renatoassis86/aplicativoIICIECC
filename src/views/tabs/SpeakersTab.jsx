import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  ChevronRight, 
  Filter,
  User,
  ExternalLink,
  Award
} from 'lucide-react';
import SpeakerDetailModal from '../../components/networking/SpeakerDetailModal';

const SpeakersTab = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  const speakers = [
    { 
      id: 1, 
      name: 'Dr. Christopher Schlect', 
      desc: 'New St. Andrews College (USA)', 
      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      category: 'Internacional',
      time: '01 Mai • 10:30',
      longBio: 'Diretor de estudos clássicos na New St. Andrews College, o Dr. Schlect é uma autoridade mundial em pedagogia clássica e história da educação. Sua pesquisa foca na revitalização da Trivium no século XXI.'
    },
    { 
      id: 2, 
      name: 'Dr. Keith Nix', 
      desc: 'Veritas School (Richmond)', 
      img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
      category: 'Internacional',
      time: '02 Mai • 09:00',
      longBio: 'Fundador da Veritas School, Keith Nix é pioneiro no movimento de educação cristã clássica contemporânea, ajudando a fundar dezenas de escolas sob esse modelo ao redor do mundo.'
    },
    { 
      id: 3, 
      name: 'Ms. Thiago Dutra', 
      desc: 'Diretor Schola Classics', 
      img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
      category: 'Nacional',
      time: '01 Mai • 14:00',
      longBio: 'Mestre em Filosofia e um dos principais nomes da educação clássica no Brasil. Atua na formação de professores e na estruturação de currículos clássicos para escolas brasileiras.'
    },
    { 
      id: 4, 
      name: 'Esp. Matheus Macedo', 
      desc: 'Diretor Zoe Christian School', 
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      category: 'Nacional',
      time: '02 Mai • 15:30',
      longBio: 'Especialista em gestão escolar clássica, Matheus lidera a Zoe Christian School em uma transição bem-sucedida para o modelo de educação cristã clássica, focando na formação do caráter.'
    },
    { 
      id: 5, 
      name: 'Esp. Maurício Fonseca', 
      desc: 'Editor-chefe Editora Trinitas', 
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      category: 'Indústria',
      time: 'Painel Literário • 16:00',
      longBio: 'Responsável pela curadoria de obras fundamentais da CCD no Brasil pela Editora Trinitas. Maurício possui profundo conhecimento da herança literária cristã.'
    },
    { 
      id: 6, 
      name: 'Ms. Elmer Pires', 
      desc: 'Fundador Editora Trinitas', 
      img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop',
      category: 'Indústria',
      time: 'Painel Literário • 16:00',
      longBio: 'Idealizador da Editora Trinitas, Elmer tem sido peça chave na democratização do acesso a textos clássicos traduzidos para o português no contexto brasileiro.'
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
            padding: '16px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '32px',
            cursor: 'pointer'
          }}
        >
          <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
             <Clock size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
             <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--secondary)' }}>Ver Grade Completa</p>
             <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confira todos os horários e salas</p>
          </div>
          <ChevronRight size={18} color="var(--primary)" />
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
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
                border: '1px solid rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gold)', padding: '2px' }}>
                 <img src={speaker.img} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '9px', fontWeight: '800', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {speaker.category}
                   </span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>{speaker.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{speaker.desc}</p>
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
