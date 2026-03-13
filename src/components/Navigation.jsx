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
      <nav className="nav-academic">
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
                <div className={`icon-container ${isActive ? 'bg-primary' : 'bg-transparent'}`}>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate'} />
                </div>
                <span className="nav-text">{tab.label}</span>
                {isActive && <div className="active-dot"></div>}
              </button>
            );
          })}
        </div>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-wrapper {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 420px;
          z-index: 1000;
          pointer-events: none;
        }

        .nav-academic {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.98);
          border-top: 2px solid var(--accent); /* Elegant gold top border */
          border-radius: 4px; /* Scholarly look uses minimal rounding */
          padding: 8px 4px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .nav-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2px;
        }

        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: none;
          padding: 8px 0;
          position: relative;
          transition: all 0.2s;
          cursor: pointer;
        }

        .icon-container {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: all 0.3s;
        }

        .bg-primary { background-color: var(--primary); }
        .text-white { color: white; }
        .text-slate { color: var(--text-secondary); }

        .nav-text {
          font-size: 0.65rem;
          font-weight: 700;
          font-family: var(--font-heading); /* Serif font for nav labels too */
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .nav-btn.active .nav-text {
          color: var(--primary);
        }

        .active-dot {
          position: absolute;
          top: 0;
          width: 4px;
          height: 4px;
          background-color: var(--accent);
          border-radius: 50%;
        }
      `}} />
    </div>
  );
};

export default Navigation;
