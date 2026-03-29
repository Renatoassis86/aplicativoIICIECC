import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(cpf, password);
  };

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
        {/* Logo Oficial CIECC */}
        <div style={{ marginBottom: '40px' }}>
          <img 
            src="/logo.png" 
            alt="Logo CIECC 2026" 
            style={{ 
              width: '80%', 
              maxWidth: '280px', 
              height: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
            }} 
          />
        </div>

        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            color: 'white', 
            fontFamily: 'var(--font-serif)', 
            fontSize: '28px',
            marginBottom: '8px' 
          }}>Bem-vindo,</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
            Acesse o hub digital do II Congresso CIECC
          </p>
        </header>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <span className="input-label" style={{ color: 'rgba(255,255,255,0.6)' }}>CPF</span>
            <div style={{ position: 'relative' }}>
              <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  paddingLeft: '44px'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <span className="input-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Senha</span>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  paddingLeft: '44px'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            Acessar Hub <ArrowRight size={20} />
          </button>
        </form>

        <footer style={{ marginTop: '32px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Ainda não está inscrito? <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Saiba mais</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginView;
