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
      const { error } = await supabase.from('system_notifications').insert({
        title: title.trim(),
        message: message.trim(),
        target_role: audience 
      });
      if (error) throw error;
      setStatus('success');
      setTimeout(() => { onClose(); }, 2000);
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed-modal-overlay">
      <div className="modal-wrapper" style={{ background: '#F7F8FA' }}>
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: 'env(safe-area-inset-top, 24px) 20px 20px', background: 'white', borderBottom: '1px solid var(--border)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#FDF2F2', padding: '8px', borderRadius: '50%' }}>
              <BellRing size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>
              Disparo Oficial
            </h3>
          </div>
          <button onClick={onClose} className="clickable" style={{ background: '#F8F9FA', padding: '10px', borderRadius: '50%', border: 'none' }}>
            <X size={24} color="var(--primary)" />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <div style={{ width: '60px', height: '60px', background: '#F0FFF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                 <Send size={30} color="#38A169" />
               </div>
               <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--secondary)' }}>Enviado!</h4>
               <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Notificação enviada com sucesso para os congressistas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                 <AlertCircle size={18} color="#C53030" style={{ flexShrink: 0, marginTop: '2px' }} />
                 <p style={{ fontSize: '11px', color: '#9B2C2C', lineHeight: '1.4', fontWeight: '600' }}>
                    Esta mensagem gera um alerta nativo no celular de todos os participantes do grupo selecionado.
                 </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>Audiente</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['all', 'sponsors', 'staff'].map(opt => (
                    <button key={opt} onClick={() => setAudience(opt)} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: 'none', background: audience === opt ? 'var(--primary)' : '#EDF2F7', color: audience === opt ? 'white' : 'var(--text-muted)' }}>
                      {opt === 'all' ? 'Todos' : opt === 'sponsors' ? 'Patroc.' : 'Equipe'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>Título</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da notificação" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>Conteúdo</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Detalhes do aviso..." rows={4} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', resize: 'none' }} />
              </div>
              <button onClick={handleSend} disabled={isSending || !title.trim() || !message.trim()} className="btn-primary">
                 {isSending ? 'Enviando...' : 'Confirmar Disparo Global'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
