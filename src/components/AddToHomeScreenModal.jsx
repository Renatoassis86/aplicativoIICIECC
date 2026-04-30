import { useState, useEffect, useRef } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

const STORAGE_KEY = 'ciecc_a2hs_shown';

// Guarda o evento beforeinstallprompt globalmente para uso posterior
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

const AddToHomeScreenModal = ({ onDismiss }) => {
  const [os, setOs] = useState(null); // 'ios' | 'android-prompt' | 'android-manual'

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isStandalone) { onDismiss(); return; }

    if (isIos) {
      setOs('ios');
    } else if (isAndroid) {
      // Se o evento nativo está disponível, usa ele (botão direto)
      setOs(deferredPrompt ? 'android-prompt' : 'android-manual');
    } else {
      onDismiss(); // Desktop: não mostra
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    onDismiss();
  };

  if (!os) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#1A1F2E',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 44px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid rgba(212,193,156,0.2)',
        borderBottom: 'none',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="CIECC" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'contain', background: '#6B141A', padding: '6px' }} />
            <div>
              <p style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>Hub II CIECC</p>
              <p style={{ fontSize: '12px', color: '#D4C19C', margin: 0 }}>Adicione à tela inicial do seu celular</p>
            </div>
          </div>
          <button onClick={onDismiss} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="white" />
          </button>
        </div>

        {/* Android com prompt nativo — botão direto */}
        {os === 'android-prompt' && (
          <>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
              Instale o app no seu celular para acessar rapidamente o Hub do congresso, sem precisar abrir o navegador.
            </p>
            <button
              onClick={handleInstallClick}
              style={{
                width: '100%', padding: '18px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #6B141A, #4A101D)',
                border: 'none', color: '#D4C19C', fontSize: '16px',
                fontWeight: '900', cursor: 'pointer', letterSpacing: '0.5px'
              }}
            >
              Adicionar à Tela Inicial
            </button>
            <button onClick={onDismiss} style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>
              Agora não
            </button>
          </>
        )}

        {/* Android sem prompt (Chrome já instalado ou bloqueado) — instruções mínimas */}
        {os === 'android-manual' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <Step n={1} text={<>Toque nos <strong style={{color:'#D4C19C'}}>três pontos ⋮</strong> no canto superior direito do Chrome</>} />
              <Step n={2} text={<>Toque em <strong style={{color:'#D4C19C'}}>"Adicionar à tela inicial"</strong></>} />
              <Step n={3} text={<>Confirme tocando em <strong style={{color:'#D4C19C'}}>"Adicionar"</strong></>} />
            </div>
            <button onClick={onDismiss} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #6B141A, #4A101D)', border: 'none', color: '#D4C19C', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
              Entendido!
            </button>
          </>
        )}

        {/* iOS — instruções inevitáveis (Safari não tem API nativa) */}
        {os === 'ios' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <Step n={1} text={<>Toque no ícone <strong style={{color:'#D4C19C'}}>Compartilhar</strong> <Share size={14} style={{display:'inline', verticalAlign:'middle'}} color="#D4C19C"/> na barra inferior do Safari</>} />
              <Step n={2} text={<>Role para baixo e toque em <strong style={{color:'#D4C19C'}}>"Adicionar à Tela de Início"</strong> <PlusSquare size={14} style={{display:'inline', verticalAlign:'middle'}} color="#D4C19C"/></>} />
              <Step n={3} text={<>Toque em <strong style={{color:'#D4C19C'}}>"Adicionar"</strong> no canto superior direito</>} />
            </div>
            <button onClick={onDismiss} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #6B141A, #4A101D)', border: 'none', color: '#D4C19C', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
              Entendido!
            </button>
          </>
        )}
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

const Step = ({ n, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,193,156,0.15)', border: '1px solid rgba(212,193,156,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: '#D4C19C', flexShrink: 0 }}>{n}</div>
    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{text}</p>
  </div>
);

// Wrapper que controla exibição única via localStorage
const AddToHomeScreenTrigger = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (!alreadyShown) {
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
