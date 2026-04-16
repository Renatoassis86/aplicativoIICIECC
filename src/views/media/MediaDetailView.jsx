import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Send,
  Video,
  Mic,
  FastForward,
  Info,
  Bookmark
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MediaDetailView = ({ media, onClose, userCpf, userName }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(media.startIndex || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const commentInputRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (media) {
      if (media.id) fetchEngagements();
      document.body.style.overflow = 'hidden';
      const container = document.querySelector('.fixed-page-portal');
      if (container) container.scrollTop = 0;
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [media]);

  const fetchEngagements = async () => {
    if (!media.id) return;
    setIsLoading(true);
    try {
      // Fetch engagements
      const { data: engagements, error: eError } = await supabase
        .from('media_engagements')
        .select('*')
        .eq('media_id', media.id)
        .eq('user_cpf', userCpf);
      
      if (!eError) {
        setIsLiked(engagements.some(e => e.type === 'like'));
        setIsSaved(engagements.some(e => e.type === 'save' || e.type === 'favorite'));
      }

      const { data: allLikes } = await supabase.from('media_engagements').select('id').eq('media_id', media.id).eq('type', 'like');
      setLikesCount(allLikes?.length || 0);

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
    if (!media.id) return;
    try {
      if (isLiked) {
        await supabase.from('media_engagements').delete().eq('media_id', media.id).eq('user_cpf', userCpf).eq('type', 'like');
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase.from('media_engagements').insert({ media_id: media.id, media_type: media.type, user_cpf: userCpf, type: 'like' });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  const handleSave = async () => {
    if (!media.id) return;
    try {
      if (isSaved) {
        await supabase.from('media_engagements').delete().eq('media_id', media.id).eq('user_cpf', userCpf).filter('type', 'in', '("save","favorite")');
        setIsSaved(false);
      } else {
        await supabase.from('media_engagements').insert({ media_id: media.id, media_type: media.type, user_cpf: userCpf, type: 'save' });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error handling save:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !media.id) return;
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

  const isPodcast = media.type === 'podcast';
  const isGallery = media.type === 'gallery';
  const isVideo = (media.type === 'story' || media.type === 'video' || media.type === 'youtube');
  const videoUrl = media.videoUrl || (isVideo ? media.url : null);
  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayback = () => {
    const player = isPodcast ? audioRef.current : videoRef.current;
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
  };

  const handleTimeUpdate = () => {
    const player = isPodcast ? audioRef.current : videoRef.current;
    if (player) {
      setCurrentTime(player.currentTime);
      setDuration(player.duration || 0);
    }
  };

  return createPortal(
    <div className="fixed-page-portal" style={{ position: 'fixed', inset: 0, zIndex: 999999, background: '#111', overflowY: 'auto' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .fixed-page-portal { scrollbar-width: none; background: #000; }
        .fixed-page-portal::-webkit-scrollbar { display: none; }
        .pulse-aura { animation: pulseAura 2s ease-out infinite; }
        @keyframes pulseAura { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.8); opacity: 0; } }
      `}} />

      <div style={{ position: 'relative', width: '100%', minHeight: isPodcast || isVideo ? '90vh' : '70vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isYouTube ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`${(videoUrl || '').replace('watch?v=', 'embed/')}${(videoUrl || '').includes('?') ? '&' : '?'}autoplay=1&mute=0`} 
              title={media.title} 
              frameBorder="0" 
              allowFullScreen 
              style={{ position: 'absolute', inset: 0 }}
            ></iframe>
          ) : isVideo ? (
            <video ref={videoRef} src={videoUrl || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} autoPlay onTimeUpdate={handleTimeUpdate} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
          ) : isPodcast ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #2d1b42 0%, #000 100%)', padding: '60px 20px' }}>
               <audio ref={audioRef} src={media.audioUrl || media.videoUrl} onTimeUpdate={handleTimeUpdate} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
               <div style={{ width: '220px', height: '220px', borderRadius: '32px', position: 'relative', marginBottom: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
                 <img src={media.url} alt="" style={{ width: '100%', height: '100%', borderRadius: '32px', objectFit: 'cover' }} />
                 {isPlaying && <div className="pulse-aura" style={{ position: 'absolute', inset: '-10px', borderRadius: '40px', border: '3px solid var(--gold)', opacity: 0.2 }}></div>}
               </div>
               <div style={{ textAlign: 'center', maxWidth: '300px', marginBottom: '40px' }}>
                 <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>{media.title}</h2>
                 <p style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>CIECC PODCAST PLAYER</p>
               </div>
               <div style={{ width: '100%', maxWidth: '340px' }}>
                 <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', marginBottom: '12px', cursor: 'pointer' }} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); if (audioRef.current) audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration; }}>
                   <div style={{ width: `${(currentTime / (duration || 1)) * 100}%`, height: '100%', background: 'var(--gold)', borderRadius: '3px' }}></div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '11px', fontWeight: '800' }}><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '32px' }}>
                   <button onClick={handleSpeedChange} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--gold)', fontSize: '12px', fontWeight: '900', padding: '6px 12px', borderRadius: '12px', width: '50px' }}>{playbackSpeed}x</button>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                     <SkipBack size={28} color="white" fill="white" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15 }} />
                     <button onClick={togglePlayback} style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isPlaying ? <Pause size={32} color="black" fill="black" /> : <Play size={32} color="black" fill="black" style={{ marginLeft: '4px' }} />}</button>
                     <SkipForward size={28} color="white" fill="white" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15 }} />
                   </div>
                   <Volume2 size={24} color="#666" />
                 </div>
               </div>
            </div>
          ) : isGallery ? (
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src={media.photos[activeGalleryIndex]?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               <div style={{ position: 'absolute', bottom: '20px', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: '20px', color: 'white', fontSize: '13px', fontWeight: '800' }}>{activeGalleryIndex + 1} / {media.photos.length}</div>
               <button onClick={(e) => { e.stopPropagation(); setActiveGalleryIndex(prev => (prev - 1 + media.photos.length) % media.photos.length); }} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white' }}><ArrowLeft size={24} /></button>
               <button onClick={(e) => { e.stopPropagation(); setActiveGalleryIndex(prev => (prev + 1) % media.photos.length); }} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white' }}><ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} /></button>
            </div>
          ) : (
            <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', zIndex: 10 }}><X size={24} /></button>
      </div>

      <div style={{ padding: '32px 24px 120px', background: 'linear-gradient(to bottom, #000, #111)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{media.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', background: 'var(--gold)', color: 'black', padding: '4px 8px', borderRadius: '6px' }}>{media.type?.toUpperCase()}</span>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: '700' }}>Cobertura Oficial II CIECC</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
             <button onClick={handleLike} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <Heart size={28} color={isLiked ? "#FF4D4D" : "white"} fill={isLiked ? "#FF4D4D" : "none"} />
               <span style={{ fontSize: '12px', color: '#666', fontWeight: '800' }}>{likesCount}</span>
             </button>
             <button onClick={handleSave} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
               <Bookmark size={28} color={isSaved ? "var(--gold)" : "white"} fill={isSaved ? "var(--gold)" : "none"} />
               <span style={{ fontSize: '12px', color: '#666', fontWeight: '800' }}>{isSaved ? 'SALVO' : 'SALVAR'}</span>
             </button>
          </div>
        </div>
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}><MessageCircle size={24} color="var(--gold)" /><h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', margin: 0 }}>Conversa da Comunidade</h3></div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', marginBottom: '40px' }}>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="O que você achou deste conteúdo?" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', minHeight: '80px', fontSize: '15px', resize: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}><button onClick={handleAddComment} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={16} /> POSTAR</button></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span style={{ fontWeight: '900', color: 'var(--gold)', fontSize: '13px' }}>{c.user_name}</span><span style={{ color: '#444', fontSize: '11px' }}>{new Date(c.created_at).toLocaleDateString()}</span></div>
                <p style={{ color: '#AAA', fontSize: '15px', lineHeight: '1.6' }}>{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MediaDetailView;
