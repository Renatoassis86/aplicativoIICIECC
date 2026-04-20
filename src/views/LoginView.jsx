import React, { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useContent } from '../hooks/useContent';

const LoginView = ({ onLogin, onAdminAccess }) => {
  const [loginCpf, setLoginCpf] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="login-screen fade-in white-bg" style={{
        height: '100vh', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', padding: '24px', background: 'white'
      }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#1E293B' }}>Recuperar Senha</h2>
          <p style={{ color: '#475569', fontSize: '14px', fontWeight: '600' }}>Insira seu e-mail cadastrado para receber as instruções.</p>
        </header>

        {forgotSent ? (
          <div style={{ textAlign: 'center', padding: '20px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Sua senha foi enviada para seu e-mail!</p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <div className="input-group">
              <label className="input-label" style={{ color: '#475569' }}>E-mail</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{ color: '#1E293B', background: 'white' }}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ boxShadow: '0 4px 15px rgba(107, 20, 26, 0.2)' }}>Enviar Instruções</button>
            <button 
              type="button" 
              onClick={() => setIsForgotMode(false)}
              style={{ width: '100%', marginTop: '16px', color: '#64748B', fontWeight: '700' }}
            >
              Voltar ao Login
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="login-page" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 99999,
      background: '#0A0F1A'
    }}>
      <div className="login-container">
        
        {/* LEFT SIDE: Branding/Hero (Desktop Only) */}
        <div className="login-hero-side">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <img src="/logo.png" alt="CIECC" className="desktop-logo" />
            <div className="hero-text">
              <h1 className="hero-title">II CIECC 2026</h1>
              <p className="hero-subtitle">Congresso Internacional de Educação e Criatividade</p>
            </div>
            
            <div className="hero-footer">
               <div className="location-badge">São Paulo, SP</div>
               <div className="date-badge">01 e 02 de Maio</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="login-form-side">
          <div className="login-form-card fade-in">
            
            <div className="mobile-only-header">
              <img src="/logo.png" alt="CIECC" className="mobile-logo" />
            </div>

            <header style={{ marginBottom: '32px' }}>
              <h2 className="form-title">Bem-vindo,</h2>
              <p className="form-subtitle">Acesso exclusivo para congressistas</p>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <span className="input-label">Seu CPF</span>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input 
                    type="text" 
                    className="input-field-custom" 
                    placeholder="000.000.000-00"
                    value={loginCpf}
                    onChange={(e) => setLoginCpf(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Sua Senha</span>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="input-field-custom" 
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                    onTouchStart={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                    style={{ 
                      position: 'absolute', 
                      right: '0', 
                      top: '0', 
                      bottom: '0',
                      width: '48px',
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'rgba(255,255,255,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn">
                Acessar Hub <ArrowRight size={20} />
              </button>

          <div className="login-actions">
            <button 
              type="button" 
              onClick={() => setIsForgotMode(true)}
              className="action-link"
            >
              Esqueci minha senha
            </button>
          </div>
            </form>

            <footer className="form-footer">
              <p className="signup-notice">
                Ainda não está inscrito? <span className="highlight-text">Saiba mais</span>
              </p>
              
              <div className="arkos-footer">
                <p className="created-by">Criado por</p>
                <div className="arkos-brand">
                  <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 32L20 8L32 32" stroke="#D4C19C" strokeWidth="3" />
                    <path d="M4 21H36" stroke="#D4C19C" strokeWidth="3" />
                  </svg>
                  <span className="arkos-text">ARKOS</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-page {
          height: 100vh;
          width: 100vw;
          background: #0A0F1A;
          display: flex;
          overflow: hidden;
        }

        .login-container {
          display: flex;
          width: 100%;
          height: 100%;
        }

        /* Hero Side (Desktop) */
        .login-hero-side {
          flex: 1.2;
          background: url("/hero.png") center/cover no-repeat;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(107, 20, 26, 0.2) 0%, rgba(0,0,0,0.95) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
        }

        .desktop-logo {
          height: 100px;
          margin-bottom: 40px;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          color: white;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }

        .hero-subtitle {
          font-size: 20px;
          color: #D4C19C;
          font-weight: 500;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .hero-footer {
          display: flex;
          gap: 20px;
        }

        .location-badge, .date-badge {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 16px;
          border-radius: 100px;
          color: white;
          font-size: 13px;
          font-weight: 600;
        }

        /* Form Side */
        .login-form-side {
          flex: 1;
          background: #0A0F1A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .login-form-card {
          width: 100%;
          max-width: 400px;
        }

        .form-title {
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .form-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 16px;
        }

        .input-label {
          display: block;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-field-custom {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 16px 16px 16px 44px;
          color: white;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
        }

        .input-field-custom:focus {
          border-color: #0ea5e9;
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.1);
        }

        .login-submit-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          margin-top: 10px;
          box-shadow: 0 10px 20px rgba(107, 20, 26, 0.3);
        }

        .login-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(14, 165, 233, 0.2);
        }

        .login-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
        }

        .action-link {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .action-link:hover { color: #0ea5e9; }
        .admin-link { color: #0ea5e9; }

        .form-footer {
          margin-top: 60px;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 30px;
        }

        .signup-notice { color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; }
        .highlight-text { color: var(--primary); font-weight: 700; cursor: pointer; }

        .arkos-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 24px;
        }

        .created-by { color: rgba(212, 193, 156, 0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }

        .arkos-brand { display: flex; align-items: center; gap: 6px; }
        .arkos-text { color: #0ea5e9; font-size: 14px; font-weight: 800; opacity: 0.8; }

        .mobile-only-header { display: none; }

        @media (max-width: 1024px) {
          .login-hero-side { display: none; }
          .login-form-side { flex: 1; padding: 30px; background: url("/hero.png") center/cover no-repeat; }
          .login-form-side::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(10,15,26,1) 0%, rgba(10,15,26,0.95) 40%, rgba(10,15,26,0.5) 100%);
          }
          .login-form-card { position: relative; z-index: 2; }
          .mobile-only-header { display: block; text-align: center; margin-bottom: 40px; }
          .mobile-logo { height: 70px; }
          .form-title { font-size: 28px; text-align: center; }
          .form-subtitle { text-align: center; display: block; }
        }
      `}} />
    </div>
  );
};

export default LoginView;
