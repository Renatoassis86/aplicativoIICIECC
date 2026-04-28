import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, CheckCircle, RefreshCcw, BellRing, User, Clock } from 'lucide-react';
import { fetchInbox, markAsRead, subscribeToNotifications } from '../../services/notifications/notificationService';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const NotificationsSheet = ({ userId, userRole, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarMensagens = useCallback(async () => {
    setLoading(true);
    const items = await fetchInbox(userId, userRole);
    setNotifications(items || []);
    setLoading(false);
  }, [userId, userRole]);

  useEffect(() => {
    carregarMensagens();

    // Auto-refresh via Realtime: nova notificação → recarrega inbox
    const channel = subscribeToNotifications(() => {
      carregarMensagens();
    });

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe();
    };
  }, [carregarMensagens]);

  const handleRead = async (id, isCurrentlyRead) => {
    if (isCurrentlyRead) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(userId, id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px',
        background: 'var(--primary)', color: 'white', borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)', zIndex: 10
      }}>
        <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex' }}>
          <ArrowLeft size={22} color="white" style={{ opacity: 0.8 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}>
            <BellRing size={18} color="white" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>
            Avisos
          </h3>
          {unreadCount > 0 && (
            <span style={{ background: '#E53E3E', color: 'white', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>
              {unreadCount} novo{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button onClick={carregarMensagens} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px', border: 'none', display: 'flex' }}>
          <RefreshCcw size={16} color="white" />
        </button>
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
                display: 'flex', gap: '14px',
                cursor: 'pointer'
              }}
            >
              {/* Indicador lido/não-lido */}
              <div style={{ paddingTop: '4px', flexShrink: 0 }}>
                {n.isRead
                  ? <CheckCircle size={16} color="var(--text-muted)" />
                  : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E53E3E', marginTop: '3px' }} />
                }
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: n.isRead ? '600' : '800',
                  color: n.isRead ? 'var(--text-muted)' : 'var(--secondary)',
                  marginBottom: '4px',
                  fontFamily: 'var(--font-serif)'
                }}>
                  {n.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: n.isRead ? 'var(--text-muted)' : 'var(--text-main)',
                  lineHeight: '1.5',
                  marginBottom: '10px'
                }}>
                  {n.message || n.body}
                </p>

                {/* Rodapé: remetente + horário */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={11} color="var(--primary)" />
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>
                      {n.sender_name || 'Organização CIECC'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsSheet;
