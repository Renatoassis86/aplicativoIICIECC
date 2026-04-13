import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Edit2, Save, X, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import SuccessMessage from '../../../components/admin/SuccessMessage';

const ScheduleCMS = () => {
    const [sessions, setSessions] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [activeTab, setActiveTab] = useState('sessions');
    const [editingSession, setEditingSession] = useState(null);
    const [editingSpeaker, setEditingSpeaker] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [photoSource, setPhotoSource] = useState('link'); // 'link' ou 'upload'
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

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

    const triggerSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccess(true);
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
            category: data.category,
            updated_at: new Date().toISOString()
        });

        if (!error) {
            setEditingSession(null);
            loadData();
            triggerSuccess('Programação atualizada com sucesso!');
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
        try {
            let finalPhotoUrl = photoSource === 'link' ? data.photo_url : (editingSpeaker?.photo_url || '');

            if (photoSource === 'upload' && uploadFile) {
                const fileExt = uploadFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('speakers')
                    .upload(fileName, uploadFile);
                
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('speakers').getPublicUrl(fileName);
                finalPhotoUrl = urlData.publicUrl;
            }

            const { error } = await supabase.from('speakers').upsert({
                id: editingSpeaker?.id || undefined,
                name: data.name,
                bio: data.bio,
                photo_url: finalPhotoUrl,
                institution: data.institution,
                website_url: data.website_url,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            setEditingSpeaker(null);
            setUploadFile(null);
            loadData();
            triggerSuccess('Palestrante salvo e integrado ao sistema!');
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (table, id) => {
        if (!window.confirm('Tem certeza?')) return;
        setLoading(true);
        await supabase.from(table).delete().eq('id', id);
        loadData();
        triggerSuccess('Item removido permanentemente.');
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            {showSuccess && <SuccessMessage message={successMsg} onComplete={() => setShowSuccess(false)} />}
            
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

            {loading && !editingSession && !editingSpeaker && <p style={{ textAlign: 'center', padding: '20px', color: 'var(--gold)', fontWeight: '700' }}>Sincronizando dados...</p>}

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
                                <h4 style={{ margin: '12px 0 8px', fontWeight: '800', color: '#FFFFFF', fontSize: '16px', lineHeight: '1.4' }}>{s.title}</h4>
                                <div style={metaStyle}><Clock size={14} color="rgba(255,255,255,0.5)" /> {s.start_time} - {s.end_time}</div>
                                <div style={metaStyle}><MapPin size={14} color="rgba(255,255,255,0.5)" /> {s.room || 'Auditório Principal'}</div>
                                {s.speakers && <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '700', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <img src={s.speakers.photo_url} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} alt="" /> {s.speakers.name}
                                </div>}
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
                                    <img src={sp.photo_url || 'https://via.placeholder.com/150'} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '2px solid var(--border-color)' }} />
                                    <h4 style={{ fontWeight: '800', margin: '0 0 4px', color: '#FFFFFF' }}>{sp.name}</h4>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{sp.institution}</p>
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
                            <button onClick={() => setEditingSession(null)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
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
                                {loading ? 'SALVANDO...' : <><Save size={18} /> SALVAR ATIVIDADE</>}
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
                            <button onClick={() => setEditingSpeaker(null)} style={{ background: 'none', border: 'none', color: 'white' }}><X /></button>
                        </div>
                        <form onSubmit={handleSaveSpeaker} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input name="name" placeholder="Nome Completo" defaultValue={editingSpeaker.name} required style={inputStyle} />
                            <input name="institution" placeholder="Instituição / Título" defaultValue={editingSpeaker.institution} style={inputStyle} />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#CBD5E1' }}>Foto do Palestrante</label>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                        <input type="radio" checked={photoSource === 'link'} onChange={() => setPhotoSource('link')} /> Link Externo
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                        <input type="radio" checked={photoSource === 'upload'} onChange={() => setPhotoSource('upload')} /> Upload PC
                                    </label>
                                </div>
                                {photoSource === 'link' ? (
                                    <input name="photo_url" placeholder="URL da Foto (https://...)" defaultValue={editingSpeaker.photo_url} style={inputStyle} />
                                ) : (
                                    <div style={{ border: '2px dashed var(--border-color)', padding: '16px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <input type="file" id="speaker-photo" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} style={{ display: 'none' }} />
                                        <label htmlFor="speaker-photo" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <ImageIcon size={20} color="var(--gold)" />
                                            <span style={{ fontSize: '12px', fontWeight: '700' }}>{uploadFile ? uploadFile.name : 'Selecionar Foto no PC'}</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <textarea name="bio" placeholder="Mini Bio" defaultValue={editingSpeaker.bio} style={{ ...inputStyle, minHeight: '120px' }} />
                            
                            <input name="website_url" placeholder="Site Oficial / Bio (https://...)" defaultValue={editingSpeaker.website_url} style={inputStyle} />
                            
                            <button type="submit" disabled={loading} style={btnSaveStyle}>
                                {loading ? 'PROCESSANDO...' : <><Save size={18} /> SALVAR PALESTRANTE</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const tabStyle = { padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' };
const activeTabStyle = { ...tabStyle, background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' };
const btnPlusStyle = { padding: '10px 18px', borderRadius: '10px', background: 'var(--secondary)', color: '#000', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const cardStyle = { background: 'var(--card-bg)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' };
const badgeStyle = { fontSize: '10px', color: 'var(--gold)', background: 'rgba(212, 193, 156, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' };
const iconBtnStyle = { width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', background: 'rgba(255,255,255,0.05)' };
const iconBtnDeleteStyle = { ...iconBtnStyle, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' };
const metaStyle = { fontSize: '13px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: '700' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalStyle = { background: '#0F172A', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', color: '#FFFFFF', border: '1px solid var(--border-color)' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.05)' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', display: 'block' };
const btnSaveStyle = { padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px', width: '100%' };

export default ScheduleCMS;
