import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Youtube } from 'lucide-react';

const MediaPlayerModal = ({ media, onClose }) => {
  if (!media) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Normalizar a URL independente da origem (OfficialMediaTab vs MediaTab)
  const mediaUrl = media.url || media.videoUrl || media.audioUrl || media.url_or_path;
  
  const isYoutube = mediaUrl?.includes('youtube.com') || mediaUrl?.includes('youtu.be');
  const isVideoFile = mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm') || media.media_type === 'video';
  const isAudioFile = mediaUrl?.endsWith('.mp3') || mediaUrl?.endsWith('.wav') || media.media_type === 'audio' || media.type === 'podcast';

  const getYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = isYoutube ? getYoutubeId(mediaUrl) : null;

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const ref = videoRef.current || audioRef.current;
        if (ref) {
          setProgress(ref.currentTime);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const ref = videoRef.current || audioRef.current;
    if (ref) {
      if (isPlaying) ref.pause();
      else {
        ref.play().catch(e => console.error("Playback error:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    const ref = videoRef.current || audioRef.current;
    if (ref) {
      ref.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      zIndex: 2000, display: 'flex', flexDirection: 'column',
      padding: 'env(safe-area-inset-top, 20px) 0 env(safe-area-inset-bottom, 20px)'
    }} className="fade-in">
      
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>{media.title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{media.description || 'II CIECC 2026'}</p>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '50%', color: 'white' }}>
          <X size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        
        {isYoutube && youtubeId ? (
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
            <iframe 
              width="100%" height="100%" 
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`} 
              title={media.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : isVideoFile && !isAudioFile ? (
          <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <video 
              ref={videoRef}
              src={mediaUrl} 
              style={{ width: '100%', maxHeight: '70vh' }}
              onLoadedMetadata={() => setDuration(videoRef.current.duration)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              playsInline
              autoPlay
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ 
              aspectRatio: '1/1', background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)', 
              borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginBottom: '40px', position: 'relative',
              overflow: 'hidden'
            }}>
               <img src="/logo.png" style={{ width: '50%', opacity: 0.2, filter: 'invert(1)' }} alt="" />
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--gold)', fontWeight: '900', letterSpacing: '2px', fontSize: '12px', marginBottom: '8px' }}>AUDIO HUB</p>
                  <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>{media.title || 'CIECC Podcast'}</h2>
               </div>
            </div>

            <audio 
              ref={audioRef}
              src={mediaUrl}
              onLoadedMetadata={() => setDuration(audioRef.current.duration)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              autoPlay
            />

            {/* Audio Controls */}
            <div style={{ color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input 
                type="range" min="0" max={duration || 0} step="0.1" value={progress}
                onChange={handleSeek}
                style={{ width: '100%', height: '4px', appearance: 'none', background: 'rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer', marginBottom: '32px' }}
                className="progress-slider"
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                <button style={{ background: 'none', border: 'none', color: 'white' }}><SkipBack size={24} /></button>
                <button 
                  onClick={togglePlay}
                  style={{ 
                    background: 'white', color: 'var(--primary)', border: 'none', 
                    width: '64px', height: '64px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>
                <button style={{ background: 'none', border: 'none', color: 'white' }}><SkipForward size={24} /></button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--gold);
        }
      `}} />

    </div>
  );
};

export default MediaPlayerModal;
