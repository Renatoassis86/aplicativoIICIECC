import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Home } from 'lucide-react';

const STORAGE_KEY = 'ciecc_a2hs_shown';

const AddToHomeScreenModal = ({ onDismiss }) => {
  const [os, setOs] = useState(null); // 'ios' | 'android' | null

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    // Se já está instalado como PWA, não mostra
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) { onDismiss(); return; }
    if (isIos) setOs('ios');
    else if (isAndroid) setOs('android');
    else onDismiss(); // Desktop: não mostra
  }, []);

  if (!os) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      padding: '0 0 env(safe-area-inset-bottom, 0px) 0'
    }}>
      <div style={{
        background: '#1A1F2E',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid rgba(212,193,156,0.2)',
        borderBottom: 'none',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="CIECC" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'contain', background: '#6B141A', padding: '6px' }} />
            <div>
              <p style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>Adicione ao seu celular</p>
              <p style={{ fontSize: '12px', color: '#D4C19C', margin: 0 }}>Acesse o Hub II CIECC como um app</p>
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="white" />
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {os === 'ios' ? (
            <>
              <Step n={1} icon={<Share size={18} color="#D4C19C" />} text={<>Toque no botão <strong style={{color:'#D4C19C'}}>Compartilhar</strong> (ícone de seta para cima) na barra do Safari</>} />
              <Step n={2} icon={<PlusSquare size={18} color="#D4C19C" />} text={<>Role e toque em <strong style={{color:'#D4C19C'}}>"Adicionar à Tela de Início"</strong></>} />
              <Step n={3} icon={<Home size={18} color="#D4C19C" />} text={<>Toque em <strong style={{color:'#D4C19C'}}>"Adicionar"</strong> e pronto!</>} />
            </>
          ) : (
            <>
              <Step n={1} icon={<MoreVertical size={18} color="#D4C19C" />} text={<>Toque nos <strong style={{color:'#D4C19C'}}>três pontos</strong> (⋮) no canto superior direito do Chrome</>} />
              <Step n={2} icon={<PlusSquare size={18} color="#D4C19C" />} text={<>Toque em <strong style={{color:'#D4C19C'}}>"Adicionar à tela inicial"</strong></>} />
              <Step n={3} icon={<Home size={18} color="#D4C19C" />} text={<>Confirme tocando em <strong style={{color:'#D4C19C'}}>"Adicionar"</strong></>} />
            </>
          )}
        </div>

        <button
          onClick={onDismiss}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6B141A, #4A101D)',
            border: 'none', color: '#D4C19C', fontSize: '15px',
            fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px'
          }}
        >
          Entendido!
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const Step = ({ n, icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,193,156,0.15)', border: '1px solid rgba(212,193,156,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: '#D4C19C' }}>{n}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon}
      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{text}</p>
    </div>
  </div>
);

// Wrapper que controla exibição única via localStorage
const AddToHomeScreenTrigger = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (!alreadyShown) {
      // Pequeno delay para não aparecer imediatamente ao logar
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  if (!show) return null;
  return <AddToHomeScreenModal onDismiss={handleDismiss} />;
};

export default AddToHomeScreenTrigger;
