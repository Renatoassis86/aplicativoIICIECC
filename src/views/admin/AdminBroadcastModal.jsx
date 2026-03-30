import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Send, BellRing, AlertCircle } from 'lucide-react';

export default function AdminBroadcastModal({ onClose, staffCpf, userName }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all'); // all, staff, sponsors
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setStatus(null);

    try {
      const { error } = await supabase.from('broadcasts').insert({
        title: title.trim(),
        sender_name: userName || 'Equipe CIECC', 
        message: message.trim(),
        sender_id: staffCpf,
        target_role: audience
      });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end'
    }}>
      <div style={{
        background: 'white', width: '100%',
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        padding: '24px', paddingBottom: '40px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#FDF2F2', padding: '8px', borderRadius: '50%' }}>
              <BellRing size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>
              Disparo Oficial
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none' }}>
            <X size={24} color="var(--text-muted)" />
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
             <div style={{ width: '60px', height: '60px', background: '#F0FFF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               <Send size={30} color="#38A169" />
             </div>
             <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--secondary)' }}>Enviado!</h4>
             <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>A notificação chegará apitando no celular de todos os congressistas.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <AlertCircle size={18} color="#C53030" style={{ flexShrink: 0, marginTop: '2px' }} />
               <p style={{ fontSize: '11px', color: '#9B2C2C', lineHeight: '1.4', fontWeight: '500' }}>
                 Aviso: Essa mensagem irá gerar um PUSH NATIVO no celular de todos os participantes cadastrados e badalará o ícone de sino deles com o contador vermelho.
               </p>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px', display: 'block' }}>Quem deve receber?</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'sponsors', label: 'Patrocinadores' },
                  { id: 'staff', label: 'Equipe Interna' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAudience(opt.id)}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      background: audience === opt.id ? '#6B141A' : '#f0f0f0',
                      color: audience === opt.id ? 'white' : 'var(--text-muted)',
                      border: 'none', transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px', display: 'block' }}>Título Breve</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sala Plenária Alterada"
                maxLength={40}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  border: '1px solid var(--border)', fontSize: '14px',
                  background: '#F8F9FA'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px', display: 'block' }}>Mensagem Completa (Detalhes)</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva as diretrizes claras aos congressistas..."
                rows={4}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  border: '1px solid var(--border)', fontSize: '14px',
                  background: '#F8F9FA', resize: 'none'
                }}
              />
            </div>

              {status === 'error' && (
                <div style={{ background: '#FFF5F5', padding: '10px', borderRadius: '8px', border: '1px solid #FEB2B2' }}>
                  <p style={{ color: '#C53030', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>
                    Sincronização mal-sucedida. Verifique sua conexão ou as permissões administrativas no Supabase.
                  </p>
                </div>
              )}

            <button 
              onClick={handleSend}
              disabled={isSending || !title.trim() || !message.trim()}
              className="btn-primary"
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                marginTop: '8px', opacity: (isSending || !title.trim() || !message.trim()) ? 0.5 : 1
              }}
            >
              <BellRing size={20} />
              {isSending ? 'Sincronizando...' : 'Disparar Alarme Global'}
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
}
