import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { RefreshCw, Users, TrendingUp, Star, Download } from 'lucide-react';

const NPS_QUESTIONS = ['Q11','Q21','Q31','Q42','Q55','Q65','Q82','Q94','Q95','Q96'];
const NPS_LABELS = {
  Q11: 'Nota Global', Q21: 'Palestras', Q31: 'Oficinas', Q42: 'Organização',
  Q55: 'Infraestrutura', Q65: 'Online', Q82: 'Atendimento',
  Q94: 'Recomendação', Q95: 'Retorno 2027', Q96: 'NPS Marca CVE'
};

const LIKERT_QUESTIONS = ['Q05-10','Q13-20','Q24-30','Q33-41','Q44-54','Q57-64','Q67-73','Q75-81','Q84-91','Q98-105','Q108-114','Q116-120','Q122-127'];
const LIKERT_LABELS = {
  'Q05-10': 'Experiência Geral', 'Q13-20': 'Palestras', 'Q24-30': 'Oficinas',
  'Q33-41': 'Organização', 'Q44-54': 'Infraestrutura', 'Q57-64': 'Online',
  'Q67-73': 'Networking', 'Q75-81': 'Atendimento', 'Q84-91': 'Impacto',
  'Q98-105': 'Fórum de Líderes', 'Q108-114': 'Espiritualidade',
  'Q116-120': 'Custo-Benefício', 'Q122-127': 'Comunicação'
};

export default function SatisfactionCMS() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview'); // 'overview' | 'nps' | 'likert' | 'open' | 'raw'

  useEffect(() => { loadResponses(); }, []);

  const loadResponses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('satisfaction_responses')
      .select('*')
      .eq('completed', true)
      .order('created_at', { ascending: false });
    setResponses(data || []);
    setLoading(false);
  };

  const total = responses.length;
  const presencial = responses.filter(r => r.modality === 'presencial').length;
  const online = responses.filter(r => r.modality === 'online').length;
  const firstTimers = responses.filter(r => r.is_first_congress).length;

  // Calcula NPS para uma questão
  const calcNPS = (qId) => {
    const vals = responses.map(r => r.answers?.[qId]).filter(v => v !== undefined && v !== null && v !== '__skipped__');
    if (!vals.length) return { score: null, promoters: 0, neutrals: 0, detractors: 0, count: 0 };
    const promoters = vals.filter(v => v >= 9).length;
    const neutrals = vals.filter(v => v >= 7 && v <= 8).length;
    const detractors = vals.filter(v => v <= 6).length;
    const score = Math.round(((promoters - detractors) / vals.length) * 100);
    const avg = (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1);
    return { score, promoters, neutrals, detractors, count: vals.length, avg };
  };

  // Calcula média Likert para uma questão
  const calcLikert = (qId) => {
    const allVals = [];
    responses.forEach(r => {
      const ans = r.answers?.[qId];
      if (Array.isArray(ans)) ans.forEach(v => { if (v && v !== '__skipped__') allVals.push(v); });
    });
    if (!allVals.length) return null;
    return (allVals.reduce((a,b) => a+b, 0) / allVals.length).toFixed(2);
  };

  const npsColor = (score) => {
    if (score === null) return '#666';
    if (score >= 50) return '#38A169';
    if (score >= 0) return '#ECC94B';
    return '#E53E3E';
  };

  const exportCSV = () => {
    if (!responses.length) return;
    const rows = responses.map(r => ({
      id: r.id,
      data: new Date(r.created_at).toLocaleDateString('pt-BR'),
      modalidade: r.modality,
      perfil: r.profile_type,
      primeiro_congresso: r.is_first_congress ? 'Sim' : 'Não',
      nota_global: r.answers?.Q11,
      nps_recomendacao: r.answers?.Q94,
      nps_retorno: r.answers?.Q95,
    }));
    const header = Object.keys(rows[0]).join(';');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(';'))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'satisfacao_ciecc.csv'; a.click();
  };

  const tabStyle = (t) => ({
    padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
    background: tab === t ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
    color: tab === t ? 'white' : 'rgba(255,255,255,0.5)',
  });

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>Pesquisa de Satisfação</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>II Congresso Internacional de Educação Cristã Clássica</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(212,193,156,0.15)', border: '1px solid rgba(212,193,156,0.3)', color: '#D4C19C', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            <Download size={14} /> CSV
          </button>
          <button onClick={loadResponses} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>Carregando respostas...</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total de Respostas', val: total, icon: <Users size={20} color="#D4C19C" /> },
              { label: 'Presencial', val: presencial, icon: <Star size={20} color="#38A169" /> },
              { label: 'Online', val: online, icon: <Star size={20} color="#3182CE" /> },
              { label: 'Primeiro Congresso', val: firstTimers, icon: <TrendingUp size={20} color="#ECC94B" /> },
            ].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>{k.icon}</div>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#D4C19C', margin: 0 }}>{k.val}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[['overview','Visão Geral'],['nps','NPS'],['likert','Likert'],['open','Respostas Abertas'],['raw','Dados Brutos']].map(([t,l]) => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{l}</button>
            ))}
          </div>

          {/* VISÃO GERAL */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {NPS_QUESTIONS.slice(0,6).map(qId => {
                const n = calcNPS(qId);
                if (!n.count) return null;
                return (
                  <div key={qId} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{NPS_LABELS[qId]}</p>
                    <p style={{ fontSize: '36px', fontWeight: '900', color: npsColor(n.score), margin: '0 0 4px' }}>{n.avg}/10</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>NPS: <span style={{ color: npsColor(n.score), fontWeight: '700' }}>{n.score > 0 ? '+' : ''}{n.score}</span> · {n.count} respostas</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* NPS DETALHADO */}
          {tab === 'nps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {NPS_QUESTIONS.map(qId => {
                const n = calcNPS(qId);
                if (!n.count) return <div key={qId} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: 'rgba(255,255,255,0.3)' }}>{NPS_LABELS[qId]} — sem respostas</div>;
                const pPct = Math.round((n.promoters / n.count) * 100);
                const nPct = Math.round((n.neutrals / n.count) * 100);
                const dPct = Math.round((n.detractors / n.count) * 100);
                return (
                  <div key={qId} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'white', margin: 0 }}>{NPS_LABELS[qId]}</p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Média: <strong style={{ color: '#D4C19C' }}>{n.avg}</strong></span>
                        <span style={{ fontSize: '13px', color: npsColor(n.score) }}>NPS: <strong>{n.score > 0 ? '+' : ''}{n.score}</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ width: `${dPct}%`, background: '#E53E3E' }} />
                      <div style={{ width: `${nPct}%`, background: '#ECC94B' }} />
                      <div style={{ width: `${pPct}%`, background: '#38A169' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontSize: '11px', color: '#E53E3E' }}>Detratores: {n.detractors} ({dPct}%)</span>
                      <span style={{ fontSize: '11px', color: '#ECC94B' }}>Neutros: {n.neutrals} ({nPct}%)</span>
                      <span style={{ fontSize: '11px', color: '#38A169' }}>Promotores: {n.promoters} ({pPct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIKERT */}
          {tab === 'likert' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {LIKERT_QUESTIONS.map(qId => {
                const avg = calcLikert(qId);
                const pct = avg ? ((parseFloat(avg) - 1) / 4) * 100 : 0;
                const color = pct >= 70 ? '#38A169' : pct >= 50 ? '#ECC94B' : '#E53E3E';
                return (
                  <div key={qId} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'white', margin: 0 }}>{LIKERT_LABELS[qId]}</p>
                      <p style={{ fontSize: '18px', fontWeight: '900', color, margin: 0 }}>{avg ?? '—'}<span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/5</span></p>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* RESPOSTAS ABERTAS */}
          {tab === 'open' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { id: 'Q12', label: 'Momento mais marcante' },
                { id: 'Q23', label: 'O que aprofundar nas palestras' },
                { id: 'Q43', label: 'Problemas de organização' },
                { id: 'Q74', label: 'Sugestões de networking' },
                { id: 'Q93', label: 'Principal aprendizado' },
                { id: 'Q129', label: 'Ponto forte do Congresso' },
                { id: 'Q130', label: 'Principal ponto de melhoria' },
                { id: 'Q131', label: 'Sugestões para 2027' },
                { id: 'Q132', label: 'Mensagem para a equipe' },
              ].map(({ id, label }) => {
                const answers = responses.map(r => r.answers?.[id]).filter(v => v && v !== '__skipped__' && v.length > 2);
                if (!answers.length) return null;
                return (
                  <div key={id}>
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#D4C19C', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label} ({answers.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {answers.slice(0, 20).map((ans, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                          "{ans}"
                        </div>
                      ))}
                      {answers.length > 20 && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>+{answers.length - 20} respostas — exporte o CSV para ver todas</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DADOS BRUTOS */}
          {tab === 'raw' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Data','Modalidade','Perfil','1° Congresso','Nota Global','NPS Rec.','NPS Retorno'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{r.modality}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.profile_type}</td>
                      <td style={{ padding: '10px 12px', color: r.is_first_congress ? '#38A169' : 'rgba(255,255,255,0.5)' }}>{r.is_first_congress ? 'Sim' : 'Não'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#D4C19C' }}>{r.answers?.Q11 ?? '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{r.answers?.Q94 ?? '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>{r.answers?.Q95 ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
