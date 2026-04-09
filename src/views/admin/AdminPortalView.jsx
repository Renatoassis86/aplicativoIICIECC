import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Monitor, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Send,
  Plus,
  ArrowLeft,
  Settings,
  MoreVertical,
  Briefcase,
  Search,
  Download,
  Filter,
  Activity,
  UserPlus,
  FileText,
  Save,
  PlayCircle,
  BarChart3, 
  Layout, 
  Video, 
  FileSpreadsheet, 
  Bell, 
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchFeedPosts, deletePostApi } from '../../services/social/socialService';
import { events, workshops } from '../../data/agendaData';
import { addSessionMaterial, fetchSessionMaterials, deleteSessionMaterial } from '../../services/agenda/agendaService';

// CMS Modules
import HomeCMS from './modules/HomeCMS';
import MediaCMS from './modules/MediaCMS';
import ScheduleCMS from './modules/ScheduleCMS';
import UserManagementCMS from './modules/UserManagementCMS';
import SponsorsCMS from './modules/SponsorsCMS';
import TextContentCMS from './modules/TextContentCMS';
import AdminImportView from './AdminImportView';

export default function AdminPortalView({ onLogout, onBackToApp, userName, userCpf }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('home');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ attendees: 0, posts: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);
  const [emergencyText, setEmergencyText] = useState('');
  
  // Materials state
  const [selectedSessionForMaterials, setSelectedSessionForMaterials] = useState(null);
  const [sessionMaterials, setSessionMaterials] = useState([]);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { count: userCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
      const { count: postCount } = await supabase.from('social_posts').select('*', { count: 'exact', head: true });
      const { count: notifCount } = await supabase.from('system_notifications').select('*', { count: 'exact', head: true });
      
      setStats({ attendees: userCount || 0, posts: postCount || 0, notifications: notifCount || 0 });

      const feed = await fetchFeedPosts(userCpf);
      setPosts(feed);
    } catch (e) { console.error('Error loading admin data:', e); }
    setLoading(false);
  };

  const loadSessionMaterials = async (sessionId) => {
    const data = await fetchSessionMaterials(sessionId);
    setSessionMaterials(data);
  };

  const handleAddMaterial = async () => {
    if (!newMaterialTitle || !newMaterialUrl || !selectedSessionForMaterials) return;
    try {
      await addSessionMaterial(selectedSessionForMaterials.id, newMaterialTitle, newMaterialUrl);
      setNewMaterialTitle('');
      setNewMaterialUrl('');
      loadSessionMaterials(selectedSessionForMaterials.id);
      alert('Material adicionado com sucesso!');
    } catch (e) {
      alert('Erro ao adicionar: ' + e.message);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Excluir este material?')) {
      await deleteSessionMaterial(id);
      loadSessionMaterials(selectedSessionForMaterials.id);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Excluir permanentemente esta postagem?')) {
      await deletePostApi(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, color: '#6366F1' },
    { id: 'home', label: 'Editar Página Inicial', icon: <Layout size={20} />, color: '#8B5CF6' },
    { id: 'schedule', label: 'Agenda & Palestrantes', icon: <Calendar size={20} />, color: '#EC4899' },
    { id: 'media', label: 'Mídias & Transmissão', icon: <Video size={20} />, color: '#F59E0B' },
    { id: 'users', label: 'Gestão de Usuários', icon: <ShieldCheck size={20} />, color: '#10B981' },
    { id: 'sponsors', label: 'Patrocinadores', icon: <Briefcase size={20} />, color: '#8B5CF6' },
    { id: 'texts', label: 'Textos & Objetos', icon: <FileText size={20} />, color: '#6366F1' },
    { id: 'import', label: 'Importar Inscritos', icon: <FileSpreadsheet size={20} />, color: '#06B6D4' },
    { id: 'members', label: 'Lista de Membros', icon: <Users size={20} />, color: '#64748B' },
  ];

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div className="stats-grid">
             {[
               { label: 'Congressistas', value: stats.attendees, trend: '+12%', icon: <Users />, color: '#6366F1' },
               { label: 'Interações Feed', value: stats.posts * 10, trend: '+45%', icon: <ImageIcon />, color: '#10B981' },
               { label: 'Push Deliverability', value: '98.4%', trend: 'Estável', icon: <Send />, color: '#F59E0B' },
               { label: 'Active Sessions', value: '84', trend: 'Live', icon: <Activity />, color: '#EF4444' }
             ].map((stat, i) => (
               <div key={i} className="stat-card">
                 <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>{stat.icon}</div>
                 <p className="stat-label">{stat.label}</p>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <h3 className="stat-value">{stat.value}</h3>
                    <span className="stat-trend" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.trend}</span>
                 </div>
               </div>
             ))}
          </div>

          <div className="dashboard-grid">
             <div className="card-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <h4 style={{ fontWeight: '800', fontSize: '18px' }}>Log de Atividade Recente</h4>
                  <button className="link-btn">Ver Tudo</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} className="log-item">
                      <div className="log-icon">
                         <UserPlus size={18} color="#6366F1" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>Novo congressista cadastrado via QR</p>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>Há 4 minutos • VIP Silver</p>
                      </div>
                      <ChevronRight size={18} color="#CBD5E1" />
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="card-alert">
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>Broadcast de Emergência</h4>
                  <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Envie um comunicado para todos os dispositivos logados agora.</p>
                  <textarea 
                    placeholder="Digite o alerta aqui..."
                    value={emergencyText}
                    onChange={(e) => setEmergencyText(e.target.value)}
                    className="alert-textarea"
                    rows={4}
                  />
                  <button 
                    onClick={async () => {
                      if(!emergencyText) return;
                      const { error } = await supabase.from('system_notifications').insert({
                        title: 'ALERTA DASHBOARD',
                        message: emergencyText,
                        type: 'alert',
                        target_role: 'all'
                      });
                      if (error) alert('Erro ao disparar: ' + error.message);
                      else {
                        alert('Alerta disparado com sucesso!');
                        setEmergencyText('');
                        loadData();
                      }
                    }}
                    className="alert-btn">
                    <Send size={18} /> DISPARAR ALERTA
                  </button>
                </div>
                <Activity style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '150px', height: '150px', opacity: 0.05 }} />
             </div>
          </div>
        </div>
      );
    }

    switch(activeMenu) {
      case 'home': return <HomeCMS />;
      case 'media': return <MediaCMS />;
      case 'schedule': return <ScheduleCMS />;
      case 'users': return <UserManagementCMS />;
      case 'sponsors': return <SponsorsCMS />;
      case 'texts': return <TextContentCMS />;
      case 'import': return <AdminImportView onBackToApp={() => setActiveMenu('dashboard')} />;
      case 'members': return <div className="card-main"><h4>Lista de Membros (Em desenvolvimento)</h4></div>;
      default: return null;
    }
  };

  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--gold)', borderRadius: '8px', minWidth: '32px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)' }}>
            </div>
            <div className="sidebar-logo-text">
              <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: 'white', fontFamily: 'var(--font-serif)' }}>CIECC</h1>
              <p style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>ADMIN CONSOLE</p>
            </div>
            <button className="mobile-only sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <LogOut size={20} color="white" />
            </button>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { 
                setActiveMenu(item.id); 
                if (window.innerWidth <= 1024) setIsSidebarOpen(false);
              }}
              className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <div style={{ color: activeMenu === item.id ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}>
                {item.icon}
              </div>
              <span className="menu-label">{item.label}</span>
              {activeMenu === item.id && (
                <div style={{ marginLeft: 'auto', width: '4px', height: '16px', borderRadius: '4px', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }}></div>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={onBackToApp} className="footer-btn">
            <ArrowLeft size={16} /> <span className="menu-label">Ver App Mobile</span>
          </button>
          <button onClick={onLogout} className="footer-btn logout">
            <LogOut size={16} /> <span className="menu-label">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* MAIN VIEWPORT */}
      <main className="admin-main">
        
        {/* HEADER */}
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <button className="mobile-only hamburger" onClick={() => setIsSidebarOpen(true)}>
                <div style={{ width: '20px', height: '2px', background: 'white', marginBottom: '4px' }}></div>
                <div style={{ width: '15px', height: '2px', background: 'white', marginBottom: '4px' }}></div>
                <div style={{ width: '20px', height: '2px', background: 'white' }}></div>
             </button>
             <div>
                <h2 className="view-title">
                  {menuItems.find(i => i.id === activeMenu)?.label}
                </h2>
                <div className="status-bar">
                  <div className="online-indicator"></div>
                  <p className="status-text">Root Admin: <strong style={{ color: 'white' }}>{userName}</strong></p>
                </div>
             </div>
          </div>
          
          <div className="header-actions">
            <div className="search-bar">
               <Search size={18} color="rgba(255,255,255,0.4)" />
               <input placeholder="Busca global..." />
            </div>
            <button onClick={loadData} className="sync-btn">SINCRONIZAR</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content-container">
          {renderContent()}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --sidebar-width: 280px;
          --primary: #4A101D;
          --gold: #D4AF37;
          --bg-dark: #0A0F1A;
          --card-bg: rgba(255, 255, 255, 0.05);
          --border-color: rgba(255, 255, 255, 0.1);
          --font-serif: 'Playfair Display', serif;
        }

        .admin-container {
          display: flex;
          height: 100vh;
          background: var(--bg-dark);
          color: #E2E8F0;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }

        .admin-sidebar {
          width: var(--sidebar-width);
          background: #0F172A;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          transition: transform 0.3s ease, width 0.3s ease;
          z-index: 100;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
          background: radial-gradient(circle at top right, rgba(74, 16, 29, 0.15), transparent 600px);
        }

        .main-header {
          padding: 32px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(10, 15, 26, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 80;
        }

        .content-container {
          padding: 40px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--card-bg);
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-4px); border-color: var(--gold); }

        .stat-label { fontSize: 13px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .stat-value { fontSize: 32px; fontWeight: 900; color: white; letter-spacing: -1px; }
        .stat-trend { fontSize: 11px; fontWeight: 800; padding: 4px 8px; borderRadius: 6px; }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .card-main { background: var(--card-bg); border-radius: 24px; padding: 32px; border: 1px solid var(--border-color); }
        .card-alert { 
          background: linear-gradient(135deg, var(--primary) 0%, #2A080F 100%); 
          border-radius: 24px; padding: 32px; color: white; position: relative; overflow: hidden; 
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .link-btn { color: var(--gold); border: none; background: none; font-size: 13px; fontWeight: 700; cursor: pointer; }

        .log-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .log-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justifyContent: center; }

        .alert-textarea { width: 100%; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; color: #000000; margin-bottom: 16px; resize: none; outline: none; transition: border-color 0.3s; font-weight: 600; }
        .alert-textarea:focus { border-color: var(--gold); }
        .alert-btn { width: 100%; background: var(--gold); color: #000; border: none; padding: 14px; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s; }
        .alert-btn:hover { transform: scale(1.02); }

        .menu-item {
          width: 100%; display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 12px; border: none; background: transparent; color: rgba(255,255,255,0.5); font-weight: 500; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; font-size: 14px; text-align: left;
        }
        .menu-item.active { background: rgba(255,255,255,0.12); color: white; font-weight: 700; }
        .menu-item:hover:not(.active) { background: rgba(255,255,255,0.06); color: #FFF; }

        .sidebar-footer { padding: 32px 16px; border-top: 1px solid var(--border-color); }
        .footer-btn { width: 100%; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
        .footer-btn.logout { background: transparent; color: #F87171; border: none; }

        .search-bar { background: rgba(255,255,255,0.05); padding: 10px 16px; border-radius: 12px; display: flex; alignItems: center; gap: 12px; border: 1px solid var(--border-color); }
        .search-bar input { border: none; outline: none; background: transparent; font-size: 14px; width: 180px; color: white; }

        .sync-btn { background: var(--card-bg); border: 1px solid var(--border-color); color: white; padding: 10px 20px; borderRadius: 10px; fontWeight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .sync-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--gold); }

        .view-title { font-size: 28px; font-weight: 900; color: white; letter-spacing: -1px; font-family: var(--font-serif); }
        .status-bar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .online-indicator { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; box-shadow: 0 0 10px #22C55E; }
        .status-text { color: rgba(255,255,255,0.8); font-size: 13px; }

        .mobile-only { display: none; }

        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100%;
            transform: translateX(-100%);
            background: #0A0F1A;
          }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 20px 0 50px rgba(0,0,0,0.8); }
          .mobile-only { display: flex; }
          .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 90; backdrop-filter: blur(4px); }
          .dashboard-grid { grid-template-columns: 1fr; }
          .main-header { padding: 20px; }
          .content-container { padding: 20px; }
          .header-actions { display: none; }
          .sidebar-logo-text { flex: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Custom scrollbar for Dark Theme */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-dark); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

        /* Global Contrast Fix for Light Containers */
        .white-bg, .card-main, [style*="background: white"], [style*="background-color: white"] {
          background-color: #FFFFFF !important;
          color: #1A202C !important;
        }

        .white-bg h1, .white-bg h2, .white-bg h3, .white-bg h4, .card-main h1, .card-main h2, .card-main h3, .card-main h4 {
          color: #000000 !important;
          font-weight: 800 !important;
        }

        input, select, textarea {
          color: #000000 !important;
          background-color: #FFFFFF !important;
        }

        .stat-value, .view-title, .sidebar-logo-text h1 {
          color: #FFFFFF !important;
          font-weight: 900 !important;
        }
      `}} />
    </div>
  );
}
