import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

const PasswordResetView = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
      background: 'white',
      paddingBottom: '40px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Institucional com Logo e Fundo Escuro */}
      <div style={{ 
        background: 'var(--secondary)', 
        padding: '30px 24px', 
        display: 'flex', 
        justifyContent: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '32px'
      }}>
        <img src="/logo_beige.png" alt="CIECC" style={{ height: '55px' }} />
      </div>

      <header style={{ padding: '0 24px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px' }}>
          <ShieldCheck size={20} />
          <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>
            Segurança da Conta
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', lineHeight: '1.2' }}>
          Redefina sua senha de acesso
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
          Por segurança, no seu primeiro acesso, é obrigatório trocar a senha inicial.
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <div className="input-group">
          <label className="input-label">Nova Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#CBD5E0" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Confirme a Nova Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#CBD5E0" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '20px', fontWeight: '500' }}>
            ⚠ {error}
          </p>
        )}

        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Confirmar e Entrar <ArrowRight size={20} />
        </button>
      </form>

      <footer style={{ textAlign: 'center', opacity: 0.5 }}>
        <img src="/logo_beige.png" alt="CIECC" style={{ height: '32px' }} />
      </footer>
    </div>
  );
};

export default PasswordResetView;
