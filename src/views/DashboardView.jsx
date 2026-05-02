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
// import MyTicketModal from '../components/ticket/MyTicketModal';

// Modais de Informação
import FAQView from './info/FAQView';
import SponsorsView from './info/SponsorsView';
import MapLocationView from './info/MapLocationView';
import NotificationsSheet from '../components/notifications/NotificationsSheet';
import GTsView from './info/GTsView';
import ScannerStaffView from './ScannerStaffView';
import AdminBroadcastModal from './admin/AdminBroadcastModal';
import ProfileView from './ProfileView';
import WorkshopsView from './info/WorkshopsView';
import MediaDetailView from './media/MediaDetailView';
import SatisfactionSurveyView from './SatisfactionSurveyView';
import { fetchInbox, initPushNotifications, subscribeToNotifications } from '../services/notifications/notificationService';
import { Video } from 'lucide-react';
import { useContent } from '../hooks/useContent';

const DashboardView = ({ onLogout, userType, userName, userCpf, userAvatar, onAvatarUpdate, isAdminView }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState(null); // 'ticket', 'notifications', 'faq', 'sponsors', 'map', 'gts', 'profile', 'scanner', 'broadcast', 'mediaDetail', 'workshops'
  const [mediaDetail, setMediaDetail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Labels dinâmicos do CMS
  const { content: menuHome } = useContent('nav', 'menu_home');
  const { content: menuAgenda } = useContent('nav', 'menu_agenda');
  const { content: menuMedia } = useContent('nav', 'menu_media');
  const { content: menuFeed } = useContent('nav', 'menu_feed');
  const { content: menuSpeakers } = useContent('nav', 'menu_speakers');

  useEffect(() => {
    initPushNotifications(userCpf);

    const syncInbox = async () => {
      const items = await fetchInbox(userCpf, userType);
      setUnreadCount((items || []).filter(n => !n.isRead).length);
    };
    syncInbox();

    // Atualiza badge em tempo real quando nova notificação chegar
    const channel = subscribeToNotifications(() => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe();
    };
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
          onOpenTicket={() => {}} // Inativo
          onOpenScanner={() => setCurrentPage('scanner')} 
          onOpenBroadcast={() => setCurrentPage('broadcast')}
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenFAQ={() => setCurrentPage('faq')}
          onOpenSponsors={() => setCurrentPage('sponsors')}
          onOpenMap={() => setCurrentPage('map')}
          onOpenProfile={() => setCurrentPage('profile')}
          onOpenWorkshops={() => setCurrentPage('workshops')}
          onOpenSurvey={() => setCurrentPage('survey')}
          onOpenMedia={(media) => {
            setMediaDetail(media);
            setCurrentPage('mediaDetail');
          }}
          userCpf={userCpf}
        />
      );
      case 'agenda': return <AgendaTab userCpf={userCpf} />;
      case 'network': return <NetworkTab onBack={() => setActiveTab('more')} />;
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
      case 'speakers': return <SpeakersTab onNavigate={(tab) => setActiveTab(tab)} onBack={() => setActiveTab('more')} />;
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
          onOpenTicket={() => {}} // Inativo
          onNavigate={(tab) => { setActiveTab(tab); setCurrentPage(null); }}
          onAvatarUpdate={onAvatarUpdate}
          userType={userType}
          userName={userName}
          userAvatar={userAvatar}
          userCpf={userCpf}
        />
      );
      default: return null;
    }
  };

  const renderCurrentPage = () => {
    if (!currentPage) return null;

    return (
      <div className="tab-content fade-in" style={{ 
        position: 'fixed', inset: 0, zIndex: 99999, background: '#F7F8FA', 
        overflowY: 'auto', paddingBottom: '20px' 
      }}>
        {/* {currentPage === 'ticket' && <MyTicketModal userCpf={userCpf} onClose={() => setCurrentPage(null)} />} */}
        {currentPage === 'notifications' && (
          <NotificationsSheet 
            userId={userCpf} 
            userRole={userType} 
            onClose={() => {
              setCurrentPage(null);
              fetchInbox(userCpf, userType).then(items => setUnreadCount((items || []).filter(n => !n.isRead).length));
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
        {currentPage === 'workshops' && (
          <WorkshopsView 
            userCpf={userCpf} 
            userName={userName} 
            onClose={() => setCurrentPage(null)} 
          />
        )}
        {currentPage === 'mediaDetail' && mediaDetail && (
          <MediaDetailView
            media={mediaDetail}
            onClose={() => setCurrentPage(null)}
            userCpf={userCpf}
            userName={userName}
          />
        )}
        {currentPage === 'survey' && (
          <SatisfactionSurveyView
            userCpf={userCpf}
            onClose={() => setCurrentPage(null)}
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
