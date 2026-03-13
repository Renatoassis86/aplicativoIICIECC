import React, { useState } from 'react';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cpf && password) {
      onLogin();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg-texture"></div>
      <div className="login-bg-decor shadow-1"></div>
      <div className="login-bg-decor shadow-2"></div>
      
      <div className="login-card">
        <div className="classical-border"></div>
        <div className="login-header">
          <div className="brand-logo">
            <div className="column-cross">
              <span className="logo-text">II</span>
            </div>
          </div>
          <h1 className="login-title">CIECC 2026</h1>
          <p className="login-subtitle">Congresso Internacional de Educação Cristã Clássica</p>
          <div className="gold-divider"></div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field-wrapper">
            <label className="field-label">CPF / Matrícula</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                type="text"
                className="custom-input"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-field-wrapper">
            <label className="field-label">Senha de Acesso</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                className="custom-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn-classical">
            ENTRAR NO PORTAL <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <button className="forgot-link">Esqueceu sua senha?</button>
          <div className="footer-info">
            <p>FACULDADE INTERNACIONAL CIDADE VIVA</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-wrapper {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-secondary);
          position: relative;
          overflow: hidden;
        }

        .login-bg-texture {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("https://www.transparenttextures.com/patterns/parchment.png");
          pointer-events: none;
        }

        .login-bg-decor {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .shadow-1 {
          width: 400px;
          height: 400px;
          background-color: var(--primary);
          opacity: 0.15;
          top: -150px;
          right: -150px;
        }

        .shadow-2 {
          width: 300px;
          height: 300px;
          background-color: var(--accent);
          opacity: 0.1;
          bottom: -100px;
          left: -100px;
        }

        .login-card {
          width: 100%;
          max-width: 360px;
          padding: 48px 32px;
          background: white;
          border-radius: 0px; /* Academic look often uses sharper or framed corners */
          border: 1px solid var(--border);
          position: relative;
          z-index: 10;
          box-shadow: var(--shadow-lg);
        }

        .classical-border {
          position: absolute;
          inset: 8px;
          border: 1px solid var(--accent);
          opacity: 0.3;
          pointer-events: none;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .column-cross {
          width: 60px;
          height: 60px;
          background-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.5rem;
          border: 2px solid var(--accent);
          box-shadow: 0 8px 16px rgba(128, 0, 0, 0.2);
        }

        .gold-divider {
          height: 1px;
          width: 60px;
          background-color: var(--accent);
          margin: 16px auto 0;
          opacity: 0.6;
        }

        .login-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--primary);
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: 0.1em;
          font-family: var(--font-heading);
        }

        .custom-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 4px; /* Classical academia uses less aggressive rounding */
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .custom-input:focus {
          border-color: var(--accent);
          outline: none;
          background-color: white;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary);
        }

        .login-btn-classical {
          width: 100%;
          background-color: var(--primary);
          color: white;
          border: 1px solid var(--accent);
          padding: 16px;
          font-weight: 700;
          font-family: var(--font-heading);
          letter-spacing: 0.1em;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .login-btn-classical:hover {
          background-color: var(--primary-dark);
          box-shadow: 0 8px 20px rgba(128, 0, 0, 0.3);
        }

        .login-footer {
          margin-top: 32px;
          text-align: center;
        }

        .forgot-link {
          background: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }

        .footer-info {
          margin-top: 24px;
          font-size: 0.65rem;
          color: var(--text-secondary);
          letter-spacing: 0.1em;
          font-weight: 600;
        }
      `}} />
    </div>
  );
};

export default Login;
