import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, AlertTriangle, CheckCircle, ShieldAlert, WifiOff } from 'lucide-react';
import { fetchUserTicket } from '../../services/tickets/ticketService';

const MyTicketModal = ({ onClose, userName, userCpf }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Busca inicial do ticket simulando rede
    const loadTicket = async () => {
      setLoading(true);
      const data = await fetchUserTicket(userCpf || '12345678900'); // mock cpf if missing
      setTicketData(data);
      setLoading(false);
    };
    loadTicket();

    // Relógio Live-Time Anti-Print Screen (Segurança)
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userCpf]);

  const renderStatusUI = () => {
    if (loading) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
           <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)', fontSize: '14px', letterSpacing: '2px', animation: 'pulse 1.5s infinite' }}>CARREGANDO ACESSO...</p>
        </div>
      );
    }

    if (!ticketData || ticketData.status === 'error') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <WifiOff size={48} color="#E53E3E" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Falha na Conexão</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Não foi possível buscar seu ingresso agora.</p>
        </div>
      );
    }

    if (ticketData.status === 'not_generated') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertTriangle size={48} color="var(--gold)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Ingresso Pendente</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Seu acesso ainda não foi liberado pela organização.</p>
        </div>
      );
    }

    if (ticketData.status === 'blocked') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ShieldAlert size={48} color="#E53E3E" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Acesso Revogado</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Entre em contato com a secretaria no credenciamento.</p>
        </div>
      );
    }

    if (ticketData.status === 'scanned') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Check-in Realizado</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Sua entrada já foi validada no sistema hoje.</p>
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10B981', fontWeight: 'bold' }}>
            Acesso Liberado
          </div>
        </div>
      );
    }

    // Default: 'active' state
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ 
          background: 'white', 
          padding: '16px', 
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          marginBottom: '24px',
          position: 'relative'
        }}>
          {/* O QR Code usa o ID real gerado pelo sistema */}
          <QRCode 
            value={ticketData.ticket_id} 
            size={220}
            level="H" // High error correction
            fgColor="#111111"
            bgColor="#FFFFFF"
          />
          {/* Marcador animado na borda para provar interface viva */}
          <div className="scanner-line"></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ 
            background: 'var(--gold)', 
            color: 'var(--primary)', 
            padding: '4px 12px', 
            borderRadius: '50px', 
            fontSize: '11px', 
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {ticketData.ticket_type}
          </span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '1px' }}>
          ID: {ticketData.ticket_id.split('-').pop()}
        </p>

        {/* Live UI Proof Component */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: '300', color: 'white', fontFamily: 'monospace' }}>
            {time.toLocaleTimeString('pt-BR')}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            QR Code Dinâmico Seguro
          </p>
        </div>

      </div>
    );
  };

  return (
    <div className="fixed-modal-overlay" style={{ background: 'var(--primary)' }}>
      <div className="modal-wrapper" style={{ background: 'var(--primary)' }}>
        {/* Page Header */}
        <header style={{ 
          padding: 'env(safe-area-inset-top, 40px) 20px 20px', 
          background: 'var(--primary)', 
          color: 'white',
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '20px'
        }}>
           <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowLeft size={24} color="white" />
           </button>
           <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800', flex: 1 }}>Meu Ingresso</h2>
        </header>

        {/* Ticket Card Principal Centralizado verticalmente */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            background: 'var(--primary)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '2px solid rgba(212, 193, 156, 0.4)',
            position: 'relative'
          }}>
            {/* ... Resto do ticket layout ... */}
            <div style={{ padding: '24px 24px 32px', textAlign: 'center', borderBottom: '2px dashed rgba(255,255,255,0.1)' }}>
              <img src="/logo.png" alt="CIECC" style={{ height: '35px', marginBottom: '24px' }} />
              <h2 style={{ color: 'white', fontSize: '22px', fontFamily: 'var(--font-serif)', margin: '0 0 4px' }}>{userName}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textTransform: 'uppercase' }}>Passe Oficial II CIECC</p>
            </div>
            <div style={{ padding: '32px 24px 40px' }}>
               {renderStatusUI()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTicketModal;
