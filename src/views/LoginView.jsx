import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginView = ({ onLogin, onAdminAccess }) => {
  const [loginCpf, setLoginCpf] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginCpf, loginPassword);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setIsForgotMode(false);
    }, 3000);
  };

  if (isForgotMode) {
    return (
      <div className="login-screen fade-in" style={{
        height: '100vh', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', padding: '24px', background: 'white'
      }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>Recuperar Senha</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Insira seu e-mail cadastrado para receber as instruções.</p>
        </header>

        {forgotSent ? (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--accent)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Sua senha foi enviada para seu e-mail!</p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Enviar Instruções</button>
            <button 
              type="button" 
              onClick={() => setIsForgotMode(false)}
              style={{ width: '100%', marginTop: '16px', color: 'var(--text-muted)', fontWeight: '600' }}
            >
              Voltar ao Login
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="login-screen" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: 'url("/hero.png") center/cover no-repeat',
      position: 'relative'
    }}>
      <div className="overlay" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to top, rgba(17,17,17,0.95) 0%, rgba(17,17,17,0.8) 50%, rgba(17,17,17,0.4) 100%)',
        zIndex: 1
      }}></div>

      <div className="login-content fade-in" style={{ zIndex: 2, textAlign: 'center' }}>
        <div style={{ marginBottom: '40px' }}>
          <img 
            src="/logo.png" 
            alt="CIECC" 
            style={{ 
              width: '80%', 
              maxWidth: '280px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' 
            }} 
          />
        </div>

        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '8px' }}>Bem-vindo,</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Hub Digital do II Congresso CIECC</p>
        </header>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <span className="input-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Seu CPF</span>
            <div style={{ position: 'relative' }}>
              <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="000.000.000-00"
                value={loginCpf}
                onChange={(e) => setLoginCpf(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <span className="input-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Sua Senha</span>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            Acessar Hub <ArrowRight size={20} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => setIsForgotMode(true)}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', border: 'none', background: 'none' }}
            >
              Esqueci minha senha
            </button>
            <button 
              type="button" 
              onClick={onAdminAccess}
              style={{ color: 'var(--gold)', fontSize: '13px', border: 'none', background: 'none', fontWeight: 'bold' }}
            >
              Portal Admin
            </button>
          </div>
        </form>


        <footer style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Ainda não está inscrito? <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Saiba mais</span>
          </p>
          
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.08)',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end', // Alinhado à direita
            alignItems: 'center',
            gap: '12px'
          }}>
            <p style={{ 
              color: 'rgba(212, 193, 156, 0.4)', // Cores da fonte do congresso (dourado suave)
              fontSize: '10px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              fontWeight: '500' 
            }}>
              Criado por
            </p>
            {/* Logo Arkos em SVG - Cor do Congresso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 32L20 8L32 32" stroke="#D4C19C" strokeWidth="3" />
                <path d="M4 21H36" stroke="#D4C19C" strokeWidth="3" />
                <circle cx="20" cy="6" r="3" fill="#D4C19C" />
              </svg>
              <span style={{ 
                color: '#D4C19C', 
                fontSize: '15px', 
                fontWeight: '700', 
                letterSpacing: '1px',
                fontFamily: 'sans-serif'
              }}>ARKOS</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginView;
