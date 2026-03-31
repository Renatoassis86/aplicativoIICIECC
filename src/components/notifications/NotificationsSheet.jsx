import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, RefreshCcw, BellRing } from 'lucide-react';
import { fetchInbox, markAsRead } from '../../services/notifications/notificationService';

/**
 * Interface Deslizante da Central de Mensagens (Notificações)
 * Aqui o congressista vê todos os recados/comunicados globais disparados via Push pela Organização.
 */
const NotificationsSheet = ({ userId, userRole, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inicializa a lista e as contas nativas do Supabase
  const carregarMensagens = async () => {
    setLoading(true);
    const { items } = await fetchInbox(userId, userRole);
    setNotifications(items || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarMensagens();
  }, [userId]);

  // Marca individualmente e abre (poderia abrir um modal detalhado)
  const handleRead = async (id, isCurrentlyRead) => {
    if (isCurrentlyRead) return; // Ja lido

    // Atualiza Otimista
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    // Processamento real
    await markAsRead(id, userId);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'white', zIndex: 9999, // Fica sobre absolutamente tudo
      display: 'flex', flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>

      {/* Header Fixo de Notificações */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)',
        background: 'var(--bg-app)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellRing size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>
            Central de Avisos
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: '4px' }}>
          <X size={24} color="var(--text-main)" />
        </button>
      </header>

      {/* Lista de Mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#F8F9FA' }}>

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
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              {/* Marcador Visual Bolinha */}
              <div style={{ paddingTop: '6px' }}>
                {n.isRead ? (
                  <CheckCircle size={16} color="var(--text-muted)" />
                ) : (
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E53E3E' }} />
                )}
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1 }}>
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
                  lineHeight: '1.4'
                }}>
                  {n.body}
                </p>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Organização Oficial • {new Date(n.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default NotificationsSheet;
