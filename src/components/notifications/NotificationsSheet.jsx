import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, RefreshCcw, BellRing } from 'lucide-react';
import { fetchInbox, markAsRead } from '../../services/notifications/notificationService';

const NotificationsSheet = ({ userId, userRole, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarMensagens = async () => {
    setLoading(true);
    const { items } = await fetchInbox(userId, userRole);
    setNotifications(items || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarMensagens();
  }, [userId]);

  const handleRead = async (id, isCurrentlyRead) => {
    if (isCurrentlyRead) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id, userId);
  };

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      <div style={{ background: '#F7F8FA' }}>
        <header style={{ 
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
          background: 'var(--primary)', color: 'white', borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)', zIndex: 10
        }}>
          <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', border: 'none', display: 'flex' }}>
            <ArrowLeft size={24} color="white" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}>
              <BellRing size={18} color="white" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>
              Avisos
            </h3>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA', paddingBottom: '100px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.6 }}>
              <RefreshCcw size={32} color="var(--primary)" className="spin" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>Sincronizando Avisos...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', opacity: 0.7 }}>
              <Bell size={48} color="rgba(0,0,0,0.2)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: '800' }}>Nenhum recado ainda</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Quando a organização enviar algo, aparecerá aqui.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id, n.isRead)}
                style={{
                  padding: '16px 20px',
                  background: n.isRead ? 'transparent' : 'white',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex', gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ paddingTop: '6px' }}>
                  {n.isRead ? <CheckCircle size={16} color="var(--text-muted)" /> : <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E53E3E' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: n.isRead ? '600' : '800', color: n.isRead ? 'var(--text-muted)' : 'var(--secondary)', marginBottom: '4px', fontFamily: 'var(--font-serif)' }}>{n.title}</h4>
                  <p style={{ fontSize: '14px', color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)', lineHeight: '1.4' }}>{n.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSheet;
