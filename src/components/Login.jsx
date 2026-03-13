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
      <div className="login-bg-decor"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="brand-icon">
            <span>II</span>
          </div>
          <h1 className="login-title">CIECC 2026</h1>
          <p className="login-subtitle">Congresso Internacional de Educação Cristã Clássica</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field-wrapper">
            <label className="field-label">CPF</label>
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
            <label className="field-label">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                className="custom-input"
                placeholder="Sua senha cadastrada"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn">
            Acessar Aplicativo <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <button className="forgot-link">Esqueceu sua senha?</button>
          <div className="footer-info">
            <p>© 2026 Cidade Viva Education</p>
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

        .login-bg-decor {
          position: absolute;
          width: 300px;
          height: 300px;
          background-color: var(--primary);
          opacity: 0.1;
          filter: blur(80px);
          top: -100px;
          right: -100px;
          border-radius: 50%;
        }

        .login-card {
          width: 100%;
          max-width: 360px;
          padding: 40px 24px;
          background: white;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
          position: relative;
          z-index: 10;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-icon {
          width: 64px;
          height: 64px;
          background-color: var(--primary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: white;
          font-weight: 800;
          font-size: 1.5rem;
          transform: rotate(-3deg);
          box-shadow: 0 10px 15px -3px rgba(214, 31, 38, 0.3);
        }

        .login-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--accent);
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .input-field-wrapper {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }

        .input-with-icon {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .custom-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 16px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .custom-input:focus {
          border-color: var(--primary);
          background-color: white;
          box-shadow: 0 0 0 4px rgba(214, 31, 38, 0.05);
        }

        .login-btn {
          width: 100%;
          background-color: var(--primary);
          color: white;
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 8px;
          box-shadow: 0 10px 15px -3px rgba(214, 31, 38, 0.2);
        }

        .login-btn:active {
          transform: scale(0.98);
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .forgot-link {
          background: none;
          color: var(--primary);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .footer-info {
          margin-top: 24px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}} />
    </div>
  );
};

export default Login;
