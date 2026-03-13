import React, { useState } from 'react';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Agenda from './components/Agenda';
import Network from './components/Network';
import Media from './components/Media';
import More from './components/More';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  return (
    <div className="mobile-container overflow-hidden">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex-grow flex flex-col h-full relative overflow-hidden bg-secondary">
          <div className="flex-grow overflow-hidden">
            {activeTab === 'home' && <Home />}
            {activeTab === 'agenda' && <Agenda />}
            {activeTab === 'network' && <Network />}
            {activeTab === 'media' && <Media />}
            {activeTab === 'more' && <More onLogout={handleLogout} />}
          </div>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .h-full { height: 100%; }
        .relative { position: relative; }
        .overflow-hidden { overflow: hidden; }
        .bg-secondary { background-color: var(--bg-secondary); }
      `}} />
    </div>
  );
}

export default App;
