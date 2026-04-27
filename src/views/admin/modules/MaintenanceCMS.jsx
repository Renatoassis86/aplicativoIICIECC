import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  RefreshCcw, 
  Clock, 
  AlertTriangle, 
  Info,
  Terminal,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { logService } from '../../../services/logService';

const MaintenanceCMS = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await logService.getRecentLogs(100);
            setLogs(data);
        } catch (err) {
            console.error("Erro ao carregar logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm('Tem certeza que deseja apagar todo o histórico de logs?')) return;
        try {
            await logService.clearLogs();
            loadLogs();
        } catch (err) {
            alert('Erro ao limpar: ' + err.message);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.component.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || log.level === filter;
        return matchesSearch && matchesFilter;
    });

    const getLevelIcon = (level) => {
        switch(level) {
            case 'error': return <ShieldAlert size={18} color="#EF4444" />;
            case 'warning': return <AlertTriangle size={18} color="#F59E0B" />;
            case 'info': return <Info size={18} color="#3B82F6" />;
            default: return <Terminal size={18} color="#94A3B8" />;
        }
    };

    const getLevelStyle = (level) => {
        switch(level) {
            case 'error': return { borderLeft: '4px solid #EF4444', background: 'rgba(239, 68, 68, 0.05)' };
            case 'warning': return { borderLeft: '4px solid #F59E0B', background: 'rgba(245, 158, 11, 0.05)' };
            default: return { borderLeft: '4px solid #3B82F6', background: 'rgba(59, 130, 246, 0.05)' };
        }
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '900', fontSize: '24px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={28} color="var(--gold)" /> 
                    Manutenção & Logs do Sistema
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={loadLogs} style={actionBtnStyle}>
                        <RefreshCcw size={18} /> Atualizar
                    </button>
                    <button onClick={handleClearLogs} style={deleteBtnStyle}>
                        <Trash2 size={18} /> Limpar Tudo
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div style={filterBarStyle}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setFilter('all')} style={filter === 'all' ? activeFilterStyle : baseFilterStyle}>Todos</button>
                    <button onClick={() => setFilter('error')} style={filter === 'error' ? errorFilterStyle : baseFilterStyle}>Erros</button>
                    <button onClick={() => setFilter('warning')} style={filter === 'warning' ? warnFilterStyle : baseFilterStyle}>Avisos</button>
                </div>
                <div style={searchWrapperStyle}>
                    <Search size={16} color="#94A3B8" />
                    <input 
                        placeholder="Buscar log ou componente..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gold)', fontWeight: '800' }}>Processando Histórico...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredLogs.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            Nenhum registro encontrado para estes filtros.
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} style={{ ...logCardStyle, ...getLevelStyle(log.level) }}>
                                <div 
                                    style={logHeaderStyle} 
                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                        {getLevelIcon(log.level)}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#F1F5F9' }}>{log.message}</span>
                                            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>{log.component}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                                            <Clock size={14} />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                        {expandedLog === log.id ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                                    </div>
                                </div>

                                {expandedLog === log.id && (
                                    <div style={logDetailsStyle}>
                                        <div style={detailsGridStyle}>
                                            <div>
                                                <label style={detailLabelStyle}>Contexto Técnico:</label>
                                                <pre style={codeBlockStyle}>{JSON.stringify(log.details, null, 2)}</pre>
                                            </div>
                                            {log.user_cpf && (
                                                <div style={{ marginTop: '16px' }}>
                                                    <label style={detailLabelStyle}>Usuário (CPF):</label>
                                                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--gold)' }}>{log.user_cpf}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// ESTILOS
const logCardStyle = { borderRadius: '16px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' };
const logHeaderStyle = { padding: '16px 24px', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '16px' };
const logDetailsStyle = { padding: '24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' };
const detailLabelStyle = { fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px', display: 'block' };
const codeBlockStyle = { margin: 0, padding: '16px', background: '#0F172A', borderRadius: '12px', color: '#94A3B8', fontSize: '12px', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' };
const actionBtnStyle = { padding: '10px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' };
const deleteBtnStyle = { ...actionBtnStyle, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' };
const filterBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-color)' };
const baseFilterStyle = { padding: '6px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94A3B8', fontWeight: '800', cursor: 'pointer', fontSize: '13px' };
const activeFilterStyle = { ...baseFilterStyle, background: 'var(--gold)', color: 'black' };
const errorFilterStyle = { ...baseFilterStyle, background: '#EF4444', color: 'white' };
const warnFilterStyle = { ...baseFilterStyle, background: '#F59E0B', color: 'white' };
const searchWrapperStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', flex: 1, maxWidth: '400px' };
const searchInputStyle = { background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '14px', width: '100%', fontWeight: '600' };
const detailsGridStyle = { display: 'flex', flexDirection: 'column' };

export default MaintenanceCMS;
