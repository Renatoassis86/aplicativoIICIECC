import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
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

  // Carregar estado inicial
  useEffect(() => {
    const checkPersistedAuth = async () => {
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

        if (profile.onboarding_completed) {
          setSelectedType({ id: profile.user_type }); // Simplificado para o roteamento
          setAuthStatus('logged-in');
        } else if (profile.user_type) {
          setSelectedType({ id: profile.user_type });
          setAuthStatus('questionnaire');
        } else if (profile.password_reset) {
          setAuthStatus('select-type');
        } else {
          setAuthStatus('reset-password');
        }
      } catch (e) {
        setAuthStatus('logged-out');
      }
    };

    checkPersistedAuth();
  }, []);

  const handleLogin = async (cpf, password) => {
    setAuthStatus('loading');

    // 0. Bypass Organizadores (Renato e Emanuel)
    const ORG_MASTERS = {
      '05875164450': { name: 'Renato Assis', type: 'admin' },
      '71115902440': { name: 'Emanuel', type: 'admin' }
    };

    if (ORG_MASTERS[cpf] && password === 'admin') {
      setCurrentUserCpf(cpf);
      localStorage.setItem('current_user_cpf', cpf);
      setUserName(ORG_MASTERS[cpf].name);
      setSelectedType('admin'); // String pura
      setAuthStatus('logged-in'); 
      return;
    }

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

      // 2. Verificar perfil e senha
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('cpf', cpf)
        .single();

      let currentProfile = profile;
      if (profileError || !profile) {
        // Criar perfil se não existir
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ cpf, password_reset: false }])
          .select()
          .single();
        currentProfile = newProfile;
      }

      // 3. Validar Senha
      // Se ainda não resetou (Primeiro Acesso)
      if (!currentProfile.password_reset) {
        const type = currentProfile.user_type || member.user_type;
        const isAdminType = type === 'admin' || type === 'staff' || cpf === '05875164450' || cpf === '71115902440';
        
        const expectedPassword = isAdminType ? 'admin' : 'congresso2026';

        if (password === expectedPassword) {
          setCurrentUserCpf(cpf);
          localStorage.setItem('current_user_cpf', cpf);
          setAuthStatus('reset-password');
        } else {
          alert(`Senha incorreta para o primeiro acesso. Use a senha padrão de ${isAdminType ? 'Organizador (admin)' : 'Inscrito (congresso2026)'}.`);
          setAuthStatus('logged-out');
        }
        return;
      }

      // Se já resetou, valida a senha salva no perfil
      if (password === currentProfile.current_password) {
        setCurrentUserCpf(cpf);
        localStorage.setItem('current_user_cpf', cpf);
        
        if (currentProfile.onboarding_completed || currentProfile.user_type === 'admin' || currentProfile.user_type === 'staff' || currentProfile.user_type?.includes('patrocinador')) {
          setSelectedType(currentProfile.user_type || 'admin');
          setAuthStatus('logged-in');
        } else if (currentProfile.user_type) {
          setSelectedType(currentProfile.user_type);
          setAuthStatus('questionnaire');
        } else {
          setAuthStatus('select-type');
        }
      } else {
        alert('Senha incorreta.');
        setAuthStatus('logged-out');
      }
    } catch (e) {
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
    } catch (e) {
      alert('Erro ao salvar nova senha.');
    }
  };

  const handleTypeSelect = async (type) => {
    try {
      await supabase
        .from('profiles')
        .update({ user_type: type.id })
        .eq('cpf', currentUserCpf);
      
      setSelectedType(type);
      setAuthStatus('questionnaire');
    } catch (e) {
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
    } catch (e) {
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <p style={{ color: '#D4C19C', fontFamily: 'serif', letterSpacing: '2px' }}>CARREGANDO HUB...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {authStatus === 'logged-out' && (
        <LoginView 
          onLogin={handleLogin} 
          onAdminAccess={() => setAuthStatus('admin-portal')} 
        />
      )}
      
      {authStatus === 'admin-portal' && (
        <AdminImportView onBackToApp={() => setAuthStatus('logged-out')} />
      )}
      
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
        <DashboardView 
          onLogout={handleLogout} 
          userType={typeof selectedType === 'object' ? (selectedType?.id || 'congressista') : (selectedType || 'congressista')} 
          userName={userName || 'Visitante'} 
          userCpf={currentUserCpf}
          onOpenAdminPortal={() => setView('admin-portal')}
        />
      )}

      {authStatus === 'logged-in' && view === 'admin-portal' && (
        <AdminPortalView 
          onLogout={handleLogout}
          onBackToApp={() => setView('app')}
          userName={userName}
          userCpf={currentUserCpf}
        />
      )}
    </div>
  );
}

export default App;
