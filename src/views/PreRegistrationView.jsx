import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── WhatsApp mask: (99) 99999-9999 ───────────────────────────────────────────
const maskWhatsApp = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2)  return `(${digits}`;
  if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  return value;
};

const PreRegistrationView = ({ onClose }) => {
  const [form, setForm]       = useState({ name: '', email: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  // ── Field handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    if (name === 'whatsapp') {
      setForm((prev) => ({ ...prev, whatsapp: maskWhatsApp(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic e-mail validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Informe um e-mail válido.');
      return;
    }

    // Require full WhatsApp number
    const digits = form.whatsapp.replace(/\D/g, '');
    if (digits.length < 11) {
      setError('Informe o WhatsApp completo com DDD.');
      return;
    }

    setLoading(true);
    try {
      const { error: sbError } = await supabase
        .from('pre_registrations')
        .insert([{ name: form.name.trim(), email: form.email.trim().toLowerCase(), whatsapp: form.whatsapp }]);

      if (sbError) {
        // Unique constraint on e-mail
        if (sbError.code === '23505' || sbError.message?.toLowerCase().includes('unique')) {
          setError('Este e-mail já está pré-inscrito!');
        } else {
          setError('Ocorreu um erro. Tente novamente.');
          console.error(sbError);
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SHARED LAYOUT WRAPPER
  // ─────────────────────────────────────────────────────────────────────────
  const Wrapper = ({ children }) => (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#0A0F1A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto',
    }}>
      {/* Top gradient accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '320px',
        background: 'linear-gradient(160deg, rgba(107,20,26,0.35) 0%, rgba(180,140,60,0.12) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            transition: 'all 0.2s',
            zIndex: 100000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <X size={18} />
        </button>
      )}

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '460px',
      }}>
        {children}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <Wrapper>
        <div style={{ textAlign: 'center' }}>
          {/* Golden check circle */}
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(180,140,60,0.2) 0%, rgba(212,193,156,0.1) 100%)',
            border: '2px solid rgba(212,193,156,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: '0 0 40px rgba(180,140,60,0.15)',
          }}>
            <Check size={40} color="#D4C19C" strokeWidth={2.5} />
          </div>

          {/* Logo */}
          <img
            src="/logo.png"
            alt="CIECC"
            style={{ height: '54px', marginBottom: '28px', opacity: 0.9, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
          />

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}>
            Você está na lista!
          </h2>

          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: '8px',
          }}>
            Sua pré-inscrição para o
          </p>

          <p style={{
            color: '#D4C19C',
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '0.5px',
          }}>
            III CIECC 2027
          </p>

          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '13px',
            lineHeight: 1.7,
            marginBottom: '40px',
            padding: '0 8px',
          }}>
            Em breve você receberá novidades e informações<br />
            sobre inscrições no e-mail cadastrado.
          </p>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(212,193,156,0.2), transparent)',
            marginBottom: '32px',
          }} />

          <button
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #6B141A 0%, #8B1E24 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '16px 32px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(107,20,26,0.35)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(107,20,26,0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(107,20,26,0.35)'; }}
          >
            Voltar ao Hub <ArrowRight size={18} />
          </button>
        </div>
      </Wrapper>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '15px 18px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    marginBottom: '8px',
  };

  const groupStyle = { marginBottom: '20px' };

  return (
    <Wrapper>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <img
          src="/logo.png"
          alt="CIECC"
          style={{ height: '60px', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))' }}
        />
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '28px',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.5px',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}>
          Pré-Inscrição<br />
          <span style={{ color: '#D4C19C' }}>III CIECC 2027</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '14px',
          lineHeight: 1.6,
          maxWidth: '320px',
          margin: '0 auto',
        }}>
          Garanta sua vaga na lista de espera e receba em primeira mão todas as novidades do congresso.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '32px',
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* Nome */}
          <div style={groupStyle}>
            <label htmlFor="pre-name" style={labelStyle}>Nome Completo</label>
            <input
              id="pre-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(212,193,156,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 16px rgba(180,140,60,0.08)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)';  e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* E-mail */}
          <div style={groupStyle}>
            <label htmlFor="pre-email" style={labelStyle}>E-mail</label>
            <input
              id="pre-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(212,193,156,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 16px rgba(180,140,60,0.08)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)';  e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* WhatsApp */}
          <div style={{ ...groupStyle, marginBottom: '28px' }}>
            <label htmlFor="pre-whatsapp" style={labelStyle}>WhatsApp</label>
            <input
              id="pre-whatsapp"
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={form.whatsapp}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(212,193,156,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 16px rgba(180,140,60,0.08)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)';  e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(107,20,26,0.25)',
              border: '1px solid rgba(107,20,26,0.5)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: loading
                ? 'rgba(107,20,26,0.5)'
                : 'linear-gradient(135deg, #6B141A 0%, #8B1E24 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '17px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(107,20,26,0.35)',
              transition: 'all 0.25s',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(107,20,26,0.45)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(107,20,26,0.35)'; }}
          >
            {loading ? (
              <>
                <Spinner /> Enviando...
              </>
            ) : (
              <>
                Quero me pré-inscrever <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer note */}
      <p style={{
        color: 'rgba(255,255,255,0.25)',
        fontSize: '12px',
        textAlign: 'center',
        marginTop: '24px',
        lineHeight: 1.6,
      }}>
        Seus dados estão seguros e não serão compartilhados.
      </p>
    </Wrapper>
  );
};

// ── Inline spinner (no external dep) ─────────────────────────────────────────
const Spinner = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'pre-reg-spin 0.75s linear infinite' }}
  >
    <style>{`@keyframes pre-reg-spin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

export default PreRegistrationView;
