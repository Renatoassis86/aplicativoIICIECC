import { useState, useEffect } from 'react';
import {
  Ticket, Search, RefreshCw, CheckCircle, AlertTriangle,
  QrCode, Shield, Lock, Unlock, Trash2, Plus, Zap, X, UserPlus
} from 'lucide-react';
import {
  fetchAllTickets, updateTicketStatus, fetchTicketStats,
  createTicket, deleteTicket, generateMissingTickets
} from '../../../services/tickets/ticketService';

const STATUS = {
  active:  { label: 'ATIVO',      color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: <CheckCircle size={13} /> },
  scanned: { label: 'CHECK-IN',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: <QrCode size={13} /> },
  blocked: { label: 'BLOQUEADO',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: <Lock size={13} /> },
};
const getStatus = (s) => STATUS[s] || { label: 'PENDENTE', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: <AlertTriangle size={13} /> };

const TICKET_TYPES = ['Geral', 'VIP', 'Palestrante', 'Staff', 'Imprensa', 'Patrocinador', 'Estudante'];

export default function TicketsCMS() {
  const [tickets, setTickets]       = useState([]);
  const [stats, setStats]           = useState({ total: 0, scanned: 0, blocked: 0 });
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilter]   = useState('ALL');

  // Modal ação (bloquear/ativar/resetar)
  const [actionModal, setActionModal] = useState(null); // { ticket, nextStatus, label }
  const [actionLoading, setActionLoading] = useState(false);

  // Modal excluir
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal criar ingresso
  const [createModal, setCreateModal] = useState(false);
  const [newCpf, setNewCpf]         = useState('');
  const [newType, setNewType]       = useState('Geral');
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg]   = useState(null);

  // Gerar em massa
  const [massLoading, setMassLoading] = useState(false);
  const [massMsg, setMassMsg]       = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [data, s] = await Promise.all([fetchAllTickets(), fetchTicketStats()]);
    setTickets(data || []);
    setStats(s);
    setLoading(false);
  };

  // ── AÇÕES DE STATUS ──────────────────────────────────────────────────────
  const openActionModal = (ticket) => {
    let nextStatus, label;
    if (ticket.status === 'blocked') {
      nextStatus = 'active'; label = 'Desbloquear';
    } else if (ticket.status === 'scanned') {
      nextStatus = 'active'; label = 'Resetar Check-in';
    } else {
      nextStatus = 'blocked'; label = 'Bloquear';
    }
    setActionModal({ ticket, nextStatus, label });
  };

  const confirmAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    await updateTicketStatus(actionModal.ticket.id, actionModal.nextStatus);
    setActionModal(null);
    setActionLoading(false);
    loadData();
  };

  // ── EXCLUIR ──────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    await deleteTicket(deleteModal.id);
    setDeleteModal(null);
    setDeleteLoading(false);
    loadData();
  };

  // ── CRIAR MANUAL ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newCpf.trim()) return;
    setCreateLoading(true);
    setCreateMsg(null);
    const cpf = newCpf.replace(/\D/g, '');
    const res = await createTicket(cpf, newType);
    setCreateMsg(res);
    setCreateLoading(false);
    if (res.success) {
      setNewCpf('');
      setNewType('Geral');
      loadData();
      setTimeout(() => { setCreateModal(false); setCreateMsg(null); }, 2000);
    }
  };

  // ── GERAR EM MASSA ────────────────────────────────────────────────────────
  const handleMassGenerate = async () => {
    setMassLoading(true);
    setMassMsg(null);
    const res = await generateMissingTickets();
    setMassMsg(res);
    setMassLoading(false);
    if (res.success) loadData();
    setTimeout(() => setMassMsg(null), 4000);
  };

  // ── FILTRO ────────────────────────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    const match = !q || t.member?.name?.toLowerCase().includes(q) || t.member_cpf?.includes(q);
    const statusMatch = filterStatus === 'ALL' || t.status === filterStatus;
    return match && statusMatch;
  });

  const active = tickets.filter(t => t.status === 'active').length;

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontWeight: '900', fontSize: '28px', color: 'white', letterSpacing: '-1px' }}>Logística de Ingressos</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Controle de acesso e validação de credenciais em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setCreateModal(true)} style={{ ...btnStyle, background: '#22C55E', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={16} /> NOVO INGRESSO
          </button>
          <button onClick={handleMassGenerate} disabled={massLoading} style={{ ...btnStyle, background: 'rgba(212,193,156,0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} /> {massLoading ? 'GERANDO...' : 'GERAR EM MASSA'}
          </button>
          <button onClick={loadData} disabled={loading} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> ATUALIZAR
          </button>
        </div>
      </div>

      {massMsg && (
        <div style={{ background: massMsg.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${massMsg.success ? '#22C55E' : '#EF4444'}`, color: massMsg.success ? '#22C55E' : '#EF4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '700' }}>
          {massMsg.success ? `✓ ${massMsg.created} ingressos gerados com sucesso!` : `Erro: ${massMsg.message}`}
        </div>
      )}

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'TOTAL DE INGRESSOS', value: stats.total, color: 'white', icon: <Ticket size={36} color="rgba(212,193,156,0.15)" /> },
          { label: 'ATIVOS',             value: active,       color: '#22C55E', icon: <CheckCircle size={36} color="rgba(34,197,94,0.15)" /> },
          { label: 'CHECK-INS',          value: stats.scanned, color: '#3B82F6', icon: <QrCode size={36} color="rgba(59,130,246,0.15)" />, bar: stats.total ? (stats.scanned / stats.total) : 0 },
          { label: 'BLOQUEADOS',         value: stats.blocked, color: '#EF4444', icon: <Shield size={36} color="rgba(239,68,68,0.15)" /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card-bg)', padding: '20px 24px', borderRadius: '20px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '900', color: s.color }}>{s.value}</p>
            {s.bar !== undefined && (
              <div style={{ marginTop: '8px', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                <div style={{ width: `${s.bar * 100}%`, height: '100%', background: '#3B82F6', borderRadius: '2px' }} />
              </div>
            )}
            <div style={{ position: 'absolute', right: '16px', bottom: '16px' }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* ── FILTROS ── */}
      <div style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'active', 'scanned', 'blocked'].map(st => (
            <button key={st} onClick={() => setFilter(st)} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer', background: filterStatus === st ? 'var(--gold)' : 'rgba(255,255,255,0.06)', color: filterStatus === st ? '#000' : 'rgba(255,255,255,0.6)' }}>
              {st === 'ALL' ? 'TODOS' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABELA ── */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              {['CONGRESSISTA', 'CPF', 'TIPO', 'STATUS', 'AÇÕES'].map(h => (
                <th key={h} style={{ padding: '14px 20px', fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(ticket => {
              const st = getStatus(ticket.status);
              return (
                <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(212,193,156,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>
                        {ticket.member?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: '800', color: 'white', fontSize: '13px' }}>{ticket.member?.name || 'Membro não encontrado'}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{ticket.member?.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <code style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', color: 'var(--gold)' }}>
                      {ticket.member_cpf}
                    </code>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>{ticket.ticket_type || 'Geral'}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: st.bg, color: st.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' }}>
                      {st.icon} {st.label}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Botão bloquear/ativar/resetar */}
                      <button onClick={() => openActionModal(ticket)} title={ticket.status === 'blocked' ? 'Desbloquear' : ticket.status === 'scanned' ? 'Resetar check-in' : 'Bloquear'}
                        style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: ticket.status === 'blocked' ? 'rgba(34,197,94,0.1)' : ticket.status === 'scanned' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                          color: ticket.status === 'blocked' ? '#22C55E' : ticket.status === 'scanned' ? '#3B82F6' : '#EF4444' }}>
                        {ticket.status === 'blocked' ? <Unlock size={15} /> : ticket.status === 'scanned' ? <RefreshCw size={15} /> : <Lock size={15} />}
                      </button>
                      {/* Botão excluir */}
                      <button onClick={() => setDeleteModal(ticket)} title="Excluir ingresso"
                        style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && !loading && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <Ticket size={40} style={{ marginBottom: '12px', opacity: 0.2 }} />
            <p style={{ fontWeight: '700', fontSize: '14px' }}>Nenhum ingresso encontrado.</p>
            <p style={{ fontSize: '12px', marginTop: '6px' }}>Clique em "GERAR EM MASSA" para criar ingressos para todos os inscritos.</p>
          </div>
        )}

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Carregando ingressos...
          </div>
        )}
      </div>

      {/* ══════ MODAL AÇÃO (bloquear/ativar/resetar) ══════ */}
      {actionModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: actionModal.nextStatus === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              {actionModal.nextStatus === 'active' ? <Unlock size={24} color="#22C55E" /> : <Lock size={24} color="#EF4444" />}
            </div>
            <h3 style={{ color: 'white', fontWeight: '900', fontSize: '18px', textAlign: 'center', marginBottom: '8px' }}>{actionModal.label} Ingresso?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', marginBottom: '20px', lineHeight: '1.6' }}>
              <strong style={{ color: 'white' }}>{actionModal.ticket.member?.name || actionModal.ticket.member_cpf}</strong><br />
              Status atual: <span style={{ color: getStatus(actionModal.ticket.status).color }}>{getStatus(actionModal.ticket.status).label}</span>
              {' → '}
              <span style={{ color: getStatus(actionModal.nextStatus).color }}>{getStatus(actionModal.nextStatus).label}</span>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActionModal(null)} style={cancelBtnStyle}>CANCELAR</button>
              <button onClick={confirmAction} disabled={actionLoading}
                style={{ ...confirmBtnStyle, background: actionModal.nextStatus === 'active' ? '#22C55E' : '#EF4444' }}>
                {actionLoading ? 'AGUARDE...' : `CONFIRMAR ${actionModal.label.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL EXCLUIR ══════ */}
      {deleteModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 style={{ color: 'white', fontWeight: '900', fontSize: '18px', textAlign: 'center', marginBottom: '8px' }}>Excluir Ingresso?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'white' }}>{deleteModal.member?.name || 'Membro'}</strong>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>CPF: {deleteModal.member_cpf}</p>
            <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: '700', textAlign: 'center', marginBottom: '20px' }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteModal(null)} style={cancelBtnStyle}>CANCELAR</button>
              <button onClick={confirmDelete} disabled={deleteLoading} style={{ ...confirmBtnStyle, background: '#EF4444' }}>
                {deleteLoading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ MODAL CRIAR ══════ */}
      {createModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: 'white', fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="var(--gold)" /> Criar Ingresso Manual
              </h3>
              <button onClick={() => { setCreateModal(false); setCreateMsg(null); setNewCpf(''); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>CPF do Participante *</label>
                <input value={newCpf} onChange={e => setNewCpf(e.target.value)} placeholder="Apenas números" style={inputModalStyle} autoComplete="off" />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Ingresso</label>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={inputModalStyle}>
                  {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {createMsg && (
                <div style={{ background: createMsg.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: createMsg.success ? '#22C55E' : '#EF4444', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>
                  {createMsg.success ? '✓ Ingresso criado com sucesso!' : `Erro: ${createMsg.message}`}
                </div>
              )}

              <button onClick={handleCreate} disabled={createLoading || !newCpf.trim()}
                style={{ ...confirmBtnStyle, background: 'var(--primary)', marginTop: '4px', opacity: !newCpf.trim() ? 0.5 : 1 }}>
                <UserPlus size={16} /> {createLoading ? 'CRIANDO...' : 'CRIAR INGRESSO'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

const btnStyle = { padding: '10px 18px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' };
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalStyle = { background: '#1A1F2E', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '420px', border: '1px solid var(--border-color)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' };
const cancelBtnStyle = { flex: 1, padding: '13px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer', fontSize: '13px' };
const confirmBtnStyle = { flex: 2, padding: '13px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', display: 'block' };
const inputModalStyle = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '14px', outline: 'none', color: '#111111', background: '#FFFFFF', boxSizing: 'border-box' };
