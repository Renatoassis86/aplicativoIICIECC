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
import FileManagementCMS from './modules/FileManagementCMS';
import AdminImportView from './AdminImportView';
import MembersListCMS from './modules/MembersListCMS';

export default function AdminPortalView({ onLogout, onBackToApp, userName, userCpf }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('home');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ attendees: 0, posts: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);
  const [emergencyText, setEmergencyText] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all');
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
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, color: '#D4C19C' },
    { id: 'home', label: 'Editar Página Inicial', icon: <Layout size={20} />, color: '#D4C19C' },
    { id: 'schedule', label: 'Agenda & Palestrantes', icon: <Calendar size={20} />, color: '#D4C19C' },
    { id: 'media', label: 'Mídias & Transmissão', icon: <Video size={20} />, color: '#D4C19C' },
    { id: 'users', label: 'Gestão de Usuários', icon: <ShieldCheck size={20} />, color: '#D4C19C' },
    { id: 'sponsors', label: 'Patrocinadores', icon: <Briefcase size={20} />, color: '#D4C19C' },
    { id: 'texts', label: 'Textos & Objetos', icon: <FileText size={20} />, color: '#D4C19C' },
    { id: 'import', label: 'Importar Inscritos', icon: <FileSpreadsheet size={20} />, color: '#D4C19C' },
    { id: 'members', label: 'Lista de Membros', icon: <Users size={20} />, color: '#D4C19C' },
  ];

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div className="stats-grid">
             {[
               { label: 'Congressistas', value: stats.attendees, trend: '+12%', icon: <Users />, color: '#D4C19C' },
               { label: 'Interações Feed', value: stats.posts * 10, trend: '+45%', icon: <ImageIcon />, color: '#D4C19C' },
               { label: 'Push Deliverability', value: '98.4%', trend: 'Estável', icon: <Send />, color: '#D4C19C' },
               { label: 'Active Sessions', value: '84', trend: 'Live', icon: <Activity />, color: '#D4C19C' }
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
                         <UserPlus size={18} color="#D4C19C" />
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
                   <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Envie um comunicado oficial segmentado agora.</p>
                   
                   <div style={{ marginBottom: '16px' }}>
                     <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Título do Alerta</label>
                     <input 
                       placeholder="Ex: Mudança de Sala..."
                       value={broadcastTitle}
                       onChange={(e) => setBroadcastTitle(e.target.value)}
                       style={{ width: '100%', background: '#fff', border: 'none', borderRadius: '10px', padding: '12px 16px', color: '#000', fontWeight: '700', fontSize: '14px' }}
                     />
                   </div>

                   <div style={{ marginBottom: '16px' }}>
                     <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Público Alvo</label>
                     <div style={{ display: 'flex', gap: '8px' }}>
                       {[
                         { id: 'all', label: 'Todos' },
                         { id: 'staff', label: 'Equipe/Staff' },
                         { id: 'sponsors', label: 'Patrocinadores' }
                       ].map(opt => (
                         <button 
                           key={opt.id}
                           onClick={() => setBroadcastAudience(opt.id)}
                           style={{ 
                             flex: 1, padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)',
                             background: broadcastAudience === opt.id ? 'var(--brand)' : 'rgba(0,0,0,0.2)',
                             color: '#fff'
                           }}
                         >
                           {opt.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div style={{ marginBottom: '24px' }}>
                     <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>Conteúdo da Mensagem</label>
                     <textarea 
                       placeholder="Digite o alerta aqui..."
                       value={emergencyText}
                       onChange={(e) => setEmergencyText(e.target.value)}
                       className="alert-textarea"
                       rows={3}
                       style={{ marginBottom: 0 }}
                     />
                   </div>

                   <button 
                     onClick={async () => {
                       if(!emergencyText || !broadcastTitle) {
                         alert('Por favor, preencha o título e o conteúdo.');
                         return;
                       }
                       const { error } = await supabase.from('system_notifications').insert({
                         title: broadcastTitle,
                         message: emergencyText,
                         type: 'alert',
                         target_role: broadcastAudience
                       });
                       if (error) alert('Erro ao disparar: ' + error.message);
                       else {
                         alert('Alerta disparado com sucesso!');
                         setEmergencyText('');
                         setBroadcastTitle('');
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
      case 'members': return <MembersListCMS />;
      default: return null;
    }
  };

  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '32px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="CIECC" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
            <div>
              <h1 style={{ color: 'white', fontSize: '15px', fontWeight: '900', letterSpacing: '1px' }}>CIECC Console</h1>
              <p style={{ color: 'var(--gold)', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Digital Hub Control</p>
            </div>
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
              <div style={{ color: activeMenu === item.id ? 'var(--brand)' : 'rgba(255,255,255,0.4)' }}>
                {item.icon}
              </div>
              <span className="menu-label">{item.label}</span>
              {activeMenu === item.id && (
                <div style={{ marginLeft: 'auto', width: '4px', height: '16px', borderRadius: '4px', background: 'var(--brand)', boxShadow: '0 0 10px var(--brand)' }}></div>
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
        <header className="topbar" style={{ 
          background: 'rgba(255,255,255,0.02)', 
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Dashboard / {activeMenu.toUpperCase()}</h2>
            <h3 style={{ fontSize: '20px', color: 'white', fontWeight: '900' }}>II CIECC 2026 Digital Hub</h3>
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
          --primary: #6B141A; /* Burgundy */
          --primary-glow: rgba(107, 20, 26, 0.4);
          --secondary: #1e293b; 
          --bg-dark: #0A0A0A; 
          --card-bg: rgba(25, 25, 25, 0.7); 
          --border-color: rgba(255, 255, 255, 0.08); 
          --text-main: #f8fafc; 
          --text-muted: #94a3b8; 
          --brand: #D4C19C; /* Gold */
          --gold: #D4C19C;
          --success: #10b981;
          --font-sans: 'Outfit', sans-serif;
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
          background: linear-gradient(180deg, #4A101D 0%, #6B141A 100%);
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
          background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 600px);
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
        .stat-card:hover { transform: translateY(-4px); border-color: var(--brand); }

        .stat-label { fontSize: 13px; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
        .stat-value { fontSize: 32px; fontWeight: 900; color: white; letter-spacing: -1px; }
        .stat-trend { fontSize: 11px; fontWeight: 800; padding: 4px 8px; borderRadius: 6px; }

        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .card-main { 
          background: var(--card-bg); 
          border-radius: 24px; 
          padding: 32px; 
          border: 1px solid var(--border-color);
          backdrop-filter: blur(10px);
        }
        .card-alert { 
          background: linear-gradient(180deg, #4A101D 0%, #6B141A 100%); 
          border-radius: 24px; padding: 32px; color: white; position: relative; overflow: hidden; 
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        .link-btn { color: var(--brand); border: none; background: none; font-size: 13px; fontWeight: 700; cursor: pointer; }

        .log-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.03); margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .log-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justifyContent: center; }

        .alert-textarea { width: 100%; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; color: #000000; margin-bottom: 16px; resize: none; outline: none; transition: border-color 0.3s; font-weight: 600; }
        .alert-btn { width: 100%; background: var(--brand); color: #FFF; border: none; padding: 14px; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s; }
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
        .sync-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--brand); }

        .view-title { font-size: 28px; font-weight: 900; color: white; letter-spacing: -1px; }
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
        ::-webkit-scrollbar-thumb:hover { background: var(--brand); }

        /* Global Theme Consistency */
        .white-bg, .card-main {
          background-color: var(--card-bg) !important;
          color: #FFFFFF !important;
          border: 1px solid var(--border-color) !important;
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
