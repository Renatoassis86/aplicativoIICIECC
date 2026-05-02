import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users, Download, RefreshCw, Search, Trash2 } from 'lucide-react';

const PAGE_SIZE = 20;

export default function PreRegistrationCMS() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pre_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('[PreRegistrationCMS] error:', JSON.stringify(error));
    setRegistrations(data || []);
    setPage(1);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta pré-inscrição? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('pre_registrations').delete().eq('id', id);
    if (error) {
      console.error('[PreRegistrationCMS] delete error:', JSON.stringify(error));
      alert('Erro ao excluir. Tente novamente.');
      return;
    }
    setRegistrations(prev => prev.filter(r => r.id !== id));
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    const header = ['Nome', 'E-mail', 'WhatsApp', 'Data de Inscrição'];
    const rows = registrations.map(r => [
      r.name ?? '',
      r.email ?? '',
      r.whatsapp ?? '',
      r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : '',
    ]);
    const csv = [header, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pre_inscricoes_ciecc_2027.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // KPIs
  const now = new Date();
  const todayStr = now.toDateString();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const total = registrations.length;
  const today = registrations.filter(r => r.created_at && new Date(r.created_at).toDateString() === todayStr).length;
  const thisWeek = registrations.filter(r => r.created_at && new Date(r.created_at) >= startOfWeek).length;

  // Filtered list
  const q = search.trim().toLowerCase();
  const filtered = q
    ? registrations.filter(r =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q)
      )
    : registrations;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Pré-Inscrições</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>III Congresso Internacional de Educação Cristã Clássica — 2027</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(212,193,156,0.15)', border: '1px solid rgba(212,193,156,0.3)', color: '#D4C19C', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={loadRegistrations}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>Carregando pré-inscrições...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Pré-inscritos', value: total, color: '#D4C19C' },
              { label: 'Hoje', value: today, color: '#38A169' },
              { label: 'Esta Semana', value: thisWeek, color: '#3182CE' },
            ].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Users size={20} color={k.color} />
                </div>
                <p style={{ fontSize: '36px', fontWeight: '900', color: k.color, margin: '0 0 4px' }}>{k.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={handleSearch}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px 10px 40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Nome', 'E-mail', 'WhatsApp', 'Data de Inscrição', ''].map((h, i) => (
                      <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: '700', whiteSpace: 'nowrap', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                        {search ? 'Nenhum resultado encontrado.' : 'Nenhuma pré-inscrição cadastrada.'}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((r, idx) => (
                      <tr
                        key={r.id}
                        style={{ borderBottom: idx < pageItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                      >
                        <td style={{ padding: '12px 16px', color: 'white', fontWeight: '600', whiteSpace: 'nowrap' }}>{r.name ?? '—'}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)' }}>{r.email ?? '—'}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{r.whatsapp ?? '—'}</td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Excluir pré-inscrição"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '8px', background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.25)', color: '#FC8181', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              <span>
                Mostrando {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: safePage === 1 ? 'rgba(255,255,255,0.2)' : 'white', cursor: safePage === 1 ? 'default' : 'pointer', fontSize: '13px', fontWeight: '700' }}
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} style={{ padding: '6px 4px', color: 'rgba(255,255,255,0.3)' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid', borderColor: safePage === p ? 'var(--primary, #D4C19C)' : 'rgba(255,255,255,0.1)', background: safePage === p ? 'var(--primary, #D4C19C)' : 'rgba(255,255,255,0.05)', color: safePage === p ? '#1a1a1a' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: safePage === totalPages ? 'rgba(255,255,255,0.2)' : 'white', cursor: safePage === totalPages ? 'default' : 'pointer', fontSize: '13px', fontWeight: '700' }}
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
