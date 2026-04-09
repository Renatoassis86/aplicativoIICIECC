import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Edit2, Save, X, Clock, MapPin } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const ScheduleCMS = () => {
    const [sessions, setSessions] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [activeTab, setActiveTab] = useState('sessions');
    const [editingSession, setEditingSession] = useState(null);
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data: sData } = await supabase.from('agenda_sessions').select('*, speakers(*)').order('session_date').order('start_time');
        const { data: spData } = await supabase.from('speakers').select('*').order('name');
        setSessions(sData || []);
        setSpeakers(spData || []);
        setLoading(false);
    };

    const handleSaveSession = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        setLoading(true);
        const { error } = await supabase.from('agenda_sessions').upsert({
            id: editingSession?.id || undefined,
            title: data.title,
            description: data.description,
            speaker_id: data.speaker_id || null,
            session_date: data.session_date,
            start_time: data.start_time,
            end_time: data.end_time,
            room: data.room,
            category: data.category
        });

        if (!error) {
            setEditingSession(null);
            loadData();
        } else {
            alert(error.message);
        }
        setLoading(false);
    };

    const handleSaveSpeaker = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        setLoading(true);
        const { error } = await supabase.from('speakers').upsert({
            id: editingSpeaker?.id || undefined,
            name: data.name,
            bio: data.bio,
            photo_url: data.photo_url,
            institution: data.institution
        });

        if (!error) {
            setEditingSpeaker(null);
            loadData();
        } else {
            alert(error.message);
        }
        setLoading(false);
    };

    const deleteItem = async (table, id) => {
        if (!window.confirm('Tem certeza?')) return;
        setLoading(true);
        await supabase.from(table).delete().eq('id', id);
        loadData();
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <button 
                    onClick={() => setActiveTab('sessions')}
                    style={activeTab === 'sessions' ? activeTabStyle : tabStyle}
                >
                    <Calendar size={18} /> Programação
                </button>
                <button 
                    onClick={() => setActiveTab('speakers')}
                    style={activeTab === 'speakers' ? activeTabStyle : tabStyle}
                >
                    <Users size={18} /> Palestrantes
                </button>
            </div>

            {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Carregando dados...</p>}

            {activeTab === 'sessions' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '20px' }}>Gerenciar Programação</h3>
                        <button onClick={() => setEditingSession({})} style={btnPlusStyle}>
                            <Plus size={18} /> Nova Atividade
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {sessions.map(s => (
                            <div key={s.id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={badgeStyle}>{s.category || 'Palestra'}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setEditingSession(s)} style={iconBtnStyle}><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('agenda_sessions', s.id)} style={iconBtnDeleteStyle}><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h4 style={{ margin: '12px 0 8px', fontWeight: '800' }}>{s.title}</h4>
                                <div style={metaStyle}><Clock size={14} /> {s.start_time} - {s.end_time}</div>
                                <div style={metaStyle}><MapPin size={14} /> {s.room || 'Auditório Principal'}</div>
                                {s.speakers && <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>🎤 {s.speakers.name}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'speakers' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '20px' }}>Professores e Palestrantes</h3>
                        <button onClick={() => setEditingSpeaker({})} style={btnPlusStyle}>
                            <Plus size={18} /> Novo Palestrante
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {speakers.map(sp => (
                            <div key={sp.id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button onClick={() => setEditingSpeaker(sp)} style={iconBtnStyle}><Edit2 size={14} /></button>
                                    <button onClick={() => deleteItem('speakers', sp.id)} style={iconBtnDeleteStyle}><Trash2 size={14} /></button>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <img src={sp.photo_url || 'https://via.placeholder.com/150'} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
                                    <h4 style={{ fontWeight: '800', margin: '0 0 4px' }}>{sp.name}</h4>
                                    <p style={{ fontSize: '12px', color: '#64748B' }}>{sp.institution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL SESSÃO */}
            {editingSession && (
                <div style={overlayStyle}>
                    <div style={modalStyle} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '800' }}>{editingSession.id ? 'Editar Atividade' : 'Nova Atividade'}</h3>
                            <button onClick={() => setEditingSession(null)} style={{ background: 'none', border: 'none' }}><X /></button>
                        </div>
                        <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input name="title" placeholder="Título da Palestra" defaultValue={editingSession.title} required style={inputStyle} />
                            <textarea name="description" placeholder="Descrição curta" defaultValue={editingSession.description} style={{ ...inputStyle, minHeight: '80px' }} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Data</label>
                                    <input type="date" name="session_date" defaultValue={editingSession.session_date} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Categoria</label>
                                    <input name="category" placeholder="Ex: Palestra" defaultValue={editingSession.category} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Início</label>
                                    <input type="time" name="start_time" defaultValue={editingSession.start_time} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fim</label>
                                    <input type="time" name="end_time" defaultValue={editingSession.end_time} required style={inputStyle} />
                                </div>
                            </div>

                            <input name="room" placeholder="Local / Sala" defaultValue={editingSession.room} style={inputStyle} />

                            <select name="speaker_id" defaultValue={editingSession.speaker_id} style={inputStyle}>
                                <option value="">Sem palestrante vinculado</option>
                                {speakers.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                            </select>

                            <button type="submit" disabled={loading} style={btnSaveStyle}>
                                <Save size={18} /> SALVAR ATIVIDADE
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PALESTRANTE */}
            {editingSpeaker && (
                <div style={overlayStyle}>
                    <div style={modalStyle} className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontWeight: '800' }}>{editingSpeaker.id ? 'Editar Palestrante' : 'Novo Palestrante'}</h3>
                            <button onClick={() => setEditingSpeaker(null)} style={{ background: 'none', border: 'none' }}><X /></button>
                        </div>
                        <form onSubmit={handleSaveSpeaker} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input name="name" placeholder="Nome Completo" defaultValue={editingSpeaker.name} required style={inputStyle} />
                            <input name="institution" placeholder="Instituição / Título" defaultValue={editingSpeaker.institution} style={inputStyle} />
                            <input name="photo_url" placeholder="URL da Foto" defaultValue={editingSpeaker.photo_url} style={inputStyle} />
                            <textarea name="bio" placeholder="Mini Bio" defaultValue={editingSpeaker.bio} style={{ ...inputStyle, minHeight: '120px' }} />
                            
                            <button type="submit" disabled={loading} style={btnSaveStyle}>
                                <Save size={18} /> SALVAR PALESTRANTE
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const tabStyle = { padding: '12px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B' };
const activeTabStyle = { ...tabStyle, background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' };
const btnPlusStyle = { padding: '10px 18px', borderRadius: '10px', background: 'var(--secondary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const cardStyle = { background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' };
const badgeStyle = { fontSize: '10px', fontWeight: '900', color: '#6366F1', background: '#EEF2FF', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' };
const iconBtnStyle = { width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', background: 'white' };
const iconBtnDeleteStyle = { ...iconBtnStyle, color: '#EF4444', borderColor: '#FEE2E2' };
const metaStyle = { fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalStyle = { background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '4px', display: 'block' };
const btnSaveStyle = { padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' };

export default ScheduleCMS;
