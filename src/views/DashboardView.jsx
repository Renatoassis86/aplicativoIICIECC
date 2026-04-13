import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  Image,
  MoreVertical,
  Bell,
  User,
  Menu,
  ArrowRight,
  ArrowLeft
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
import { useContent } from '../hooks/useContent';

const DashboardView = ({ onLogout, userType, userName, userCpf, userAvatar, onAvatarUpdate, isAdminView }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState(null); // 'ticket', 'notifications', 'faq', 'sponsors', 'map', 'gts', 'profile', 'scanner', 'broadcast', 'mediaDetail'
  const [mediaDetail, setMediaDetail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Labels dinâmicos do CMS
  const { content: menuHome } = useContent('nav', 'menu_home');
  const { content: menuAgenda } = useContent('nav', 'menu_agenda');
  const { content: menuMedia } = useContent('nav', 'menu_media');
  const { content: menuFeed } = useContent('nav', 'menu_feed');
  const { content: menuSpeakers } = useContent('nav', 'menu_speakers');

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, currentPage]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return (
        <HomeTab 
          userName={userName} 
          userType={userType} 
          userAvatar={userAvatar} 
          unreadCount={unreadCount} 
          onOpenNotifications={() => setCurrentPage('notifications')} 
          onOpenTicket={() => setCurrentPage('ticket')} 
          onOpenScanner={() => setCurrentPage('scanner')} 
          onOpenBroadcast={() => setCurrentPage('broadcast')}
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenFAQ={() => setCurrentPage('faq')}
          onOpenSponsors={() => setCurrentPage('sponsors')}
          onOpenMap={() => setCurrentPage('map')}
          onOpenProfile={() => setCurrentPage('profile')}
          onOpenMedia={(media) => {
            setMediaDetail(media);
            setCurrentPage('mediaDetail');
          }}
        />
      );
      case 'agenda': return <AgendaTab />;
      case 'network': return <NetworkTab />;
      case 'media': return (
        <OfficialMediaTab 
          onOpenMedia={(media) => {
            setMediaDetail(media);
            setCurrentPage('mediaDetail');
          }}
          userCpf={userCpf}
          userName={userName}
        />
      );
      case 'feed': return <MediaTab userType={userType} userName={userName} userCpf={userCpf} userAvatar={userAvatar} />;
      case 'speakers': return <SpeakersTab onNavigate={(tab) => setActiveTab(tab)} />;
      case 'more': return (
        <MoreTab 
          onLogout={onLogout} 
          onOpenScanner={() => setCurrentPage('scanner')}
          onOpenBroadcast={() => setCurrentPage('broadcast')}
          onOpenFAQ={() => setCurrentPage('faq')}
          onOpenSponsors={() => setCurrentPage('sponsors')}
          onOpenMap={() => setCurrentPage('map')}
          onOpenGTs={() => setCurrentPage('gts')}
          onOpenProfile={() => setCurrentPage('profile')}
          onNavigate={(tab) => { setActiveTab(tab); setCurrentPage(null); }}
          userType={userType}
        />
      );
      default: return null;
    }
  };

  const renderCurrentPage = () => {
    if (!currentPage) return null;

    const BackButton = () => (
      <button 
         onClick={() => setCurrentPage(null)}
         className="clickable"
         style={{ 
           position: 'fixed', top: 'calc(env(safe-area-inset-top, 24px) + 12px)', left: '16px', 
           zIndex: 1000000, background: 'var(--primary)', 
           padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)', display: 'flex',
           boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
         }}
      >
        <div style={{ display: 'flex' }}><ArrowLeft size={20} color="white" /></div>
      </button>
    );

    return (
      <div className="tab-content fade-in" style={{ 
        position: 'fixed', inset: 0, zIndex: 99999, background: '#F7F8FA', 
        overflowY: 'auto', paddingBottom: '20px' 
      }}>
        <BackButton />
        {currentPage === 'ticket' && <MyTicketModal userCpf={userCpf} onClose={() => setCurrentPage(null)} />}
        {currentPage === 'notifications' && (
          <NotificationsSheet 
            userId={userCpf} 
            userRole={userType} 
            onClose={() => {
              setCurrentPage(null);
              fetchInbox(userCpf, userType).then(r => setUnreadCount(r.unreadCount || 0));
            }} 
          />
        )}
        {currentPage === 'faq' && <FAQView onClose={() => setCurrentPage(null)} />}
        {currentPage === 'sponsors' && <SponsorsView onClose={() => setCurrentPage(null)} />}
        {currentPage === 'map' && <MapLocationView onClose={() => setCurrentPage(null)} />}
        {currentPage === 'gts' && <GTsView onClose={() => setCurrentPage(null)} />}
        {currentPage === 'profile' && (
          <ProfileView 
            userCpf={userCpf} 
            userName={userName} 
            userAvatar={userAvatar}
            onAvatarUpdate={onAvatarUpdate}
            onClose={() => setCurrentPage(null)} 
          />
        )}
        {currentPage === 'scanner' && <ScannerStaffView onClose={() => setCurrentPage(null)} />}
        {currentPage === 'broadcast' && <AdminBroadcastModal onClose={() => setCurrentPage(null)} />}
        {currentPage === 'mediaDetail' && mediaDetail && (
          <MediaDetailView 
            media={mediaDetail} 
            onClose={() => setCurrentPage(null)} 
            userCpf={userCpf} 
            userName={userName} 
          />
        )}
      </div>
    );
  };

  return (
    <div className={isAdminView ? "admin-wrapper" : "mobile-wrapper"}>
      <div className={isAdminView ? "" : "App"} style={{ 
        paddingBottom: (activeTab === 'home' || activeTab === 'agenda' || activeTab === 'network' || activeTab === 'feed' || activeTab === 'more') ? '90px' : '0' 
      }}>
        {renderContent()}
      </div>

      {renderCurrentPage()}

      {/* FIXED BOTTOM NAV (ULTRA ADAPTIVE) */}
      <nav className="bottom-nav">
        <button 
          onClick={() => { setActiveTab('home'); setCurrentPage(null); }} 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>{menuHome || 'INÍCIO'}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('agenda'); setCurrentPage(null); }} 
          className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>{menuAgenda || 'AGENDA'}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('media'); setCurrentPage(null); }} 
          className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
        >
          <Video size={20} />
          <span>{menuMedia || 'MÍDIA'}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('feed'); setCurrentPage(null); }} 
          className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        >
          <Image size={20} />
          <span>{menuFeed || 'CONECTAR'}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('speakers'); setCurrentPage(null); }} 
          className={`nav-item ${activeTab === 'speakers' ? 'active' : ''}`}
        >
          <Users size={20} />
          <span>{menuSpeakers || 'PALESTRAS'}</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardView;
