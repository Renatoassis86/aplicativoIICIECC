import React, { useState } from 'react';
import { 
  Play, 
  Camera, 
  Mic, 
  ChevronRight, 
  PlayCircle, 
  FileText,
  Video,
  ExternalLink,
  Award,
  Heart,
  MessageCircle,
  X,
  Share2,
  MoreVertical
} from 'lucide-react';

const OfficialMediaTab = ({ userCpf, userName }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [comments, setComments] = useState({}); // id: [{author, text}]
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const toggleLike = (id) => {
    const next = new Set(likedStories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedStories(next);
  };

  const addComment = (id) => {
    if (!newComment.trim()) return;
    const storyComments = comments[id] || [];
    setComments({
      ...comments,
      [id]: [...storyComments, { author: userName || 'Participante', text: newComment }]
    });
    setNewComment('');
  };

  const sections = [
    {
      title: 'Entrevistas Exclusivas',
      subtitle: 'Histórias e insights do congresso',
      type: 'stories',
      items: [
        { id: 5, url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=300&fit=crop', title: 'Dr. Schlect', active: true },
        { id: 6, url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=300&fit=crop', title: 'Bastidores', active: true },
        { id: 10, url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop', title: 'Thiago Dutra', active: true },
        { id: 11, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', title: 'M. Fonseca', active: false },
        { id: 12, url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', title: 'Ana Paula', active: true },
        { id: 13, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop', title: 'Prof. Lucas', active: false },
      ]
    },
    {
      title: 'Fotos em Tempo Real',
      subtitle: 'Acompanhe a cobertura oficial do II CIECC',
      type: 'photos',
      items: [
        { id: 1, url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop', label: 'Cerimônia de Abertura' },
        { id: 2, url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop', label: 'Auditório Principal' },
        { id: 3, url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop', label: 'Networking Coffee' },
        { id: 4, url: 'https://images.unsplash.com/photo-1523580494863-6f30312248d5?w=300&h=200&fit=crop', label: 'Workshops Acadêmicos' },
      ]
    },
    {
      title: 'Espaço do Patrocinador',
      subtitle: 'Mensagens e soluções dos nossos parceiros',
      type: 'sponsor',
      items: [
        { 
          id: 7, 
          title: 'Mensagem OIKOS Educação', 
          desc: 'Como a tecnologia auxilia na CCD',
          logo: '/logo.png', 
          action: 'Ver Mais'
        },
        { 
          id: 8, 
          title: 'Editora Trinitas', 
          desc: 'Lançamentos exclusivos no evento',
          logo: '/logo.png', 
          action: 'Acesse'
        },
      ]
    },
    {
      title: 'Fotos do CIECC 2025 (Edição Anterior)',
      subtitle: 'Memórias do I Congresso em João Pessoa',
      type: 'photos',
      items: [
        { id: 101, url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=200&fit=crop', label: 'Início do Movimento' },
        { id: 102, url: 'https://images.unsplash.com/photo-1523240715639-9945037be740?w=300&h=200&fit=crop', label: 'Workshops 2025' },
        { id: 103, url: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=300&h=200&fit=crop', label: 'João Pessoa - PB' },
        { id: 104, url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop', label: 'Equipe Organizadora' },
      ]
    }
  ];

  return (
    <div className="tab-content fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header Customizado Mídia */}
      <header style={{ 
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
        background: 'var(--primary)', 
        color: 'white',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>CIECC <span style={{ color: 'var(--gold)' }}>Mídia</span></h2>
        </div>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>O Hub Prime para a Discussão e Disseminação da Educação Cristã Clássica no Brasil.</p>
      </header>

      {/* Grid de Seções */}
      <div style={{ padding: '0 20px' }}>
        
        {/* DESTAQUE - TRANSMISSÃO AO VIVO (YOUTUBE EMBED) */}
        <div style={{ marginBottom: '40px' }} className="fade-in">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                height: '8px', width: '8px', 
                borderRadius: '50%', 
                background: '#EF4444', 
                animation: 'blink 1s infinite' 
              }}></span>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '900', 
                color: '#EF4444', 
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }}>AO VIVO AGORA</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--accent)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px' }}>
              Destaque do Dia
            </span>
          </div>

          <div style={{ 
            borderRadius: '24px', 
            overflow: 'hidden', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            aspectRatio: '16/9',
            background: '#000',
            border: '1px solid rgba(212,193,156,0.2)',
            transform: 'translateZ(0)'
          }}>
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/fcqS1WTO9ds?autoplay=0&rel=0" 
              title="CIECC Transmissão Ao Vivo" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              style={{ border: 'none' }}
            ></iframe>
          </div>
          
          <div style={{ marginTop: '20px', padding: '0 4px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--secondary)', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>
              Abertura Oficial II CIECC
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Acompanhe em tempo real a abertura e as principais conferências do Hub Digital. Conhecimento e tradição em um só lugar.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
               <button 
                 onClick={() => window.open('https://www.youtube.com/watch?v=fcqS1WTO9ds', '_blank')}
                 style={{ 
                   background: 'var(--primary)', color: 'white', border: 'none', 
                   padding: '10px 18px', borderRadius: '12px', fontWeight: '800', 
                   fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' 
                 }}
               >
                 <ExternalLink size={16} /> Abrir no YouTube
               </button>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
          .pulse { animation: pulseAnim 2s infinite; }
          @keyframes pulseAnim { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
          
          .stories-marquee {
            overflow: hidden;
            width: 100%;
            position: relative;
            padding: 8px 0;
          }
          .stories-content {
            display: flex;
            width: max-content;
            animation: marquee-stories 40s linear infinite;
            gap: 20px;
          }
          @keyframes marquee-stories {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />


        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{section.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{section.subtitle}</p>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Ver Ver</span>
            </div>

            {section.type === 'stories' && (
              <div className="stories-marquee" style={{ marginBottom: '12px' }}>
                <div className="stories-content">
                  {[...section.items, ...section.items].map((story, idx) => (
                    <div 
                      key={`${story.id}-${idx}`} 
                      onClick={() => setSelectedStory(story)}
                      className="clickable"
                      style={{ textAlign: 'center', minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div style={{ 
                        width: '70px', height: '70px', 
                        borderRadius: '50%', 
                        padding: '3px',
                        background: story.active ? 'linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)' : '#E2E8F0',
                        marginBottom: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: '2px' }}>
                          <img src={story.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--secondary)' }}>{story.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.type === 'photos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {section.items.map(img => (
                  <div key={img.id} style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '3/2' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '8px 12px' }}>
                       <span style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'videos' && (
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                {section.items.map(vid => (
                  <div key={vid.id} style={{ minWidth: '160px', position: 'relative' }}>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '3/4' }}>
                      <img src={vid.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.4)' }}>
                         <Play size={16} fill="white" color="white" />
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px' }}>
                        {vid.tag}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px', color: 'var(--secondary)' }}>{vid.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Duração: {vid.duration}</p>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'sponsor' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {section.items.map(item => (
                  <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                    <div style={{ background: item.logo ? 'transparent' : 'var(--accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                       {item.logo ? (
                         <img src={item.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                       ) : (
                         <Award size={24} color="var(--primary)" />
                       )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <button style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '800', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '8px' }}>
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Podcast / Audio Section */}
        <div style={{ background: '#F8F9FA', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
              <Mic size={24} color="var(--gold)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>CIECC Podcasts</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ouça os insights onde estiver</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Play size={14} fill="var(--primary)" color="var(--primary)" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: '700' }}>O Futuro das Artes Liberais</p>
              <div style={{ height: '4px', background: '#eee', borderRadius: '2px', marginTop: '6px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>12:00</span>
          </div>
        </div>

      </div>

      {/* Story Detail Modal (Full Screen) */}
      {selectedStory && (
        <div 
          className="fixed-modal-overlay" 
          style={{ 
            background: 'black',
            zIndex: 10000,
            animation: 'modalFadeIn 0.3s ease-out'
          }}
        >
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Timer Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'env(safe-area-inset-top, 20px) 16px 0', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.8)', borderRadius: '1px' }}></div>
                <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '1px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={selectedStory.url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white' }} />
                  <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{selectedStory.title}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>• Agora</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <MoreVertical size={20} color="white" />
                  <X 
                    size={24} 
                    color="white" 
                    className="clickable"
                    onClick={() => { setSelectedStory(null); setShowComments(false); }} 
                  />
                </div>
              </div>
            </div>

            {/* Story Image */}
            <div style={{ flex: 1, position: 'relative' }}>
              <img 
                src={selectedStory.url} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              {/* Bottom Actions Overlay */}
              {!showComments && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px env(safe-area-inset-bottom, 24px)', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '12px 20px', display: 'flex', alignItems: 'center' }}>
                      <input 
                        placeholder="Enviar mensagem..." 
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addComment(selectedStory.id)}
                      />
                    </div>
                    <Heart 
                      size={28} 
                      color={likedStories.has(selectedStory.id) ? "#E53E3E" : "white"} 
                      fill={likedStories.has(selectedStory.id) ? "#E53E3E" : "none"}
                      onClick={() => toggleLike(selectedStory.id)}
                      className="clickable"
                    />
                    <MessageCircle 
                      size={28} 
                      color="white" 
                      onClick={() => setShowComments(!showComments)}
                      className="clickable"
                    />
                    <Share2 size={28} color="white" />
                  </div>
                </div>
              )}
            </div>

            {/* Comments Overlay (Slide-up style like IG) */}
            {showComments && (
              <div style={{ 
                height: '400px', 
                background: 'white', 
                borderTopLeftRadius: '24px', 
                borderTopRightRadius: '24px', 
                padding: '20px 0',
                display: 'flex', flexDirection: 'column'
              }} className="fade-in">
                <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }}></div>
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h4 style={{ fontWeight: '800' }}>Comentários</h4>
                   <X size={20} color="#666" onClick={() => setShowComments(false)} className="clickable" />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                   {comments[selectedStory.id]?.length > 0 ? (
                      comments[selectedStory.id].map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                             {c.author.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '800' }}>{c.author}</p>
                            <p style={{ fontSize: '13px', color: '#444' }}>{c.text}</p>
                          </div>
                        </div>
                      ))
                   ) : (
                     <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                        <p style={{ fontSize: '13px' }}>Nenhum comentário ainda.</p>
                        <p style={{ fontSize: '11px' }}>Seja o primeiro a comentar o story!</p>
                     </div>
                   )}
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px' }}>
                   <input 
                      placeholder="Adicione um comentário..." 
                      style={{ flex: 1, background: '#f5f5f5', border: 'none', borderRadius: '12px', padding: '12px 16px', outline: 'none' }}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                   />
                   <button 
                     onClick={() => addComment(selectedStory.id)}
                     style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px' }}
                   >
                     Publicar
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialMediaTab;
