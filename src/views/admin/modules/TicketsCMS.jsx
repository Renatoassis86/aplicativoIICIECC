import React, { useState, useEffect } from 'react';
import { 
  Ticket, Search, Filter, RefreshCw, 
  CheckCircle, XCircle, AlertTriangle, 
  User, QrCode, MoreVertical, Shield, 
  Lock, Unlock, Download, BarChart2
} from 'lucide-react';
import { fetchAllTickets, updateTicketStatus, fetchTicketStats } from '../../../services/tickets/ticketService';
import SuccessMessage from '../../../components/admin/SuccessMessage';

/**
 * MODULE: GESTÃO DE INGRESSOS (CMS)
 * Controle central de check-in, bloqueios e emissão secundária.
 */
const TicketsCMS = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, scanned: 0, blocked: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [data, statistics] = await Promise.all([
      fetchAllTickets(),
      fetchTicketStats()
    ]);
    if (data) setTickets(data);
    if (statistics) setStats(statistics);
    setLoading(false);
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
  };

  const handleStatusChange = async (ticketId, currentStatus) => {
    let nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    // Se estiver scanned, só um admin muito específico (ou essa função) pode resetar pra active
    if (currentStatus === 'scanned') {
        if (!window.confirm('Este ingresso já foi BIPADO. Deseja invalidar o check-in e torná-lo ativo novamente?')) return;
        nextStatus = 'active';
    } else {
        const action = nextStatus === 'blocked' ? 'BLOQUEAR' : 'ATIVAR';
        if (!window.confirm(`Deseja realmente ${action} este ingresso?`)) return;
    }

    const res = await updateTicketStatus(ticketId, nextStatus);
    if (res.success) {
        triggerSuccess(`Status do ingresso atualizado para ${nextStatus.toUpperCase()}.`);
        loadData();
    }
  };

  const filteredTickets = tickets.filter(t => {
    const searchLow = searchTerm.toLowerCase();
    const nameMatch = t.member?.name?.toLowerCase().includes(searchLow);
    const cpfMatch = t.member_cpf?.includes(searchTerm);
    const statusMatch = filterStatus === 'ALL' || t.status === filterStatus;
    return (nameMatch || cpfMatch) && statusMatch;
  });

  const getStatusInfo = (status) => {
    switch(status) {
      case 'active': return { label: 'ATIVO', color: '#38A169', icon: <CheckCircle size={14} /> };
      case 'scanned': return { label: 'CHECKED-IN', color: '#3182CE', icon: <QrCode size={14} /> };
      case 'blocked': return { label: 'BLOQUEADO', color: '#E53E3E', icon: <Lock size={14} /> };
      default: return { label: 'PENDENTE', color: '#718096', icon: <AlertTriangle size={14} /> };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}

      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h3 style={{ fontWeight: '900', fontSize: '32px', color: 'white', letterSpacing: '-1px' }}>Logística de Ingressos</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Controle de acesso e validação de credenciais em tempo real.</p>
        </div>
        <button onClick={loadData} className="sync-btn" style={{ gap: '8px' }}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> ATUALIZAR BASE
        </button>
      </div>

      {/* QUICK STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={statCardStyle}>
           <div style={statLabelStyle}>TOTAL DE INSCRITOS</div>
           <div style={statValueStyle}>{stats.total}</div>
           <Ticket size={40} color="rgba(212, 193, 156, 0.1)" style={{ position: 'absolute', right: '20px', bottom: '20px' }} />
        </div>
        <div style={statCardStyle}>
           <div style={statLabelStyle}>CHECK-INS REALIZADOS</div>
           <div style={{ ...statValueStyle, color: '#4299E1' }}>{stats.scanned}</div>
           <BarChart2 size={40} color="rgba(66, 153, 225, 0.1)" style={{ position: 'absolute', right: '20px', bottom: '20px' }} />
           <div style={{ marginTop: '8px', width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
              <div style={{ width: `${(stats.scanned / (stats.total || 1)) * 100}%`, height: '100%', background: '#4299E1', borderRadius: '2px' }} />
           </div>
        </div>
        <div style={statCardStyle}>
           <div style={statLabelStyle}>INGRESSOS BLOQUEADOS</div>
           <div style={{ ...statValueStyle, color: '#E53E3E' }}>{stats.blocked}</div>
           <Shield size={40} color="rgba(229, 62, 62, 0.1)" style={{ position: 'absolute', right: '20px', bottom: '20px' }} />
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div style={{ 
        background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)',
        display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            placeholder="Buscar por Nome ou CPF..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={inputSearchStyle} 
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'active', 'scanned', 'blocked'].map(st => (
            <button 
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                ...filterBtnStyle,
                background: filterStatus === st ? 'var(--brand)' : 'rgba(255,255,255,0.05)',
                color: filterStatus === st ? 'black' : 'rgba(255,255,255,0.6)',
                borderColor: filterStatus === st ? 'var(--brand)' : 'transparent'
              }}
            >
              {st === 'ALL' ? 'TODOS' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
             <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
               <th style={thStyle}>CONGRESSISTA</th>
               <th style={thStyle}>CPF / CREDENCIAL</th>
               <th style={thStyle}>TIPO</th>
               <th style={thStyle}>STATUS</th>
               <th style={thStyle}>AÇÕES</th>
             </tr>
           </thead>
           <tbody>
             {filteredTickets.map(ticket => {
               const st = getStatusInfo(ticket.status);
               return (
                 <tr key={ticket.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                   <td style={tdStyle}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 193, 156, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontWeight: '900' }}>
                          {ticket.member?.name?.[0] || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: '800', color: 'white', fontSize: '14px' }}>{ticket.member?.name || 'Inscrito Não Importado'}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{ticket.member?.email || 'Sem e-mail'}</p>
                        </div>
                     </div>
                   </td>
                   <td style={tdStyle}>
                      <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', color: 'var(--brand)' }}>
                        {ticket.member_cpf}
                      </code>
                   </td>
                   <td style={tdStyle}>
                     <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>{ticket.ticket_type}</span>
                   </td>
                   <td style={tdStyle}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: st.color, fontWeight: '900', fontSize: '11px', letterSpacing: '0.5px' }}>
                        {st.icon} {st.label}
                     </div>
                   </td>
                   <td style={tdStyle}>
                     <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleStatusChange(ticket.id, ticket.status)}
                          style={{ 
                            ...actionBtnStyle, 
                            color: ticket.status === 'blocked' ? '#38A169' : '#EF4444',
                            background: ticket.status === 'blocked' ? 'rgba(56, 161, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                          }}
                          title={ticket.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                        >
                          {ticket.status === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button style={actionBtnStyle} title="Ver logs de check-in">
                          <MoreVertical size={16} color="white" />
                        </button>
                     </div>
                   </td>
                 </tr>
               );
             })}
           </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <AlertTriangle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ fontWeight: '700' }}>Nenhum ingresso encontrado para os filtros selecionados.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .table-row-hover:hover { background: rgba(255,255,255,0.02); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

const statCardStyle = { 
  background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', 
  position: 'relative', overflow: 'hidden' 
};
const statLabelStyle = { fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
const statValueStyle = { fontSize: '32px', fontWeight: '900', color: 'white' };
const inputSearchStyle = { width: '100%', padding: '14px 18px 14px 48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none' };
const filterBtnStyle = { padding: '10px 16px', borderRadius: '12px', border: '1px solid transparent', fontSize: '11px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s' };
const thStyle = { padding: '16px 24px', fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '16px 24px' };
const actionBtnStyle = { width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };

export default TicketsCMS;
