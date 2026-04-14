import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const PasswordResetView = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }
    
    setError('');
    setIsSuccess(true);
    
    // Pequeno delay para mostrar o sucesso antes de entrar
    setTimeout(() => {
      onComplete(newPassword);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="reset-screen fade-in" style={{
        height: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ background: 'var(--accent)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
          <CheckCircle2 size={64} color="var(--primary)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--secondary)' }}>
          Senha Alterada!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Sua conta está segura agora. Redirecionando para o hub...
        </p>
      </div>
    );
  }

  return (
    <div className="reset-screen fade-in" style={{
      minHeight: '100vh',
      background: '#F7F8FA',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Institucional - Super Premium */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0A0F1A 0%, #1A202C 100%)', 
        padding: '50px 24px 70px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        borderBottomLeftRadius: '40px',
        borderBottomRightRadius: '40px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <img src="/logo.png" alt="CIECC" style={{ height: '70px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', opacity: 0.8 }}>
          <ShieldCheck size={16} />
          <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px' }}>
            Primeiro Acesso Seguro
          </span>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginTop: '-30px', flex: 1 }}>
        <div className="card" style={{ padding: '32px 24px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <header style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', lineHeight: '1.2', color: 'var(--secondary)' }}>
              Redefina sua senha
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
              Crie uma chave de acesso pessoal para garantir a segurança da sua conta.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>NOVA SENHA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#CBD5E0" style={{ position: 'absolute', left: '16px', top: '15px', opacity: 0.5 }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field-custom-light" 
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: '#F1F5F9', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '16px', 
                    padding: '16px 48px 16px 48px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E0' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>CONFIRME A SENHA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#CBD5E0" style={{ position: 'absolute', left: '16px', top: '15px', opacity: 0.5 }} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="input-field-custom-light" 
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: '#F1F5F9', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '16px', 
                    padding: '16px 48px 16px 48px',
                    fontSize: '15px',
                    outline: 'none'
                  }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '16px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E0' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
                <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '600' }}>
                  ⚠ {error}
                </p>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '56px', borderRadius: '16px', fontSize: '16px' }}>
              Salvar e Continuar <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '32px', opacity: 0.4 }}>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>© 2026 CIECC Hub Digital</p>
      </footer>
    </div>
  );
};

export default PasswordResetView;
