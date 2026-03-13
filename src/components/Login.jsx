import React, { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';

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
    <div className="flex-grow flex flex-col items-center justify-center p-20 animate-fade-in">
      <div className="text-center mb-40">
        <div className="logo-placeholder mb-16 mx-auto">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg transform -rotate-3">
            II
          </div>
          <div className="text-2xl font-bold tracking-tight mt-4 text-accent">CIECC</div>
        </div>
        <h1 className="mb-8">Bem-vindo(a)</h1>
        <p className="text-secondary">Faça login para acessar o ambiente oficial do congresso.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="input-group">
          <label className="input-label">CPF</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              className="input-field pl-12"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="password"
              className="input-field pl-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-8">
          Acessar Portal <LogIn size={18} className="ml-2" />
        </button>

        <div className="mt-24 text-center">
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </form>

      <div className="mt-auto text-center text-xs text-muted pb-8">
        © 2026 Faculdade Internacional Cidade Viva
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mb-16 { margin-bottom: 16px; }
        .mb-40 { margin-bottom: 40px; }
        .mt-24 { margin-top: 24px; }
        .mb-8 { margin-bottom: 8px; }
        .mt-8 { margin-top: 8px; }
        .w-20 { width: 80px; }
        .h-20 { height: 80px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .block { display: block; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-4 { left: 16px; }
        .top-1/2 { top: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .pl-12 { padding-left: 48px; }
        .ml-2 { margin-left: 8px; }
        .logo-placeholder { position: relative; }
      `}} />
    </div>
  );
};

export default Login;
