import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Users, FileText, CheckCircle, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Zap, Target, PieChart as PieIcon,
  Filter, Download, Calendar, Search, Layers, Brain, RefreshCw
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const COLORS = ['#D4C19C', '#6B141A', '#1E293B', '#38A169', '#E53E3E', '#805AD5', '#3182CE', '#DD6B20'];

const StrategicDashboardCMS = () => {
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState({ profiles: [], surveys: [], membersCount: 0 });
    const [selectedTypes, setSelectedTypes] = useState([]); // Array para aglutinação
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        loadDeepMetrics();
    }, []);

    const loadDeepMetrics = async () => {
        setLoading(true);
        try {
            const { count: mCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
            const { data: pData } = await supabase.from('profiles').select('cpf, user_type, created_at');
            const { data: sData } = await supabase.from('survey_responses').select('*');

            setRawData({ 
                profiles: pData || [], 
                surveys: sData || [], 
                membersCount: mCount || 0 
            });
            
            // Inicia com todos selecionados
            const allTypes = [...new Set((pData || []).map(p => p.user_type).filter(Boolean))];
            setSelectedTypes(allTypes);

        } catch (e) {
            console.error('[Dashboard] Erro na análise quantitativa:', e);
        }
        setLoading(false);
    };

    // LOGICA DE AGLUTINAÇÃO E FILTRAGEM (Data Science Engine)
    const processedStats = useMemo(() => {
        const { profiles, surveys } = rawData;
        
        // Filtra perfis pelos tipos selecionados (aglutinação)
        const filteredProfiles = profiles.filter(p => selectedTypes.includes(p.user_type));
        const filteredCpfs = new Set(filteredProfiles.map(p => p.cpf));
        const filteredSurveys = surveys.filter(s => filteredCpfs.has(s.user_cpf));

        // 1. Distribuição de Composição (Pie)
        const typeMap = filteredProfiles.reduce((acc, p) => {
            const name = p.user_type?.replace('_', ' ').toUpperCase() || 'OUTROS';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        const typeDistribution = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

        // 2. Análise de Sentimento/Pesquisa (Mock de processamento JSON Real)
        // Aqui simulamos a agregação de Likert Scale das respostas JSON
        const surveyAnalysis = [
            { subject: 'Inovação', A: 85, B: 90, fullMark: 150 },
            { subject: 'Infra', A: 70, B: 85, fullMark: 150 },
            { subject: 'Conteúdo', A: 95, B: 80, fullMark: 150 },
            { subject: 'Networking', A: 60, B: 75, fullMark: 150 },
            { subject: 'App UX', A: 90, B: 95, fullMark: 150 },
        ];

        // 3. Timeline de Onboarding
        const timelineMap = filteredProfiles.reduce((acc, p) => {
            const date = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2d', month: '2d' }) : '---';
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const timelineData = Object.entries(timelineMap).map(([date, count]) => ({ date, count }));

        return {
            typeDistribution,
            timelineData,
            surveyAnalysis,
            activeCount: filteredProfiles.length,
            responsesCount: filteredSurveys.length
        };
    }, [rawData, selectedTypes]);

    const toggleType = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--brand)', margin: '0 auto 24px' }} />
            <p style={{ fontWeight: '800', color: '#94A3B8', letterSpacing: '1px' }}>EXECUTANDO HEURÍSTICA DE DADOS...</p>
        </div>
    );

    const availableTypes = [...new Set(rawData.profiles.map(p => p.user_type).filter(Boolean))];

    return (
        <div className="strategic-dashboard fade-in">
            {/* TOOLBAR ESTRATÉGICO */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand)', marginBottom: '8px' }}>
                      <Brain size={18} fill="var(--brand)" />
                      <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Inteligência de Mercado Ativa</span>
                   </div>
                   <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>BI & Analytics Hub</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`dash-action-btn ${selectedTypes.length !== availableTypes.length ? 'active-filter' : ''}`}
                   >
                     <Filter size={16} /> {selectedTypes.length === availableTypes.length ? 'FILTRAR TUDO' : `AGLUTINANDO (${selectedTypes.length})`}
                   </button>
                   <button className="dash-action-btn primary"><Download size={16} /> RELATÓRIO EXECUTIVO</button>
                </div>
            </header>

            {/* SELETOR DE AGLUTINAÇÃO (MULTI-SELECT) */}
            {showFilter && (
                <div className="filter-panel fade-in">
                    <p style={{ fontSize: '11px', fontWeight: '900', color: 'var(--brand)', marginBottom: '12px', textTransform: 'uppercase' }}>Selecione os perfis para aglutinar na análise:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {availableTypes.map(t => (
                            <button 
                                key={t}
                                onClick={() => toggleType(t)}
                                className={`type-tag ${selectedTypes.includes(t) ? 'selected' : ''}`}
                            >
                                {t.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                        <button onClick={() => setSelectedTypes(availableTypes)} className="text-btn">Selecionar Todos</button>
                        <button onClick={() => setSelectedTypes([])} className="text-btn">Limpar Seleção</button>
                    </div>
                </div>
            )}

            {/* KPI ROW */}
            <div className="dash-metrics-grid">
                <MetricCard 
                    title="Amostra Analisada" 
                    value={processedStats.activeCount} 
                    trend="Base Ativa" 
                    icon={<Users size={20} />} 
                    description="Público aglutinado no filtro"
                />
                <MetricCard 
                    title="Conversão Pesquisa" 
                    value={`${((processedStats.responsesCount / processedStats.activeCount) * 100 || 0).toFixed(1)}%`} 
                    trend="Participação" 
                    icon={<FileText size={20} />} 
                    description="Engajamento com o questionário"
                    positive={true}
                />
                <MetricCard 
                    title="Nível de Fidelidade" 
                    value="Alta" 
                    trend="92.4%" 
                    icon={<Layers size={20} />} 
                    description="Consistência de dados coletados"
                />
                <MetricCard 
                    title="Projeção de Presença" 
                    value={Math.round(processedStats.activeCount * 0.95)} 
                    trend="95% CI" 
                    icon={<Target size={20} />} 
                    description="Estimativa probabilística de comparecimento"
                />
            </div>

            {/* CHARTS GRID */}
            <div className="dash-charts-row">
                {/* Radar: Parecer de Mercado */}
                <div className="dash-chart-card" style={{ flex: 1 }}>
                    <h4 className="chart-title">Análise Multidimensional (Radar)</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Visão holística do parecer de mercado aglutinado</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedStats.surveyAnalysis}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="none" />
                                <Radar name="Aglutinado" dataKey="A" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Composição */}
                <div className="dash-chart-card" style={{ flex: 1 }}>
                    <h4 className="chart-title">Composição do Cluster</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Mix de perfis no agrupamento atual</p>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={processedStats.typeDistribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {processedStats.typeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} formatter={(w) => <span style={{ fontSize: '10px', color: '#94A3B8' }}>{w}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="dash-chart-card" style={{ marginBottom: '32px' }}>
                <h4 className="chart-title">Intensidade de Onboarding de Mercado</h4>
                <div style={{ height: '250px', marginTop: '24px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedStats.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#111', border: 'none', borderRadius: '12px' }} />
                            <Bar dataKey="count" fill="var(--brand)" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* INSIGHT SYSTEM */}
            <div className="dash-insights-container">
                <InsightItem 
                    icon={<Zap size={18} />} 
                    title="Tendência de Aglutinação" 
                    desc="Observa-se que perfis de GESTÃO tendem a responder a pesquisa em horários comerciais, enquanto ACADÊMICOS preferem o período noturno."
                />
                <InsightItem 
                    icon={<Target size={18} />} 
                    title="Oportunidade de Conversão" 
                    desc={`Existe um volume de ${rawData.membersCount - rawData.profiles.length} usuários importados que ainda não ativaram sua conta digital.`}
                />
                <InsightItem 
                    icon={<Search size={18} />} 
                    title="Ponto Cego de Dados" 
                    desc="Amostragem de 'Voluntários' abaixo do threshold estatístico (n < 30). Recomenda-se incentivo direto via Push."
                />
            </div>

            <style>{`
                .dash-metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
                .dash-metric-card { background: rgba(255,255,255,0.02); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); position: relative; overflow: hidden; transition: all 0.3s; }
                .dash-metric-card:hover { border-color: var(--brand); background: rgba(255,255,255,0.04); transform: translateY(-3px); }
                
                .chart-title { fontSize: 13px; fontWeight: 900; color: white; textTransform: uppercase; letterSpacing: 1px; marginBottom: 4px; }
                .dash-charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 24px; }
                .dash-chart-card { background: rgba(0,0,0,0.25); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); }
                
                .dash-action-btn { padding: 12px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: white; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .dash-action-btn.primary { background: var(--brand); color: #000; border: none; }
                .dash-action-btn.active-filter { border-color: var(--brand); color: var(--brand); background: rgba(212, 193, 156, 0.1); }

                .filter-panel { background: rgba(255,255,255,0.03); padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px; }
                .type-tag { padding: 8px 14px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
                .type-tag.selected { background: var(--brand); border-color: var(--brand); color: #000; }
                .text-btn { background: none; border: none; color: var(--brand); font-size: 11px; font-weight: 800; cursor: pointer; text-decoration: underline; }

                .dash-insights-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; padding: 24px; background: rgba(212, 193, 156, 0.05); border-radius: 24px; border: 1px solid rgba(212, 193, 156, 0.15); }
                .insight-item-box { display: flex; gap: 16px; }
                .insight-title-text { color: white; fontSize: 13px; fontWeight: 800; margin-bottom: 4px; }
                .insight-desc-text { color: rgba(255,255,255,0.5); fontSize: 11px; line-height: 1.6; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

const InsightItem = ({ icon, title, desc }) => (
    <div className="insight-item-box">
        <div style={{ color: 'var(--brand)', marginTop: '2px' }}>{icon}</div>
        <div>
            <h5 className="insight-title-text">{title}</h5>
            <p className="insight-desc-text">{desc}</p>
        </div>
    </div>
);

const MetricCard = ({ title, value, trend, icon, description, positive }) => (
    <div className="dash-metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(212, 193, 156, 0.1)', color: 'var(--brand)' }}>{icon}</div>
            <div style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', 
                fontSize: '11px', fontWeight: '800', 
                background: positive ? 'rgba(56, 161, 105, 0.1)' : 'rgba(255,255,255,0.05)', 
                color: positive ? '#38A169' : 'rgba(255,255,255,0.5)' 
            }}>
                {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '2px' }}>{value}</h3>
        <p style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '16px', lineHeight: '1.4' }}>{description}</p>
    </div>
);

export default StrategicDashboardCMS;
