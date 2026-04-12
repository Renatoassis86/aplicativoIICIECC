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
import { supabase } from '../../lib/supabase';
import { useContent } from '../../hooks/useContent';

const SpeakersTab = ({ onNavigate }) => {
  const { content: speakersTitle } = useContent('titles', 'page_speakers');
  const { content: speakersSubtitle } = useContent('titles', 'page_speakers_subtitle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [speakersList, setSpeakersList] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    const { data } = await supabase.from('speakers').select('*').order('name');
    if (data) {
      setSpeakersList(data.map(s => ({
        id: s.id,
        name: s.name,
        desc: s.institution,
        img: s.photo_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        category: s.category || 'Palestrante',
        longBio: s.bio
      })));
    }
    setLoading(false);
  };

  const filteredSpeakers = speakersList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h2 style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>{speakersTitle || 'Palestrantes'}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{speakersSubtitle || 'Conheça as mentes por trás do II CIECC'}</p>
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
