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

// Modais de Informação
import FAQView from './info/FAQView';
import SponsorsView from './info/SponsorsView';
import MapLocationView from './info/MapLocationView';
import NotificationsSheet from '../components/notifications/NotificationsSheet';
import GTsView from './info/GTsView';
import ScannerStaffView from './ScannerStaffView';
import AdminBroadcastModal from './admin/AdminBroadcastModal';
import ProfileView from './ProfileView';
import MediaDetailView from './media/MediaDetailView';
import { fetchInbox, initPushNotifications } from '../services/notifications/notificationService';
import { Video } from 'lucide-react';

const DashboardView = ({ onLogout, userType, userName, userCpf, userAvatar, onAvatarUpdate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSponsors, setShowSponsors] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showGTs, setShowGTs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mediaDetail, setMediaDetail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. Inicializa Motores de Push Nativo (Para App Stores)
    initPushNotifications(userCpf);
    
    // 2. Traz estado atual da Inbox
    const syncInbox = async () => {
      const { unreadCount } = await fetchInbox(userCpf, userType);
      setUnreadCount(unreadCount || 0);
    };
    syncInbox();
  }, [userCpf]);

  // Auditoria de Navegação (Para diagnosticar pulos inesperados no Feed)
  useEffect(() => {
    console.log(`[Navigation Audit] Tab changed to: ${activeTab.toUpperCase()} at ${new Date().toLocaleTimeString()}`);
  }, [activeTab]);

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
          onOpenFAQ={() => setShowFAQ(true)}
          onOpenSponsors={() => setShowSponsors(true)}
          onOpenMap={() => setShowMap(true)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenMedia={(media) => setMediaDetail(media)}
        />
      );
      case 'agenda': return <AgendaTab />;
      case 'network': return <NetworkTab />;
      case 'media': return (
        <OfficialMediaTab 
          onOpenMedia={(media) => setMediaDetail(media)}
          userCpf={userCpf}
          userName={userName}
        />
      );
      case 'feed': return <MediaTab userType={userType} userName={userName} userCpf={userCpf} userAvatar={userAvatar} />;
      case 'speakers': return <SpeakersTab onNavigate={(tab) => setActiveTab(tab)} />;
      case 'more': return (
        <MoreTab 
          onLogout={onLogout} 
          userName={userName} 
          userType={userType} 
          userCpf={userCpf} 
          userAvatar={userAvatar} 
          onAvatarUpdate={onAvatarUpdate}
          onOpenProfile={() => setShowProfile(true)}
          onOpenScanner={() => setShowScanner(true)} 
          onOpenBroadcast={() => setShowBroadcast(true)} 
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenFAQ={() => setShowFAQ(true)}
          onOpenSponsors={() => setShowSponsors(true)}
          onOpenMap={() => setShowMap(true)}
          onOpenGTs={() => setShowGTs(true)}
          onOpenTicket={() => setShowTicketModal(true)}
        />
      );
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
    <div className="tab-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }}>
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
          <span>HUB VIP</span>
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
          userRole={userType}
          onClose={() => {
            setShowNotifications(false);
            fetchInbox(userCpf, userType).then(r => setUnreadCount(r.unreadCount || 0));
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

      {showBroadcast && (userType === 'staff' || userType === 'admin' || userType === 'organizador' || userType?.includes('patrocinador')) && (
        <AdminBroadcastModal 
          staffCpf={userCpf} 
          userName={userName}
          onClose={() => setShowBroadcast(false)} 
        />
      )}

      {showProfile && (
        <ProfileView 
          onClose={() => {
            setShowProfile(false);
            setActiveTab('more');
          }}
          userName={userName}
          userCpf={userCpf}
          userType={userType}
          userAvatar={userAvatar}
          onAvatarUpdate={onAvatarUpdate}
        />
      )}

      {/* Modais de Informação Adicional */}
      {showFAQ && <FAQView onClose={() => setShowFAQ(false)} />}
      {showSponsors && <SponsorsView onClose={() => setShowSponsors(false)} />}
      {showMap && <MapLocationView onClose={() => setShowMap(false)} />}
      {showGTs && <GTsView onClose={() => setShowGTs(false)} />}

      {mediaDetail && (
        <MediaDetailView 
          media={mediaDetail} 
          onClose={() => setMediaDetail(null)} 
          userCpf={userCpf} 
          userName={userName} 
        />
      )}
    </div>
  );
};

export default DashboardView;
