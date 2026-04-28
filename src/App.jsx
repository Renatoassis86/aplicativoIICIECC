import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import PasswordResetView from './views/PasswordResetView';
import UserTypeSelectionView from './views/UserTypeSelectionView';
import QuestionnaireController from './views/questionnaires/QuestionnaireController';
import AdminImportView from './views/admin/AdminImportView';
import AdminPortalView from './views/admin/AdminPortalView';
import { logService } from './services/logService';
import { fetchUserTicket } from './services/tickets/ticketService';

import './App.css';

function App() {
  const [authStatus, setAuthStatus] = useState('loading'); 
  const [view, setView] = useState('app'); // 'app' ou 'admin-portal'
  const [selectedType, setSelectedType] = useState(null);
  const [currentUserCpf, setCurrentUserCpf] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [errorState, setErrorState] = useState(null);

  // Global Error Listeners
  useEffect(() => {
    const handleUnhandledError = (event) => {
      logService.error(event.message || 'Erro de Janela não tratado', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      }, 'WindowGlobal');
    };

    const handlePromiseRejection = (event) => {
      logService.error('Promise Rejection não tratada', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
      }, 'PromiseGlobal');
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // Carregar estado inicial
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("[App] Iniciando verificação de roteamento e autenticação...");
    
    const checkPersistedAuth = async () => {
      try {
        // 1. PRIORIDADE: Detecção de URL (Admin vs App)
        const urlParams = new URLSearchParams(window.location.search);
        const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
        const isAdminForced = urlParams.get('admin') === 'true';

        if (isPathAdmin || isAdminForced) {
          console.log("[App] Modo administrativo detectado na URL.");
        }

        const savedCpf = localStorage.getItem('current_user_cpf');
        if (!savedCpf) {
          console.log("[App] Nenhum CPF salvo. Login necessário.");
          setAuthStatus('logged-out');
          return;
        }


        console.log("[App] CPF salvo encontrado:", savedCpf);
        setCurrentUserCpf(savedCpf);
        
        const { data: member } = await supabase.from('members').select('name').eq('cpf', savedCpf).single();
        if (member) setUserName(member.name);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', savedCpf)
          .single();

        if (!profile) {
          console.log("[App] Perfil não encontrado para o CPF salvo.");
          setAuthStatus('logged-out');
          return;
        }

        setUser({ ...profile, name: member.name });
        
        // SEGURANÇA: Se for admin/organizador, NÃO permite login automático
        if (['organizador', 'admin', 'staff', 'master'].includes(profile.user_type)) {
          console.log("[App] Persistência negada para Admin. Login obrigatório.");
          setAuthStatus('logged-out');
          return;
        }

        console.log("[App] Login automático para congressista:", member.name);
        setAuthStatus('logged-in');

        // Fluxo Normal (App Mobile)
        const canBypassInitial = profile.onboarding_completed || 
          ['organizador', 'admin', 'staff'].includes(profile.user_type) || 
          profile.user_type?.includes('patrocinador');

        if (canBypassInitial) {
          setSelectedType(profile.user_type || 'congressista');
          setUserAvatar(profile.avatar_url);
          setAuthStatus('logged-in');
        } else if (profile.user_type) {
          setSelectedType(profile.user_type);
          setUserAvatar(profile.avatar_url);
          setAuthStatus('questionnaire');
        } else if (profile.password_reset) {
          setAuthStatus('select-type');
        } else {
          setAuthStatus('reset-password');
        }
      } catch (err) {
        console.error("[App] Erro fatal na inicialização:", err);
        setAuthStatus('logged-out');
      }
    };

    checkPersistedAuth();
  }, []); // Alterado para [] para evitar loop infinito de re-renderização

  if (errorState) {
    return <div style={{ padding: 20, color: 'red' }}>Erro ao carregar o aplicativo: {errorState}</div>;
  }

  const checkOnboardingAlreadyDone = async (cpf, typeId) => {
    try {
      const { data: responses } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('user_cpf', cpf)
        .eq('survey_type', typeId)
        .limit(1);

      if (responses && responses.length > 0) {
        console.log("[App] Usuário já respondeu o formulário anteriormente. Ignorando onboarding.");
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', cpf);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("[App] Falha ao checar histórico de formulário:", err);
      return false;
    }
  };

  const handleLogin = async (rawCpf, password) => {
    const cpf = rawCpf.trim().toLowerCase();
    setAuthStatus('loading');

    try {
      const { data, error } = await supabase.rpc('authenticate_member', {
        p_cpf: cpf,
        p_password: password
      });

      if (error || !data) {
        throw new Error(error?.message || 'Erro ao conectar');
      }

      if (!data.success) {
        alert(data.message || 'Credenciais inválidas.');
        setAuthStatus('logged-out');
        return;
      }

      // Sucesso na autenticação
      const { status, name, user_type, avatar_url, onboarding_completed } = data;
      
      setCurrentUserCpf(cpf);
      localStorage.setItem('current_user_cpf', cpf);
      setUserName(name);

      if (status === 'reset-password') {
        setAuthStatus('reset-password');
        return;
      }

      setUserAvatar(avatar_url);
      const isUrlAdmin = window.location.pathname.toLowerCase().includes('/admin');
      const canBypassOnboarding = ['organizador', 'admin', 'staff', 'master', 'palestrante'].includes(user_type) || user_type?.includes('patrocinador');

      if (onboarding_completed || canBypassOnboarding) {
        setSelectedType(user_type || 'congressista');
        setView(canBypassOnboarding && isUrlAdmin ? 'admin-portal' : 'app');
        setAuthStatus('logged-in');
      } else if (user_type) {
        const alreadyDone = await checkOnboardingAlreadyDone(cpf, user_type);
        if (alreadyDone) {
          setSelectedType(user_type);
          setView('app');
          setAuthStatus('logged-in');
        } else {
          setSelectedType(user_type);
          setView('app');
          setAuthStatus('questionnaire');
        }
      } else {
        setView('app');
        setAuthStatus('select-type');
      }
    } catch (err) {
      console.error("[Login] Erro:", err);
      alert('Erro ao conectar com o servidor: ' + err.message);
      setAuthStatus('logged-out');
    }
  };


  const handlePasswordResetComplete = async (newPassword) => {
    try {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({
          password_reset: true,
          current_password: newPassword
        })
        .eq('user_id', currentUserCpf)
        .select()
        .single();
      
      const type = updatedProfile?.user_type;
      const onboardingDone = updatedProfile?.onboarding_completed;
      const isStaffOrSponsor = ['organizador', 'admin', 'staff', 'master', 'palestrante'].includes(type) || type?.includes('patrocinador');

      if (isStaffOrSponsor || onboardingDone) {
        setSelectedType(type || 'congressista');
        setUserAvatar(updatedProfile?.avatar_url || null);
        const isUrlAdmin = window.location.pathname.toLowerCase().includes('/admin');
        if (isStaffOrSponsor && isUrlAdmin) setView('admin-portal');
        setAuthStatus('logged-in');
      } else if (type) {
        // NOVO: Verificar se já respondeu o questionário após o reset
        const alreadyDone = await checkOnboardingAlreadyDone(currentUserCpf, type);
        if (alreadyDone) {
          setSelectedType(type);
          setAuthStatus('logged-in');
        } else {
          setSelectedType(type);
          setAuthStatus('questionnaire');
        }
      } else {
        setAuthStatus('select-type');
      }
    } catch (_) {
      alert('Erro ao salvar nova senha.');
    }
  };

  const handleTypeSelect = async (type) => {
    try {
      const typeId = type.id || type;
      await supabase
        .from('profiles')
        .update({ user_type: typeId })
        .eq('user_id', currentUserCpf);
      
      setSelectedType(typeId);

      // NOVO: Antes de abrir o questionário, verifica se já respondeu para este tipo
      const alreadyDone = await checkOnboardingAlreadyDone(currentUserCpf, typeId);
      if (alreadyDone) {
        setAuthStatus('logged-in');
      } else {
        setAuthStatus('questionnaire');
      }
    } catch (_) {
      alert('Erro ao salvar tipo de inscrição.');
    }
  };

  const handleQuestionnaireComplete = async (answers) => {
    try {
      const surveyType = typeof selectedType === 'object' ? selectedType?.id : selectedType;

      await supabase
        .from('survey_responses')
        .insert([{
          user_cpf: currentUserCpf,
          survey_type: surveyType || 'unknown',
          answers: answers || {}
        }]);

      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', currentUserCpf);

      // GARANTE EMISSÃO DO INGRESSO IMEDIATAMENTE APÓS QUESTIONÁRIO
      console.log("[App] Questionário concluído. Gerando ingresso para:", currentUserCpf);
      await fetchUserTicket(currentUserCpf);

      setView('app');
      setAuthStatus('logged-in');
    } catch (_) {
      setView('app');
      setAuthStatus('logged-in');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user_cpf');
    setAuthStatus('logged-out');
    setSelectedType(null);
    setCurrentUserCpf(null);
  };

// ErrorBoundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    logService.error(error.message || 'Erro de Renderização', {
        stack: error.stack,
        info: errorInfo
    }, 'ErrorBoundary');
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#6B141A', marginBottom: '20px' }}>Ocorreu um erro no Hub</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>{this.state.error?.message || 'Erro de renderização'}</p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: '12px 24px', background: '#6B141A', color: '#fff', border: 'none', borderRadius: '8px' }}
          >
            Resetar App e Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

  if (authStatus === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <img src="/logo.png" alt="" style={{ height: '60px', marginBottom: '24px', opacity: 0.8, filter: 'grayscale(1) invert(1)' }} />
        <p style={{ color: '#D4C19C', fontFamily: 'serif', letterSpacing: '2px', fontSize: '10px' }}>CARREGANDO HUB...</p>
      </div>
    );
  }

  const isAdminView = authStatus === 'admin-portal' || view === 'admin-portal';

  return (
    <div className="app-shell" style={{ background: isAdminView ? '#0A0F1A' : '#f0f2f5' }}>
      {authStatus === 'logged-out' ? (
        /* PATH 0: RESPONSIVE LOGIN (DETECTION HAPPENS INSIDE LOGINVIEW) */
        <LoginView 
          onLogin={handleLogin} 
          onAdminAccess={() => setAuthStatus('admin-portal')} 
        />
      ) : (
        /* PATH 1 & 2 DYNAMIC: RESPONSIVE PORTAL vs MOBILE APP */
      <ErrorBoundary>
        <div className={isAdminView ? "admin-wrapper" : "mobile-wrapper"}>
          <div className={isAdminView ? "" : "App"} style={{ 
            background: isAdminView ? '#0A0F1A' : '#F7F8FA', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%' 
          }}>
            
            {/* ADMIN FLOWS */}
            
            {(authStatus === 'logged-in' && view === 'admin-portal' && ['organizador', 'admin', 'staff'].includes(selectedType)) && (
              <AdminPortalView 
                onLogout={handleLogout}
                onBackToApp={() => setView('app')}
                userName={userName}
                userCpf={currentUserCpf}
                userType={selectedType}
              />
            )}

            {/* USER FLOWS */}
            {authStatus === 'reset-password' && (
              <PasswordResetView onComplete={handlePasswordResetComplete} />
            )}

            {authStatus === 'select-type' && (
              <UserTypeSelectionView onSelect={handleTypeSelect} />
            )}

            {authStatus === 'questionnaire' && (
              <QuestionnaireController userType={selectedType} onComplete={handleQuestionnaireComplete} />
            )}
            
            {authStatus === 'logged-in' && view === 'app' && (
              <div className={window.innerWidth > 1024 ? "app-content-wide" : ""}>
                {currentUserCpf ? (
                  <DashboardView 
                    onLogout={handleLogout} 
                    userType={selectedType || 'congressista'} 
                    userName={userName || 'Visitante'} 
                    userCpf={currentUserCpf}
                    userAvatar={userAvatar}
                    onAvatarUpdate={setUserAvatar}
                    onOpenAdminPortal={() => setView('admin-portal')}
                    isAdminView={isAdminView}
                  />
                ) : (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <p>Sua sessão expirou. Faça login novamente.</p>
                    <button onClick={handleLogout} style={{ marginTop: 20 }}>Voltar ao Login</button>
                  </div>
                )}
              </div>
            )}

            {/* Fallback: nunca deixar tela branca em estado inesperado */}
            {authStatus !== 'loading' &&
             authStatus !== 'logged-out' &&
             authStatus !== 'admin-portal' &&
             authStatus !== 'reset-password' &&
             authStatus !== 'select-type' &&
             authStatus !== 'questionnaire' &&
             authStatus !== 'logged-in' && (
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <p style={{ color: '#666' }}>Estado inesperado. Tente novamente.</p>
                <button onClick={handleLogout} style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}>Voltar ao Login</button>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
      )}

    </div>
  );
}

export default App;
