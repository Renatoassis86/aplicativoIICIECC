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
  Briefcase
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchFeedPosts, deletePostApi } from '../../services/social/socialService';

export default function AdminPortalView({ onLogout, onBackToApp, userName, userCpf }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ attendees: 0, posts: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // 1. Stats
    const { count: userCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
    const { count: postCount } = await supabase.from('social_posts').select('*', { count: 'exact', head: true });
    const { count: notifCount } = await supabase.from('system_notifications').select('*', { count: 'exact', head: true });
    
    setStats({ attendees: userCount || 0, posts: postCount || 0, notifications: notifCount || 0 });

    // 2. Posts for moderation
    const feed = await fetchFeedPosts(userCpf);
    setPosts(feed);
    setLoading(false);
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Excluir permanentemente esta postagem?')) {
      await deletePostApi(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#F4F7F6',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1A202C'
    }}>
      
      {/* Sidebar Desktop */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--primary)', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <img src="/logo.png" alt="CIECC" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
            <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px' }}>STAFF HUB</h1>
          </div>
          <p style={{ fontSize: '12px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Portal de Gestão v2.0</p>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'agenda', label: 'Programação (Agenda)', icon: <Calendar size={20} /> },
            { id: 'moderation', label: 'Moderação Feed', icon: <ImageIcon size={20} /> },
            { id: 'sponsors', label: 'Patrocinadores', icon: <Briefcase size={20} /> },
            { id: 'notifications', label: 'Disparos Push', icon: <Send size={20} /> },
            { id: 'attendees', label: 'Congressistas', icon: <Users size={20} /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 20px', borderRadius: '12px', border: 'none',
                background: activeMenu === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeMenu === item.id ? 'var(--gold)' : 'white',
                fontWeight: activeMenu === item.id ? '700' : '500',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '4px',
                fontSize: '14px'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
             onClick={onBackToApp}
             style={{ 
               width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
               background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none',
               padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px'
             }}>
            <ArrowLeft size={18} /> Ver como Congressista
          </button>
          <button 
             onClick={onLogout}
             style={{ 
               width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
               background: 'transparent', color: '#FEB2B2', border: 'none',
               padding: '12px', borderRadius: '8px', cursor: 'pointer'
             }}>
            <LogOut size={18} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
        
        {/* Header Superior */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
              {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
            </h2>
            <p style={{ color: '#718096', marginTop: '4px' }}>Logado como: <strong>{userName}</strong> (Organização)</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={loadData} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #CBD5E0', background: 'white', fontWeight: '600' }}>Atualizar Dados</button>
            <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', width: 'auto' }}><Plus size={20} /> Novo Lançamento</button>
          </div>
        </header>

        {activeMenu === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
             {[
               { label: 'Inscritos Reais', value: stats.attendees, icon: <Users />, color: '#3182CE' },
               { label: 'Postagens Sociais', value: stats.posts, icon: <ImageIcon />, color: '#38A169' },
               { label: 'Push Enviados', value: stats.notifications, icon: <Send />, color: 'var(--primary)' },
               { label: 'Check-ins Hoje', value: '412', icon: <CheckCircle />, color: 'var(--gold)' }
             ].map((stat, i) => (
               <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                 <div style={{ background: `${stat.color}15`, color: stat.color, padding: '16px', borderRadius: '16px' }}>{stat.icon}</div>
                 <div>
                   <p style={{ fontSize: '14px', color: '#718096', fontWeight: '600' }}>{stat.label}</p>
                   <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--secondary)' }}>{stat.value}</h3>
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeMenu === 'moderation' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F8F9FA' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#718096' }}>Sponsor / Autor</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#718096' }}>Legenda / Preview</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#718096' }}>Data</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#718096' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #EDF2F7' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{post.sponsorAvatar}</div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '14px' }}>{post.sponsorName}</p>
                          <p style={{ fontSize: '11px', color: '#A0AEC0' }}>{post.sponsorRole}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '14px', maxWidth: '300px' }}>
                       <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.caption}</p>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '13px', color: '#718096' }}>{post.timeAgo}</td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                         <button onClick={() => handleDeletePost(post.id)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#FFF5F5', color: '#E53E3E', cursor: 'pointer' }}><Trash2 size={16} /></button>
                         <button style={{ padding: '8px', borderRadius: '8px', border: 'none', background: '#F8F9FA', color: '#4A5568', cursor: 'pointer' }}><Settings size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mensagem Organizadores Interna */}
        {activeMenu === 'notifications' && (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
              <div className="card" style={{ padding: '32px' }}>
                 <h4 style={{ marginBottom: '24px', fontWeight: '800' }}>Disparar Novo Alarme</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Target Audience</label>
                      <select style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #CBD5E0' }}>
                        <option>Todos os Inscritos</option>
                        <option>Apenas Patrocinadores</option>
                        <option>Alinhamento Interno (Apenas Equipe)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Título para o PUSH</label>
                      <input placeholder="Ex: Mudança de Sala Urgente" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #CBD5E0' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Mensagem Detalhada</label>
                      <textarea rows={5} placeholder="Descreva o comunicado..." style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #CBD5E0' }} />
                    </div>
                    <button className="btn-primary" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Send size={20} /> Disparar Mensagem Global
                    </button>
                 </div>
              </div>
              <div className="card" style={{ background: '#2D3748', color: 'white' }}>
                 <h4 style={{ fontWeight: '800', marginBottom: '20px' }}>Status das Campanhas</h4>
                 <p style={{ fontSize: '13px', opacity: 0.7, lineHeight: '1.6' }}>Último disparo: 14:02<br/>Taxa de Abertura: 84%<br/>Canal: Capacitor / FCM</p>
                 <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold)' }}>DICA</p>
                    <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Mensagens curtas (até 40 caracteres) têm 3x mais clique na barra de notificações do Android.</p>
                 </div>
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
