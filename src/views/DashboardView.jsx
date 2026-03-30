import React, { useState, useEffect } from 'react';
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
import OfficialMediaTab from './tabs/OfficialMediaTab';
import MediaTab from './tabs/MediaTab'; // Feed Social
import MoreTab from './tabs/MoreTab';
import SpeakersTab from './tabs/SpeakersTab';
import MyTicketModal from '../components/ticket/MyTicketModal';
import NotificationsSheet from '../components/notifications/NotificationsSheet';
import ScannerStaffView from './ScannerStaffView';
import AdminBroadcastModal from './admin/AdminBroadcastModal';
import { fetchInbox, initPushNotifications } from '../services/notifications/notificationService';
import { Video } from 'lucide-react';

const DashboardView = ({ onLogout, userType, userName, userCpf, userAvatar, onOpenAdminPortal }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. Inicializa Motores de Push Nativo (Para App Stores)
    initPushNotifications(userCpf);
    
    // 2. Traz estado atual da Inbox
    const syncInbox = async () => {
      const { unreadCount } = await fetchInbox(userCpf);
      setUnreadCount(unreadCount);
    };
    syncInbox();
  }, [userCpf]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return (
        <HomeTab 
          userName={userName} 
          userType={userType} 
          userAvatar={userAvatar} 
          unreadCount={unreadCount} 
          onOpenNotifications={() => setShowNotifications(true)} 
          onOpenTicket={() => setShowTicketModal(true)} 
          onOpenScanner={() => setShowScanner(true)} 
          onOpenBroadcast={() => setShowBroadcast(true)}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      );
      case 'agenda': return <AgendaTab />;
      case 'network': return <NetworkTab />;
      case 'media': return <OfficialMediaTab />;
      case 'feed': return <MediaTab userType={userType} userName={userName} userCpf={userCpf} userAvatar={userAvatar} />;
      case 'speakers': return <SpeakersTab onNavigate={(tab) => setActiveTab(tab)} />;
      case 'more': return <MoreTab onLogout={onLogout} userName={userName} userType={userType} userCpf={userCpf} userAvatar={userAvatar} onOpenScanner={() => setShowScanner(true)} onOpenBroadcast={() => setShowBroadcast(true)} onOpenAdminPortal={onOpenAdminPortal} onNavigate={(tab) => setActiveTab(tab)} />;
      default: return <HomeTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return ''; // Home tem seu próprio header visual
      case 'agenda': return 'Agenda Geral';
      case 'network': return 'Networking';
      case 'media': return 'CIECC Mídia';
      case 'feed': return 'Feed Social';
      case 'more': return 'Ajustes e Mais';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      
      {/* Top Navigation Global (exceto na Home e Mídia que tem header custom) */}
      {activeTab !== 'home' && activeTab !== 'media' && (
        <header className="top-nav-global" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '24px 20px 16px', 
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
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowNotifications(true)} 
              style={{ background: 'none', border: 'none', padding: '4px', position: 'relative' }}
            >
              <Bell size={22} color="white" />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: '0px', right: '0px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#E53E3E', color: 'white',
                  fontSize: '10px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--primary)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('more')} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px', borderRadius: '8px' }}
            >
              <Menu size={22} color="white" />
            </button>
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
          className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} 
          onClick={() => setActiveTab('media')}
        >
          <Video size={22} />
          <span>Mídia</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`} 
          onClick={() => setActiveTab('feed')}
        >
          <Image size={22} />
          <span>Feed</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'speakers' ? 'active' : ''}`} 
          onClick={() => setActiveTab('speakers')}
        >
          <Users size={22} />
          <span>Palestrantes</span>
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

      {/* Notifications Inbox (In-App Push) */}
      {showNotifications && (
        <NotificationsSheet 
          userId={userCpf}
          onClose={() => {
            setShowNotifications(false);
            fetchInbox(userCpf).then(r => setUnreadCount(r.unreadCount));
          }}
        />
      )}

      {/* Staff QR Scanner */}
      {showScanner && (userType === 'staff' || userType === 'admin') && (
        <ScannerStaffView 
          staffCpf={userCpf} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {showBroadcast && (userType === 'staff' || userType === 'admin' || userType === 'organizador') && (
        <AdminBroadcastModal 
          staffCpf={userCpf} 
          userName={userName}
          onClose={() => setShowBroadcast(false)} 
        />
      )}
    </div>
  );
};

export default DashboardView;
