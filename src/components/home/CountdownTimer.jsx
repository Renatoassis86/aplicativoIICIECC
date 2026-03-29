import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export default function CountdownTimer({ targetDate = '2026-05-01T08:00:00' }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const getSpecialMessage = () => {
    const days = timeLeft.days;
    if (timeLeft.total <= 0) return "É HOJE! SEJA BEM-VINDO ao II CIECC! 🌟";
    if (days === 1) return "É AMANHÃ! O grande dia chegou! ⏳";
    if (days === 2) return "Faltam 2 dias: Quase lá! Prepare suas malas!";
    if (days >= 3 && days <= 5) return `Faltam ${days} dias: O coração já está batendo forte! 💓`;
    if (days >= 6 && days <= 7) return "Falta apenas uma semana! A contagem regressiva começou!";
    return "Contagem Regressiva para o II CIECC 2026";
  };

  const isCritical = timeLeft.days <= 7;

  return (
    <div style={{
      margin: '0 0 24px 0',
      padding: '24px',
      background: isCritical 
        ? 'linear-gradient(135deg, rgba(184, 134, 11, 0.95) 0%, rgba(212, 175, 55, 0.95) 100%)' 
        : 'rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: isCritical ? '#1a1a1a' : 'white',
      boxShadow: isCritical ? '0 12px 30px rgba(184, 134, 11, 0.4)' : 'none',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative effect */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.2 }}>
        <Sparkles size={100} color={isCritical ? 'white' : 'var(--gold)'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Calendar size={16} color={isCritical ? '#1a1a1a' : 'var(--gold)'} />
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '900', 
          textTransform: 'uppercase', 
          letterSpacing: '1.5px',
          opacity: 0.9
        }}>
          {getSpecialMessage()}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        {[
          { label: 'Dias', value: timeLeft.days },
          { label: 'Horas', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Segs', value: timeLeft.seconds }
        ].map((item, idx) => (
          <div key={idx} style={{ 
            flex: 1, 
            textAlign: 'center', 
            background: isCritical ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            padding: '12px 0',
            borderRadius: '16px',
            border: isCritical ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)'
          }}>
            <p style={{ 
              fontSize: '28px', 
              fontWeight: '900', 
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1',
              marginBottom: '4px'
            }}>
              {String(item.value).padStart(2, '0')}
            </p>
            <p style={{ 
              fontSize: '9px', 
              fontWeight: '700', 
              textTransform: 'uppercase',
              opacity: 0.7 
            }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
