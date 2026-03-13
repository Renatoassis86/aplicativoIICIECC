import React from 'react';
import { Home, Calendar, Users, Camera, MoreHorizontal } from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'media', label: 'Mídia', icon: Camera },
    { id: 'more', label: 'Mais', icon: MoreHorizontal },
  ];

  return (
    <div className="nav-wrapper">
      <nav className="nav-floating">
        <div className="nav-grid">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <div className={`icon-circle ${isActive ? 'bg-primary' : 'bg-gray'}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className="nav-text">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-wrapper {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 400px;
          z-index: 1000;
          pointer-events: none;
        }

        .nav-floating {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          padding: 8px 4px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: none;
          padding: 8px 4px;
          border-radius: 16px;
          transition: all 0.2s;
        }

        .nav-btn.active {
          background-color: rgba(214, 31, 38, 0.1);
        }

        .icon-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .bg-primary { background-color: var(--primary); }
        .bg-gray { background-color: #e5e7eb; }
        
        .nav-text {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .nav-btn.active .nav-text {
          color: var(--primary);
        }

        .text-white { color: white; }
      `}} />
    </div>
  );
};

export default Navigation;
