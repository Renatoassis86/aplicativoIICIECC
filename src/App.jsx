import React, { useState } from 'react';
import './index.css';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulação de login para protótipo
  const handleLogin = (cpf, password) => {
    if (cpf && password) {
      setIsAuthenticated(true);
    }
  };

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <LoginView onLogin={handleLogin} />
      ) : (
        <DashboardView />
      )}
    </div>
  );
}

export default App;
