import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  ChevronLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Send,
  Video,
  Mic
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MediaDetailView = ({ media, onClose, userCpf, userName }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(media.startIndex || 0);
  
  const commentInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (media) {
      fetchEngagements();
      document.body.style.overflow = 'hidden';
      // Reset scroll for the portal container
      const container = document.querySelector('.media-detail-fixed');
      if (container) container.scrollTop = 0;
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [media]);

  const fetchEngagements = async () => {
    setIsLoading(true);
    try {
      // Fetch likes
      const { data: likes, error: lError } = await supabase
        .from('media_engagements')
        .select('*')
        .eq('media_id', media.id)
        .eq('type', 'like');
      
      if (!lError) {
        setLikesCount(likes.length);
        setIsLiked(likes.some(l => l.user_cpf === userCpf));
      }

      // Fetch comments
      const { data: comms, error: cError } = await supabase
        .from('media_comments')
        .select('*')
        .eq('media_id', media.id)
        .order('created_at', { ascending: false });
      
      if (!cError) setComments(comms);
    } catch (err) {
      console.error('Error fetching media social:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await supabase
          .from('media_engagements')
          .delete()
          .eq('media_id', media.id)
          .eq('user_cpf', userCpf)
          .eq('type', 'like');
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('media_engagements')
          .insert({
            media_id: media.id,
            media_type: media.type,
            user_cpf: userCpf,
            type: 'like'
          });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data, error } = await supabase
        .from('media_comments')
        .insert({
          media_id: media.id,
          media_type: media.type,
          user_cpf: userCpf,
          user_name: userName || 'Participante',
          comment: newComment.trim()
        }).select().single();
      
      if (!error) {
        setComments([data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const focusCommentInput = () => {
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    commentInputRef.current?.focus();
  };

  const isPodcast = media.type === 'podcast';
  const isGallery = media.type === 'gallery';
  const isPhoto = media.type === 'photo';
  const isVideo = (media.type === 'story' || media.type === 'video') && media.videoUrl;
  const isYouTube = isVideo && (media.videoUrl.includes('youtube.com') || media.videoUrl.includes('youtu.be'));

  const handleNextPhoto = () => {
    if (media.photos) {
      setActiveGalleryIndex((prev) => (prev + 1) % media.photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (media.photos) {
      setActiveGalleryIndex((prev) => (prev - 1 + media.photos.length) % media.photos.length);
    }
  };

  return createPortal(
    <div className="fixed-page-portal">
      <style dangerouslySetInnerHTML={{__html: `
        .fixed-page-portal { scrollbar-width: none; }
        .fixed-page-portal::-webkit-scrollbar { display: none; }
        .pulse-aura { animation: pulseAura 2s ease-out infinite; }
        @keyframes pulseAura { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.8); opacity: 0; } }
      `}} />

      {/* Hero Header / Video Player */}
      <div style={{ position: 'relative', width: '100%', height: isPodcast || isVideo ? '100dvh' : '70vh', flexShrink: 0, background: '#000' }}>
        
        {isVideo ? (
          isYouTube ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`${media.videoUrl.replace('watch?v=', 'embed/')}${media.videoUrl.includes('?') ? '&' : '?'}autoplay=1&mute=0`} 
              title={media.title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              ref={videoRef}
              src={media.videoUrl} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              autoPlay 
              loop 
              controls
            />
          )
        ) : isGallery ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <img 
               src={media.photos[activeGalleryIndex]?.url} 
               alt="gallery-active" 
               style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }} 
             />
             <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '800', zIndex: 2 }}>
               {activeGalleryIndex + 1} / {media.photos.length}
             </div>
             <button onClick={handlePrevPhoto} style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white', zIndex: 2 }}>
               <ChevronLeft size={24} />
             </button>
             <button onClick={handleNextPhoto} style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white', zIndex: 2 }}>
               <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
             </button>
          </div>
        ) : isPhoto ? (
          <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: isPodcast ? 'linear-gradient(135deg, #4A101D 0%, #1a237e 100%)' : 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', 
            position: 'relative',
            padding: '40px 20px' 
          }}>
             <img src={media.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, filter: 'blur(30px)' }} />
             
             {/* Animated Mic Ring */}
             <div style={{ 
               width: '180px', height: '180px', borderRadius: '50%', 
               background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
               border: '1px solid rgba(255,255,255,0.2)',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               position: 'relative', zIndex: 1,
               boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
               marginBottom: '40px'
             }}>
               <Mic size={90} color="var(--gold)" />
               {isPlaying && (
                 <div className="pulse-aura" style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '2px solid var(--gold)', opacity: 0.3 }}></div>
               )}
             </div>

             {isPodcast && (
               <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', maxWidth: '320px' }}>
                  <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '900', fontFamily: 'var(--font-serif)', marginBottom: '12px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{media.title}</h2>
                  <p style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px' }}>CIECC PODCAST PLAYER</p>
                  
                  {/* Embedded Player Inside Hero */}
                  <div style={{ width: '100%', marginBottom: '40px' }}>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', marginBottom: '16px' }}>
                      <div style={{ width: '42%', height: '100%', background: 'var(--gold)', borderRadius: '3px' }}></div>
                      <div style={{ position: 'absolute', left: '42%', top: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', background: 'white', borderRadius: '50%', boxShadow: '0 0 10px var(--gold)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '900' }}>
                      <span>08:42</span>
                      <span>35:00</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                    <SkipBack size={32} color="white" />
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{ 
                        width: '85px', height: '85px', borderRadius: '50%', background: 'white', border: 'none', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.4)', transition: 'transform 0.2s'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isPlaying ? <Pause size={40} color="var(--primary)" fill="var(--primary)" /> : <Play size={40} color="var(--primary)" fill="var(--primary)" style={{ marginLeft: '8px' }} />}
                    </button>
                    <SkipForward size={32} color="white" />
                  </div>
               </div>
             )}
          </div>
        )}

        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 20px)', left: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', zIndex: 10 }}
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 24px) + 20px)', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', zIndex: 10 }}
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, padding: '32px 24px', position: 'relative', color: 'white' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'var(--font-serif)' }}>{media.title}</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button onClick={handleLike} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Heart size={28} color={isLiked ? "#FF0000" : "white"} fill={isLiked ? "#FF0000" : "none"} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '800' }}>{likesCount}</span>
              </button>
              <button onClick={focusCommentInput} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <MessageCircle size={28} color="white" />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '800' }}>{comments.length}</span>
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
             <span style={{ fontSize: '12px', fontWeight: '900', background: 'var(--gold)', color: 'var(--secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                {isGallery ? 'GALERIA' : isPodcast ? 'PODCAST' : isPhoto ? 'FOTO' : 'ENTREVISTA'}
             </span>
             <span style={{ fontSize: '12px' }}>II CIECC VIP • Cobertura Exclusiva</span>
          </div>
        </div>

        {/* Podcast Player Section removed from body as it is now in the Hero */}

        {/* Comments Section */}
        <div>
          <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '900', marginBottom: '24px' }}>Discussão da Comunidade</h3>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '24px', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '40px'
          }}>
            <textarea 
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Sua percepção sobre este conteúdo..."
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', minHeight: '80px', resize: 'none', fontSize: '15px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                onClick={handleAddComment}
                style={{ background: 'var(--gold)', color: 'var(--secondary)', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} /> ENVIAR COMENTÁRIO
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: '900', fontSize: '13px' }}>{c.user_name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>{c.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '80px' }}></div>
      </div>
    </div>,
    document.body
  );
};

export default MediaDetailView;
