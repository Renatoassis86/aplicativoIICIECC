import React, { useState, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import ReactPlayer from 'react-player';

const MediaPlayerModal = ({ media, onClose }) => {
  if (!media) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);

  // Normalizar a URL independente da origem (OfficialMediaTab vs MediaTab)
  const mediaUrl = media.url || media.videoUrl || media.audioUrl || media.url_or_path;
  
  const isYoutube = mediaUrl?.includes('youtube.com') || mediaUrl?.includes('youtu.be');
  const isVideoFile = mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm') || media.media_type === 'video' || media.type === 'video';
  const isAudioFile = mediaUrl?.endsWith('.mp3') || mediaUrl?.endsWith('.wav') || media.media_type === 'audio' || media.type === 'podcast' || media.media_type === 'podcast';

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
       videoRef.current.seekTo(time, 'seconds');
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)',
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
        
        {error ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
            <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
            <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>Erro ao reproduzir vídeo</h4>
            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px' }}>{error}</p>
            <button 
              onClick={() => window.open(mediaUrl, '_blank')}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800' }}
            >
              ABRIR NO NAVEGADOR
            </button>
          </div>
        ) : isYoutube || isVideoFile ? (
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', background: '#000', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <ReactPlayer
              ref={videoRef}
              url={mediaUrl}
              playing={isPlaying}
              controls={true}
              width="100%"
              height="100%"
              onError={(e) => {
                console.error("ReactPlayer Error:", e);
                setError("O link pode estar quebrado ou indisponível para este dispositivo.");
              }}
              onProgress={(p) => setProgress(p.playedSeconds)}
              onDuration={(d) => setDuration(d)}
              config={{
                youtube: {
                  playerVars: { showinfo: 1, modestbranding: 1, rel: 0 }
                }
              }}
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

            <ReactPlayer
              url={mediaUrl}
              playing={isPlaying}
              width="0"
              height="0"
              onProgress={(p) => setProgress(p.playedSeconds)}
              onDuration={(d) => setDuration(d)}
              onError={() => setError("Erro ao carregar o áudio.")}
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
