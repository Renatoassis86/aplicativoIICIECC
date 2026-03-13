import React from 'react';
import { Home, Calendar, BookOpen, User } from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'content', label: 'Conteúdo', icon: BookOpen },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="nav-container">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 12px 0 calc(12px + var(--safe-area-bottom));
          background: white;
          border-top: 1px solid var(--border);
          box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.05);
          position: sticky;
          bottom: 0;
          width: 100%;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          color: var(--text-muted);
          gap: 4px;
          flex: 1;
        }

        .nav-item.active {
          color: var(--primary);
        }

        .nav-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}} />
    </nav>
  );
};

export default Navigation;
