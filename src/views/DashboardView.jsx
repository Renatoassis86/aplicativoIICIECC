import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Image,
  MoreVertical,
  Bell,
  User,
  Menu
} from 'lucide-react';

// Importando os componentes das abas
import HomeTab from './tabs/HomeTab';
import AgendaTab from './tabs/AgendaTab';
import NetworkTab from './tabs/NetworkTab';
import MediaTab from './tabs/MediaTab';
import MoreTab from './tabs/MoreTab';
import MyTicketModal from '../components/ticket/MyTicketModal';

const DashboardView = ({ onLogout, userType, userName, userCpf }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showTicketModal, setShowTicketModal] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab userName={userName} onOpenTicket={() => setShowTicketModal(true)} />;
      case 'agenda': return <AgendaTab />;
      case 'network': return <NetworkTab />;
      case 'media': return <MediaTab />;
      case 'more': return <MoreTab onLogout={onLogout} />;
      default: return <HomeTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return ''; // Home tem seu próprio header visual
      case 'agenda': return 'Agenda Geral';
      case 'network': return 'Networking';
      case 'media': return 'Feed Social';
      case 'more': return 'Ajustes e Mais';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      
      {/* Top Navigation Global (exceto na Home que tem header custom) */}
      {activeTab !== 'home' && activeTab !== 'more' && (
        <header className="top-nav-global" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 20px', 
          background: 'var(--primary)', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <img 
            src="/logo.png" 
            alt="CIECC" 
            style={{ 
              height: '35px'
            }} 
          />
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Bell size={22} color="white" />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--secondary)', fontSize: '13px' }}>
              R
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main style={{ paddingBottom: '90px' }}>
        {renderContent()}
      </main>

      {/* Improved Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span>Início</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`} 
          onClick={() => setActiveTab('agenda')}
        >
          <Calendar size={22} />
          <span>Agenda</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'network' ? 'active' : ''}`} 
          onClick={() => setActiveTab('network')}
        >
          <Users size={22} />
          <span>Network</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} 
          onClick={() => setActiveTab('media')}
        >
          <Image size={22} />
          <span>Feed</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'more' ? 'active' : ''}`} 
          onClick={() => setActiveTab('more')}
        >
          <Menu size={22} />
          <span>Mais</span>
        </button>
      </nav>

      {/* Ticket Modal Overlay */}
      {showTicketModal && (
        <MyTicketModal 
          onClose={() => setShowTicketModal(false)} 
          userName={userName}
          userCpf={userCpf}
        />
      )}
    </div>
  );
};

export default DashboardView;
