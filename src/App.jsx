import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import PasswordResetView from './views/PasswordResetView';
import UserTypeSelectionView from './views/UserTypeSelectionView';
import QuestionnaireController from './views/questionnaires/QuestionnaireController';
import AdminImportView from './views/admin/AdminImportView';
import AdminPortalView from './views/admin/AdminPortalView';

function App() {
  const [authStatus, setAuthStatus] = useState('loading'); 
  const [view, setView] = useState('app'); // 'app' ou 'admin-portal'
  const [selectedType, setSelectedType] = useState(null);
  const [currentUserCpf, setCurrentUserCpf] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  // Carregar estado inicial
  useEffect(() => {
    const checkPersistedAuth = async () => {
      // 0. Detecção de URL Admin Direta
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        setAuthStatus('admin-portal');
        return;
      }

      const savedCpf = localStorage.getItem('current_user_cpf');
      if (!savedCpf) {
        setAuthStatus('logged-out');
        return;
      }

      setCurrentUserCpf(savedCpf);
      try {
        const { data: member } = await supabase.from('members').select('name').eq('cpf', savedCpf).single();
        if (member) setUserName(member.name);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('cpf', savedCpf)
          .single();

        if (error || !profile) {
          setAuthStatus('logged-out');
          return;
        }

        const canBypassInitial = profile.onboarding_completed || 
          profile.user_type === 'organizador' || 
          profile.user_type === 'admin' || 
          profile.user_type === 'staff' || 
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
      } catch (_) {
        setAuthStatus('logged-out');
      }
    };

    checkPersistedAuth();
  }, []);

  const handleLogin = async (cpf, password) => {
    setAuthStatus('loading');

    try {
      // 1. Verificar se o membro existe
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (memberError || !member) {
        alert('CPF não encontrado na base de inscritos.');
        setAuthStatus('logged-out');
        return;
      }

      setUserName(member.name);

      // 2. Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('cpf', cpf)
        .single();

      let currentProfile = profile;
      if (profileError || !profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{ cpf, password_reset: false }])
          .select()
          .single();
        currentProfile = newProfile;
      }

      // 3. Validar Senha
      if (!currentProfile.password_reset) {
        const expectedPassword = 'congresso2026';

        if (password === expectedPassword) {
          setCurrentUserCpf(cpf);
          localStorage.setItem('current_user_cpf', cpf);
          setAuthStatus('reset-password');
        } else {
          alert(`Senha incorreta para o primeiro acesso. Use a senha padrão.`);
          setAuthStatus('logged-out');
        }
        return;
      }

      // 4. Validar Senha salva no perfil (Após reset)
      if (password === currentProfile.current_password) {
        setCurrentUserCpf(cpf);
        localStorage.setItem('current_user_cpf', cpf);
        setUserName(member.name);
        setUserAvatar(currentProfile.avatar_url);

        const type = currentProfile.user_type;
        const canBypassOnboarding = type === 'organizador' || type === 'admin' || type === 'staff' || type === 'palestrante' || type?.includes('patrocinador');

        if (currentProfile.onboarding_completed || canBypassOnboarding) {
          setSelectedType(type || 'congressista');
          setAuthStatus('logged-in');
        } else if (type) {
          setSelectedType(type);
          setAuthStatus('questionnaire');
        } else {
          setAuthStatus('select-type');
        }
      } else {
        alert('Senha incorreta.');
        setAuthStatus('logged-out');
      }
    } catch (_) {
      alert('Erro ao conectar com o servidor.');
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
        .eq('cpf', currentUserCpf)
        .select()
        .single();
      
      const type = updatedProfile?.user_type;
      const isStaffOrSponsor = type === 'admin' || type === 'staff' || type === 'palestrante' || type?.includes('patrocinador');

      if (isStaffOrSponsor) {
        setSelectedType(type || 'admin');
        setAuthStatus('logged-in');
      } else if (type) {
        setSelectedType(type);
        setAuthStatus('questionnaire');
      } else {
        setAuthStatus('select-type');
      }
    } catch (_) {
      alert('Erro ao salvar nova senha.');
    }
  };

  const handleTypeSelect = async (type) => {
    try {
      await supabase
        .from('profiles')
        .update({ user_type: type.id || type })
        .eq('cpf', currentUserCpf);
      
      setSelectedType(type.id || type);
      setAuthStatus('questionnaire');
    } catch (_) {
      alert('Erro ao salvar tipo de inscrição.');
    }
  };

  const handleQuestionnaireComplete = async (answers) => {
    try {
      // 1. Salvar as respostas literais
      await supabase
        .from('survey_responses')
        .insert([{
          user_cpf: currentUserCpf,
          survey_type: selectedType.id,
          answers: answers
        }]);

      // 2. Marcar onboarding como concluído
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('cpf', currentUserCpf);

      setAuthStatus('logged-in');
    } catch (_) {
      alert('Erro ao salvar respostas do questionário.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user_cpf');
    setAuthStatus('logged-out');
    setSelectedType(null);
    setCurrentUserCpf(null);
  };

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
        <div className={isAdminView ? "admin-wrapper" : "mobile-wrapper"}>
          <div className={isAdminView ? "" : "App"} style={{ 
            background: isAdminView ? '#0A0F1A' : '#F7F8FA', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%' 
          }}>
            
            {/* ADMIN FLOWS */}
            {authStatus === 'admin-portal' && (
              <AdminImportView onBackToApp={() => setAuthStatus('logged-out')} />
            )}
            
            {(authStatus === 'logged-in' && view === 'admin-portal') && (
              <AdminPortalView 
                onLogout={handleLogout}
                onBackToApp={() => {
                  if (selectedType === 'organizador' && window.innerWidth > 1024) {
                    setView('admin-portal');
                  } else {
                    setView('app');
                  }
                }}
                userName={userName}
                userCpf={currentUserCpf}
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
                <DashboardView 
                  onLogout={handleLogout} 
                  userType={selectedType || 'congressista'} 
                  userName={userName || 'Visitante'} 
                  userCpf={currentUserCpf}
                  userAvatar={userAvatar}
                  onAvatarUpdate={setUserAvatar}
                  onOpenAdminPortal={() => setView('admin-portal')}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .app-shell {
          background: #f0f2f5;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Desktop Portal Structure */
        @media (min-width: 1025px) {
          .desktop-portal {
            display: flex;
            width: 100%;
            min-height: 100vh;
            background: #F4F7FE;
          }
          .mobile-wrapper {
             /* No desktop, o mobile-wrapper vira um simulador opcional ou desaparece se quisermos full width */
             width: 100%;
             max-width: none; 
             margin: 0;
             box-shadow: none;
             border-radius: 0;
          }
          .app-content-wide {
             flex: 1;
             width: 100%;
             max-width: 1600px;
             margin: 0 auto;
             padding: 20px;
          }
        }

        /* Mobile Wrapper (Phone Simulation on Small Screen or explicit) */
        @media (max-width: 1024px) {
          .mobile-wrapper {
            width: 100%;
            max-width: 430px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
            position: relative;
            box-shadow: 0 0 40px rgba(0,0,0,0.1);
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
          }
        }
        @media (max-width: 430px) {
          .mobile-wrapper {
            max-width: 100%;
            box-shadow: none;
          }
        }
      `}} />
    </div>
  );
}

export default App;
