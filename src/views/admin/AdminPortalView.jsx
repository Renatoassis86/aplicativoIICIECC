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
  UserPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchFeedPosts, deletePostApi } from '../../services/social/socialService';

export default function AdminPortalView({ onLogout, onBackToApp, userName, userCpf }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ attendees: 0, posts: 0, notifications: 0 });
  const [loading, setLoading] = useState(true);
  const [emergencyText, setEmergencyText] = useState('');

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

  const handleDeletePost = async (id) => {
    if (window.confirm('Excluir permanentemente esta postagem?')) {
      await deletePostApi(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'agenda', label: 'Gestão de Agenda', icon: <Calendar size={20} /> },
    { id: 'moderation', label: 'Moderação de Feed', icon: <ImageIcon size={20} /> },
    { id: 'sponsors', label: 'Painel de Patrocinadores', icon: <Briefcase size={20} /> },
    { id: 'notifications', label: 'Central de Push', icon: <Send size={20} /> },
    { id: 'attendees', label: 'Lista de Congressistas', icon: <Users size={20} /> },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#F1F3F9',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#1E293B'
    }}>
      
      {/* SIDEBAR - PREMIUM DARK */}
      <aside style={{ 
        width: '280px', 
        background: '#0F172A', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '10px 0 30px rgba(0,0,0,0.05)',
        zIndex: 50
      }}>
        <div style={{ padding: '40px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <img src="/logo.png" alt="" style={{ height: '24px', filter: 'brightness(0)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>CIECC</h1>
              <p style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>ADMIN CONSOLE</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px' }}>
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px', borderRadius: '12px', border: 'none',
                background: activeMenu === item.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeMenu === item.id ? 'white' : '#64748B',
                fontWeight: activeMenu === item.id ? '700' : '500',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '8px',
                fontSize: '14px'
              }}
            >
              <div style={{ 
                color: activeMenu === item.id ? 'var(--gold)' : 'inherit',
                transition: 'color 0.3s'
              }}>
                {item.icon}
              </div>
              {item.label}
              {activeMenu === item.id && (
                <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }}></div>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '32px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
             onClick={onBackToApp}
             style={{ 
               width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
               background: 'rgba(255,255,255,0.03)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.05)',
               padding: '14px', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', fontSize: '13px', fontWeight: '600'
             }}>
            <ArrowLeft size={16} /> Ver App Mobile
          </button>
          <button 
             onClick={onLogout}
             style={{ 
               width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
               background: 'transparent', color: '#F87171', border: 'none',
               padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'
             }}>
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 60px' }}>
        
        {/* TOP BAR / GREETING */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-1px' }}>
              {menuItems.find(i => i.id === activeMenu)?.label}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div style={{ width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }}></div>
              <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Terminal Ativo: <strong>{userName}</strong> (Root Admin)</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ background: 'white', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
               <Search size={18} color="#94A3B8" />
               <input placeholder="Busca global..." style={{ border: 'none', outline: 'none', fontSize: '14px', width: '200px' }} />
            </div>
            <button onClick={loadData} style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>SINCRONIZAR</button>
          </div>
        </header>

        {/* CONTENT SWITCHER */}
        {activeMenu === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
               {[
                 { label: 'Congressistas', value: stats.attendees, trend: '+12%', icon: <Users />, color: '#6366F1' },
                 { label: 'Interações Feed', value: stats.posts * 10, trend: '+45%', icon: <ImageIcon />, color: '#10B981' },
                 { label: 'Push Deliverability', value: '98.4%', trend: 'Estável', icon: <Send />, color: '#F59E0B' },
                 { label: 'Active Sessions', value: '84', trend: 'Live', icon: <Activity />, color: '#EF4444' }
               ].map((stat, i) => (
                 <div key={i} style={{ 
                    background: 'white', padding: '24px', borderRadius: '24px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)',
                    position: 'relative', overflow: 'hidden'
                 }}>
                   <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.1 }}>{stat.icon}</div>
                   <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{stat.label}</p>
                   <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                      <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{stat.value}</h3>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: stat.color, background: `${stat.color}15`, padding: '4px 8px', borderRadius: '6px', marginBottom: '6px' }}>{stat.trend}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
               <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h4 style={{ fontWeight: '800', fontSize: '18px' }}>Log de Atividade Recente</h4>
                    <button style={{ color: '#6366F1', border: 'none', background: 'none', fontSize: '13px', fontWeight: '700' }}>Ver Tudo</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', background: '#F8FAFC' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <UserPlus size={18} color="#6366F1" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '700' }}>Novo congressista cadastrado via QR</p>
                          <p style={{ fontSize: '12px', color: '#64748B' }}>Há 4 minutos • VIP Silver</p>
                        </div>
                        <ChevronRight size={18} color="#CBD5E1" />
                      </div>
                    ))}
                  </div>
               </div>
               
               <div style={{ background: 'var(--primary)', borderRadius: '24px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>Broadcast de Emergência</h4>
                    <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '24px' }}>Envie um comunicado para todos os dispositivos logados agora.</p>
                    <textarea 
                      placeholder="Digite o alerta aqui..."
                      value={emergencyText}
                      onChange={(e) => setEmergencyText(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', color: 'white', fontSize: '14px', marginBottom: '16px', resize: 'none' }}
                      rows={4}
                    />
                    <button 
                      onClick={async () => {
                        if(!emergencyText) return;
                        const { error } = await supabase.from('system_notifications').insert({
                          title: 'ALERTA DASHBOARD',
                          message: emergencyText,
                          type: 'alert'
                        });
                        if (error) alert('Erro ao disparar: ' + error.message);
                        else {
                          alert('Alerta disparado com sucesso!');
                          setEmergencyText('');
                          loadData();
                        }
                      }}
                      style={{ width: '100%', background: 'var(--gold)', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Send size={18} /> DISPARAR ALERTA
                    </button>
                  </div>
                  <Activity style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '150px', height: '150px', opacity: 0.05 }} />
               </div>
            </div>
          </div>
        )}

        {/* MODERACAO TAB - ULTRA CLEAN TABLE */}
        {activeMenu === 'moderation' && (
          <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <button style={{ padding: '8px 16px', borderRadius: '8px', background: '#F1F5F9', border: 'none', fontSize: '13px', fontWeight: '700' }}>Pendentes</button>
                 <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Aprovados</button>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <button style={{ padding: '8px', borderRadius: '8px', background: 'white', border: '1px solid #E2E8F0' }}><Filter size={16} /></button>
                 <button style={{ padding: '8px', borderRadius: '8px', background: 'white', border: '1px solid #E2E8F0' }}><Download size={16} /></button>
               </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 32px', fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Autor</th>
                  <th style={{ padding: '16px 32px', fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Conteúdo</th>
                  <th style={{ padding: '16px 32px', fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 32px', fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '100px', textAlign: 'center', color: '#94A3B8' }}>Nenhuma postagem pendente para moderação</td></tr>
                ) : posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gold)20', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{post.sponsorAvatar}</div>
                        <div>
                          <p style={{ fontWeight: '800', fontSize: '14px' }}>{post.sponsorName}</p>
                          <p style={{ fontSize: '11px', color: '#94A3B8' }}>{post.timeAgo}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 32px', maxWidth: '400px' }}>
                       <p style={{ fontSize: '14px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.caption}</p>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                       <span style={{ padding: '6px 12px', borderRadius: '20px', background: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: '800' }}>EM ANÁLISE</span>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ background: '#DCFCE7', color: '#166534', border: 'none', padding: '8px', borderRadius: '10px' }}><CheckCircle size={18} /></button>
                          <button onClick={() => handleDeletePost(post.id)} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '8px', borderRadius: '10px' }}><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* GLOBAL STYLES FOR ADMIN HUB */}
      <style dangerouslySetInnerHTML={{__html: `
        .table-row-hover:hover { background: #F8FAFC; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; borderRadius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}} />
    </div>
  );
}

const ChevronRight = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
