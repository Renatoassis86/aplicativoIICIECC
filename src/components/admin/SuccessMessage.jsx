import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { CheckCircle2 } from 'lucide-react';

const SuccessMessage = ({ message, onComplete }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      background: 'rgba(15, 23, 42, 0.95)',
      padding: '40px 60px',
      borderRadius: '32px',
      border: '2px solid var(--gold)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(20px)',
      animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        colors={['#D4C19C', '#FFFFFF', '#4A101D', '#FCD34D']}
      />
      
      <div style={{
        background: 'var(--gold)',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(212, 193, 156, 0.4)'
      }}>
        <CheckCircle2 size={48} color="#4A101D" strokeWidth={3} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>SUCESSO!</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: '600' }}>{message}</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default SuccessMessage;
