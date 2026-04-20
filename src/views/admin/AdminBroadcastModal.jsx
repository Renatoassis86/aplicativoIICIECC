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
      // O banco de dados possui um gatilho (tr_broadcast_to_notifications_v2) 
      // que cria automaticamente o registro em system_notifications ao inserir em broadcasts.
      // Isso é mais seguro e evita falhas de RLS para o usuário.
      const { error: broadcastError } = await supabase.from('broadcasts').insert({
        title: title.trim(),
        message: message.trim(),
        target_role: audience,
        sender_id: staffCpf,
        sender_name: userName || 'Admin'
      });
      
      if (broadcastError) throw broadcastError;

      setStatus('success');
      setTimeout(() => { onClose(); }, 2500);
    } catch (e) {
      console.error("[BroadcastError] Erro técnico detalhado:", e);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const audienceOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'diretor', label: 'Escolas (Diretores)' },
    { id: 'professor_basico', label: 'Professores' },
    { id: 'familia_educadora', label: 'Famílias' },
    { id: 'gestor', label: 'Gestores' },
    { id: 'academico', label: 'Acadêmicos' },
    { id: 'organizador', label: 'Organização' },
    { id: 'aluno_ficv', label: 'Alunos FICV' }
  ];

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
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
               <div style={{ width: '80px', height: '80px', background: '#F0FFF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Send size={40} color="#38A169" />
               </div>
               <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '12px' }}>Mensagem Enviada!</h4>
               <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                  O disparo foi concluído com sucesso. Todos os usuários do grupo <strong>{audienceOptions.find(o => o.id === audience)?.label}</strong> receberão o alerta instantaneamente.
               </p>
               <button onClick={onClose} className="btn-primary" style={{ width: '100%', height: '56px', fontSize: '16px' }}>CONCLUIR E FECHAR</button>
            </div>
          ) : status === 'error' ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
               <div style={{ width: '80px', height: '80px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <X size={40} color="#C53030" />
               </div>
               <h4 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '12px' }}>Falha no Disparo</h4>
               <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                  Ocorreu um erro técnico ao tentar salvar o comunicado. Verifique sua conexão ou tente novamente mais tarde.
               </p>
               <button onClick={() => setStatus(null)} className="btn-primary" style={{ width: '100%', height: '56px', fontSize: '16px', background: 'var(--secondary)', color: 'white' }}>TENTAR NOVAMENTE</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                 <AlertCircle size={20} color="#C53030" style={{ flexShrink: 0, marginTop: '2px' }} />
                 <p style={{ fontSize: '12px', color: '#9B2C2C', lineHeight: '1.5', fontWeight: '600' }}>
                    <strong>Atenção:</strong> Esta mensagem gera um alerta instantâneo nos dispositivos de todos os participantes do grupo selecionado.
                 </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '12px', display: 'block' }}>Audiente / Destinatários</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {audienceOptions.map(opt => (
                    <button key={opt.id} onClick={() => setAudience(opt.id)} style={{ padding: '14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: '1px solid', borderColor: audience === opt.id ? 'var(--primary)' : '#E2E8F0', background: audience === opt.id ? 'var(--primary)' : 'white', color: audience === opt.id ? 'white' : 'var(--secondary)', transition: 'all 0.2s' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>Título do Alerta</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Início da Palestra Magna" style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'white', fontWeight: '600' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px', display: 'block' }}>Conteúdo da Mensagem</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Digite aqui o aviso importante..." rows={5} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'white', resize: 'none', lineHeight: '1.5' }} />
              </div>
              <button 
                onClick={handleSend} 
                disabled={isSending || !title.trim() || !message.trim()} 
                className="btn-primary"
                style={{ height: '60px', borderRadius: '18px', fontSize: '16px', marginTop: '10px' }}
              >
                 {isSending ? 'PROCESSANDO DISPARO...' : 'CONFIRMAR DISPARO AGORA'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
