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
        <div className="flex-grow flex flex-col h-full relative">
          <div className="flex-grow overflow-hidden">
            {activeTab === 'home' && <Home />}
            {activeTab === 'agenda' && (
              <div className="p-20 flex flex-col items-center justify-center h-full text-center bg-secondary">
                <h1 className="text-xl font-bold">Agenda CIECC</h1>
                <p className="mt-8 text-secondary">Carregando programação oficial...</p>
              </div>
            )}
            {activeTab === 'network' && (
              <div className="p-20 flex flex-col items-center justify-center h-full text-center bg-secondary">
                <h1 className="text-xl font-bold">Networking</h1>
                <p className="mt-8 text-secondary">Conecte-se com outros congressistas.</p>
              </div>
            )}
            {activeTab === 'media' && (
              <div className="p-20 flex flex-col items-center justify-center h-full text-center bg-secondary">
                <h1 className="text-xl font-bold">Mídia & Galeria</h1>
                <p className="mt-8 text-secondary">Fotos e vídeos oficiais do evento.</p>
              </div>
            )}
            {activeTab === 'more' && (
              <div className="p-20 flex flex-col items-center justify-center h-full text-center bg-secondary">
                <h1 className="text-xl font-bold">Mais Opções</h1>
                <p className="mt-8 text-secondary">Configurações, suporte e certificados.</p>
              </div>
            )}
          </div>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .h-full { height: 100%; }
        .relative { position: relative; }
        .overflow-hidden { overflow: hidden; }
        .bg-secondary { background-color: var(--bg-secondary); }
        .text-secondary { color: var(--text-secondary); }
        .mt-8 { margin-top: 8px; }
      `}} />
    </div>
  );
}

export default App;
