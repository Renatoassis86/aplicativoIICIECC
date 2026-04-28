import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, AlertTriangle, CheckCircle, ShieldAlert, WifiOff, MapPin, Calendar, Building2, User } from 'lucide-react';
import { fetchUserTicket } from '../../services/tickets/ticketService';
import { supabase } from '../../lib/supabase';

const MyTicketModal = ({ onClose, userName, userCpf }) => {
  const [ticketData, setTicketData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch Ticket
        const tData = await fetchUserTicket(userCpf || '12345678900');
        setTicketData(tData);

        // Fetch Profile for Badge Info
        const { data: profile } = await supabase.from('profiles').select('job_title, avatar_url').eq('user_id', userCpf).single();
        const { data: member } = await supabase.from('members').select('institution').eq('cpf', userCpf).single();
        
        setProfileData({
          jobTitle: profile?.job_title || 'Congressista',
          institution: member?.institution || 'II CIECC 2026',
          avatar: profile?.avatar_url
        });
      } catch (err) {
        console.error("Error loading ticket/profile data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [userCpf]);

  const renderBadgeContent = () => {
    if (loading) {
      return (
        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
           <div style={{ width: '40px', height: '40px', border: '3px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
           <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)', fontSize: '13px', letterSpacing: '2px' }}>PREPARANDO CREDENCIAL...</p>
        </div>
      );
    }

    if (!ticketData || ticketData.status === 'error') {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <WifiOff size={48} color="#E53E3E" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '8px' }}>Erro de Sincronização</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Verifique sua conexão para carregar o QR Code oficial.</p>
        </div>
      );
    }

    // Badge Aesthetic
    return (
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Lanyard Hole Visual */}
        <div style={{ 
          width: '50px', height: '14px', background: '#222', borderRadius: '20px', 
          marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' 
        }}></div>

        {/* User Badge Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
           <h2 style={{ 
             fontSize: '26px', fontWeight: '900', color: 'white', 
             fontFamily: 'var(--font-serif)', lineHeight: '1.2', marginBottom: '6px',
             textTransform: 'uppercase'
           }}>
             {userName}
           </h2>
           <p style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
             {profileData?.jobTitle}
           </p>
           <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontStyle: 'italic' }}>
             {profileData?.institution}
           </p>
        </div>

        {/* QR Code Container with physical card look */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          position: 'relative',
          marginBottom: '32px',
          border: '4px solid #F1F1F1'
        }}>
          {ticketData?.ticket_id ? (
            <QRCode 
              value={ticketData.ticket_id} 
              size={180}
              level="H"
              fgColor="var(--primary)"
              bgColor="#FFFFFF"
            />
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <AlertTriangle size={40} color="var(--gold)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '800' }}>ID NÃO LOCALIZADO</p>
            </div>
          )}
          {/* Animated verify line */}
          <div style={{ 
            position: 'absolute', top: '24px', left: '24px', right: '24px', height: '2px', 
            background: 'var(--gold)', opacity: 0.5, boxShadow: '0 0 10px var(--gold)',
            animation: 'scanLine 3s infinite ease-in-out'
          }}></div>
        </div>

        {/* Access Category Badge */}
        <div style={{ 
          background: ticketData.ticket_type?.toLowerCase().includes('vip') ? 'var(--gold)' : 'rgba(255,255,255,0.1)', 
          color: ticketData.ticket_type?.toLowerCase().includes('vip') ? 'var(--primary)' : 'white',
          padding: '10px 24px', borderRadius: '50px', fontWeight: '900', fontSize: '14px',
          textTransform: 'uppercase', letterSpacing: '2px', border: '1px solid rgba(212,193,156,0.3)',
          marginBottom: '20px'
        }}>
          {ticketData.ticket_type}
        </div>

        {/* ID Branding */}
        <div style={{ textAlign: 'center', opacity: 0.6 }}>
           <p style={{ fontSize: '11px', color: 'white', fontFamily: 'monospace', letterSpacing: '2px' }}>
             ID: {ticketData.ticket_id.split('-').pop()}
           </p>
        </div>

        {/* Live Counter for Security */}
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
           <p style={{ fontSize: '20px', fontWeight: '400', color: 'white', fontFamily: 'monospace' }}>
             {time.toLocaleTimeString('pt-BR')}
           </p>
           <p style={{ fontSize: '9px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
             Validação em tempo real garantida
           </p>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes scanLine { 
            0% { transform: translateY(0); }
            50% { transform: translateY(180px); }
            100% { transform: translateY(0); }
          }
        `}} />
      </div>
    );
  };

  return (
    <div className="fixed-modal-overlay" style={{ background: 'var(--primary)', overflowY: 'auto' }}>
      <div className="modal-wrapper" style={{ minHeight: '100%', background: 'var(--primary)', paddingBottom: '40px' }}>
        
        {/* Minimal Header */}
        <header style={{ 
          padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 10px', 
          display: 'flex', 
          alignItems: 'center', 
          zIndex: 10
        }}>
           <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '12px' }}>
             <ArrowLeft size={24} color="white" />
           </button>
           <div style={{ flex: 1, textAlign: 'center', marginRight: '44px' }}>
              <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '2px', fontWeight: '800' }}>CREDENCIAL DIGITAL</p>
           </div>
        </header>

        {/* Badge Card Wrapper */}
        <div style={{ padding: '30px 20px' }}>
          <div style={{
            background: 'var(--primary)',
            borderRadius: '40px',
            padding: '40px 30px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            border: '2px solid rgba(212, 193, 156, 0.4)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* CIECC Hologram Logo */}
            <div style={{ position: 'absolute', top: '30px', left: '30px', opacity: 0.1, pointerEvents: 'none' }}>
              <img src="/logo.png" style={{ height: '80px', filter: 'grayscale(1) invert(1)' }} />
            </div>

            {/* Event Logo Top */}
            <img src="/logo.png" alt="CIECC" style={{ height: '32px', marginBottom: '10px' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '1px' }}>
              II CIECC • CONGRESSO INTERNACIONAL
            </p>

            {renderBadgeContent()}

            {/* Bottom Logistics Info */}
            <div style={{ 
              marginTop: '40px', pt: '24px', borderTop: '1px dashed rgba(255,255,255,0.1)', 
              width: '100%', display: 'flex', justifyContent: 'center', gap: '20px' 
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--gold)" />
                  <span style={{ fontSize: '11px', color: 'white', fontWeight: '600' }}>01-02 MAIO</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--gold)" />
                  <span style={{ fontSize: '11px', color: 'white', fontWeight: '600' }}>SÃO PAULO</span>
               </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
             <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
               Apresente esta credencial digital nos pontos de acesso para leitura via QR Code. <br/>
               <strong>Uso pessoal e intransferível.</strong>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTicketModal;
