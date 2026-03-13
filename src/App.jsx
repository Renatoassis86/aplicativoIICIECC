import React, { useState } from 'react';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Home from './components/Home';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="mobile-container overflow-hidden">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div className="flex-grow flex flex-col h-full">
            {activeTab === 'home' && <Home />}
            {activeTab === 'agenda' && (
              <div className="p-20 flex flex-col items-center justify-center flex-grow text-center">
                <h1 className="text-xl">Agenda do Congresso</h1>
                <p className="mt-8">A programação completa será liberada em breve.</p>
              </div>
            )}
            {activeTab === 'content' && (
              <div className="p-20 flex flex-col items-center justify-center flex-grow text-center">
                <h1 className="text-xl">Conteúdos de Apoio</h1>
                <p className="mt-8">Materiais e artigos técnicos estarão disponíveis aqui.</p>
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="p-20 flex flex-col items-center justify-center flex-grow text-center">
                <h1 className="text-xl">Seu Perfil</h1>
                <p className="mt-8">Gerencie suas informações e certificados.</p>
              </div>
            )}
          </div>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}

      {/* Basic responsive helpers */}
      <style dangerouslySetInnerHTML={{ __html: `
        .h-full { height: 100%; }
        .overflow-hidden { overflow: hidden; }
        .mt-8 { margin-top: 8px; }
      `}} />
    </div>
  );
}

export default App;
