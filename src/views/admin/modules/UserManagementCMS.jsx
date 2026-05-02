import { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Briefcase, Trash2, Save, RefreshCw, ShieldCheck, Eye, EyeOff, Edit2, AlertTriangle, X } from 'lucide-react';
import { fetchAllMembers, fetchAllProfiles, createOrUpdateAdminUser, deleteMember } from '../../../services/adminService';
import { formatCPF } from '../../../utils/cpfUtils';
import { supabase } from '../../../lib/supabase';

const USER_TYPES = [
  { value: 'admin',               label: 'Organizador / Admin' },
  { value: 'congressista',        label: 'Congressista Comum' },
  { value: 'professor_basico',    label: 'Professor Básico' },
  { value: 'aluno_ficv',          label: 'Aluno FICV' },
  { value: 'colaborador_cv',      label: 'Colaborador CV' },
  { value: 'gestor',              label: 'Gestor / Diretor' },
  { value: 'coordenador',         label: 'Coordenador' },
  { value: 'academico',           label: 'Acadêmico' },
  { value: 'servo_kids',          label: 'Rede Kids / Voluntário' },
  { value: 'patrocinador_ouro',   label: 'Patrocinador Ouro' },
  { value: 'patrocinador_prata',  label: 'Patrocinador Prata' },
  { value: 'patrocinador_bronze', label: 'Patrocinador Bronze' },
  { value: 'staff',               label: 'Staff Evento' },
  { value: 'palestrante',         label: 'Palestrante / GTs' },
  { value: 'familia_educadora',   label: 'Família Educadora' },
  { value: 'pai_parceira',        label: 'Pai Parceiro' },
  { value: 'diretor',             label: 'Diretor de Escola' },
];

const EMPTY_USER = { name: '', cpf: '', email: '', user_type: 'staff', password: '' };

const normalizeModality = (mod) => {
    if (!mod) return '';
    const lower = mod.toLowerCase();
    if (lower.includes('online')) return 'Online';
    if (lower.includes('presencial')) return 'Presencial';
    return '';
};

const UserManagementCMS = ({ initialUser = null, onClearSelection = () => {}, currentUserCpf = null }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [counts, setCounts] = useState({ total: 0, presencial: 0, online: 0, accessed: 0, online_now: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [users, setUsers] = useState([]);

    // Modal de criação (formulário lateral)
    const [newUser, setNewUser] = useState(EMPTY_USER);
    const [showPassword, setShowPassword] = useState(false);
    const [createStatus, setCreateStatus] = useState(null); // 'success' | string (erro) | null

    // Modal de edição
    const [editModal, setEditModal] = useState(null);   // usuário sendo editado
    const [editPwd, setEditPwd] = useState('');
    const [showEditPwd, setShowEditPwd] = useState(false);
    const [editSaving, setEditSaving] = useState(false);
    const [editStatus, setEditStatus] = useState(null);

    // Modal de exclusão
    const [deleteModal, setDeleteModal] = useState(null); // usuário a excluir
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => { 
        loadData(); 
        loadCounts(); 
        
        // Atualização automática a cada 30 segundos
        const interval = setInterval(() => {
            loadCounts();
            loadData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadCounts = async () => {
        const now = new Date();
        const fiveMinsAgo = new Date(now.getTime() - 5 * 60000).toISOString();

        const [
            { count: total }, 
            { count: presencial }, 
            { count: online },
            { count: accessed },
            { count: onlineNow }
        ] = await Promise.all([
            supabase.from('members').select('*', { count: 'exact', head: true }),
            supabase.from('members').select('*', { count: 'exact', head: true }).ilike('modality', '%presencial%'),
            supabase.from('members').select('*', { count: 'exact', head: true }).ilike('modality', '%online%'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', fiveMinsAgo),
        ]);
        console.log("[CMS] Online Check:", { fiveMinsAgo, onlineNow });
        setCounts({ 
            total: total || 0, 
            presencial: presencial || 0, 
            online: online || 0,
            accessed: accessed || 0,
            online_now: onlineNow || 0
        });
    };

    useEffect(() => {
        if (initialUser) {
            setNewUser({ ...initialUser, password: '' });
        }
    }, [initialUser]);

    const loadData = async () => {
        setLoading(true);
        try {
            const members = await fetchAllMembers();
            const profiles = await fetchAllProfiles();
            const combined = members.map(m => {
                const profile = profiles.find(p => p.cpf === m.cpf);
                return { 
                    ...m, 
                    user_type: profile?.user_type || 'congressista',
                    updated_at: profile?.updated_at,
                    is_online: profile?.updated_at ? (new Date() - new Date(profile.updated_at)) < 5 * 60000 : false
                };
            });
            setUsers(combined);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newUser.name || !newUser.cpf || !newUser.user_type) {
            setCreateStatus('error');
            return;
        }
        setSaving(true);
        setCreateStatus(null);
        try {
            await createOrUpdateAdminUser(newUser);
            setNewUser(EMPTY_USER);
            onClearSelection();
            setCreateStatus('success');
            await loadData();
            setTimeout(() => setCreateStatus(null), 3000);
        } catch (e) {
            console.error("[CMS] Erro ao criar/atualizar:", e);
            setCreateStatus(e.message || 'Erro inesperado ao salvar.');
        }
        setSaving(false);
    };

    const handleEditSave = async () => {
        if (!editModal) return;
        setEditSaving(true);
        setEditStatus(null);
        try {
            await createOrUpdateAdminUser({
                name: editModal.name,
                cpf: editModal.cpf,
                email: editModal.email,
                user_type: editModal.user_type,
                modality: editModal.modality,
                password: editPwd || null,
            });
            setEditStatus('success');
            await loadData();
            setTimeout(() => { setEditModal(null); setEditStatus(null); setEditPwd(''); }, 1500);
        } catch (e) {
            console.error("[CMS] Erro ao editar:", e);
            setEditStatus(e.message || 'error');
        }
        setEditSaving(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return;
        setDeleteLoading(true);
        try {
            await deleteMember(deleteModal.cpf);
            setDeleteModal(null);
            setSearchTerm('');
            await loadData();
        } catch (e) {
            alert('Erro ao excluir: ' + e.message);
        }
        setDeleteLoading(false);
    };

    const filteredUsers = users.filter(u => {
        const q = searchTerm.toLowerCase().trim();
        // Se for busca numérica, limpa o termo de busca para bater com o banco
        const cleanQ = q.replace(/[^\d]/g, '');
        const matchesSearch = !q || 
                             u.name?.toLowerCase().includes(q) || 
                             u.cpf?.includes(q) ||
                             (cleanQ && u.cpf?.includes(cleanQ));
        if (!matchesSearch) return false;
        if (filterType === 'all') return true;
        if (filterType === 'online') return u.is_online;
        if (filterType === 'congressista') return u.user_type === 'congressista';
        if (filterType === 'organizer') return ['admin', 'staff', 'apoio', 'organizador'].includes(u.user_type);
        if (filterType === 'sponsor') return u.user_type?.startsWith('patrocinador');
        if (filterType === 'palestrante') return u.user_type === 'palestrante';
        return true;
    });

    const typeLabel = (type) => USER_TYPES.find(t => t.value === type)?.label || type;

    return (
        <div>

        {/* ── CARDS DE INSCRITOS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(212,193,156,0.3)' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Inscritos</p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#D4C19C', lineHeight: 1, marginBottom: '2px' }}>{counts.total.toLocaleString('pt-BR')}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Base total</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(212,193,156,0.3)' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Presencial</p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#D4C19C', lineHeight: 1, marginBottom: '2px' }}>{counts.presencial.toLocaleString('pt-BR')}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Ingresso físico</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1E293B 100%)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(212,193,156,0.3)' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Online</p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#D4C19C', lineHeight: 1, marginBottom: '2px' }}>{counts.online.toLocaleString('pt-BR')}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Ingresso digital</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(72,187,120,0.3)' }}>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Acessaram App</p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#48BB78', lineHeight: 1, marginBottom: '2px' }}>{counts.accessed.toLocaleString('pt-BR')}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Contas ativadas</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1A202C 0%, #000000 100%)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(236,100,100,0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#48BB78', boxShadow: '0 0 10px #48BB78' }} className="pulse-animation"></div>
                <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Online Agora</p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '2px' }}>{counts.online_now.toLocaleString('pt-BR')}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Ativos nos últimos 5min</p>
            </div>
        </div>


        <div className="responsive-grid">

            {/* ── FORMULÁRIO DE CRIAÇÃO ── */}
            <div>
                <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                            <UserPlus size={18} color="var(--gold)" /> Configurar Acesso
                        </h3>
                        <button 
                            onClick={() => { setNewUser(EMPTY_USER); setCreateStatus(null); onClearSelection(); }}
                            style={{ background: 'rgba(212,193,156,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                        >
                            LIMPAR / NOVO
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                        Adicione ou atualize permissões de usuários.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Nome Completo *</label>
                            <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={inputStyle} placeholder="Ex: João Silva" />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>CPF *</label>
                            <input 
                                type="text" 
                                value={newUser.cpf} 
                                onChange={e => {
                                    const val = e.target.value.replace(/[^\d]/g, '');
                                    setNewUser({...newUser, cpf: val});
                                }} 
                                style={inputStyle} 
                                placeholder="Apenas números" 
                                autoComplete="off" 
                            />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>E-mail</label>
                            <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={inputStyle} placeholder="usuario@email.com" autoComplete="off" />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Tipo de Usuário *</label>
                            <select value={newUser.user_type} onChange={e => setNewUser({...newUser, user_type: e.target.value})} style={inputStyle}>
                                {USER_TYPES.filter(t => t.value !== 'admin' || ['05875164450','36284400845','07745261490'].includes(currentUserCpf)).map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Modalidade (Inscrição)</label>
                            <select value={normalizeModality(newUser.modality)} onChange={e => setNewUser({...newUser, modality: e.target.value})} style={inputStyle}>
                                <option value="">Não definido</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Senha de Acesso</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={inputStyle} placeholder="Senha inicial (padrão: congresso2026)" autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {createStatus === 'success' && (
                            <div style={{ background: '#F0FFF4', color: '#22543D', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>
                                ✓ Usuário criado com sucesso!
                            </div>
                        )}
                        {createStatus && createStatus !== 'success' && (
                            <div style={{ background: '#FFF5F5', color: '#C53030', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', border: '1px solid #FC8181' }}>
                                {createStatus}
                            </div>
                        )}

                        <button onClick={handleCreate} disabled={saving} className="btn-primary" style={{ width: '100%', height: '48px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {saving ? 'SALVANDO...' : <><UserPlus size={16} /> CONFIRMAR ACESSO</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── LISTA DE USUÁRIOS ── */}
            <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#FFFFFF' }}>
                        Gerenciamento de Usuários <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>({filteredUsers.length})</span>
                    </h3>
                    <button onClick={loadData} disabled={loading} style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <RefreshCw size={14} /> {loading ? '...' : 'ATUALIZAR'}
                    </button>
                </div>

                {/* Filtros */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'online', label: 'Online agora' },
                        { id: 'congressista', label: 'Congressistas' },
                        { id: 'organizer', label: 'Organizadores' },
                        { id: 'sponsor', label: 'Patrocinadores' },
                        { id: 'palestrante', label: 'Palestras/GTs' },
                    ].map(f => (
                        <button 
                            key={f.id} 
                            onClick={() => setFilterType(f.id)} 
                            style={{ 
                                padding: '6px 14px', 
                                borderRadius: '100px', 
                                border: filterType === f.id ? '1px solid transparent' : '1px solid var(--border-color)', 
                                background: filterType === f.id 
                                    ? (f.id === 'online' ? '#48BB78' : 'var(--gold)') 
                                    : 'rgba(255,255,255,0.05)', 
                                color: filterType === f.id ? '#000' : 'rgba(255,255,255,0.6)', 
                                fontSize: '11px', 
                                fontWeight: '800', 
                                cursor: 'pointer', 
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {f.id === 'online' && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: filterType === f.id ? '#fff' : '#48BB78' }} />
                            )}
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Busca */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input type="text" placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingLeft: '38px' }} />
                </div>

                {/* Lista */}
                <div style={{ maxHeight: '560px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredUsers.map(u => (
                        <div key={u.cpf} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: u.user_type === 'admin' ? 'rgba(212,193,156,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {u.user_type === 'admin' ? <Shield size={18} color="var(--gold)" /> : <Briefcase size={18} color="#94A3B8" />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <ShieldCheck size={14} color="var(--gold)" />
                                    <p style={{ fontWeight: '800', fontSize: '13px', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {u.is_online && (
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48BB78', boxShadow: '0 0 8px #48BB78', display: 'inline-block', flexShrink: 0 }} title="Online agora" />
                                        )}
                                        {u.name}
                                    </p>
                                </div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{formatCPF(u.cpf)} • {u.email || 'Sem e-mail'}</p>
                                <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '700' }}>{typeLabel(u.user_type)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                    onClick={() => { setEditModal({ ...u }); setEditPwd(''); setEditStatus(null); }}
                                    style={{ background: 'rgba(212,193,156,0.15)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <Edit2 size={12} /> EDITAR
                                </button>
                                <button
                                    onClick={() => setDeleteModal(u)}
                                    style={{ background: 'rgba(229,62,62,0.1)', color: '#E53E3E', padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0', fontSize: '14px' }}>Nenhum usuário encontrado.</p>
                    )}
                </div>
            </div>

            {/* ══════════ MODAL DE EDIÇÃO ══════════ */}
            {editModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1A1F2E', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '460px', border: '1px solid var(--border-color)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: 'white', fontWeight: '900', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Edit2 size={18} color="var(--gold)" /> Editar Usuário
                            </h3>
                            <button onClick={() => setEditModal(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nome Completo</label>
                                <input type="text" value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})} style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>CPF</label>
                                <input type="text" value={formatCPF(editModal.cpf)} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>E-mail</label>
                                <input type="email" value={editModal.email || ''} onChange={e => setEditModal({...editModal, email: e.target.value})} style={inputStyle} />
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Tipo de Usuário</label>
                                <select value={editModal.user_type} onChange={e => setEditModal({...editModal, user_type: e.target.value})} style={inputStyle}>
                                    {USER_TYPES.filter(t => t.value !== 'admin' || ['05875164450','36284400845'].includes(currentUserCpf)).map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Modalidade (Inscrição)</label>
                                <select value={normalizeModality(editModal.modality)} onChange={e => setEditModal({...editModal, modality: e.target.value})} style={inputStyle}>
                                    <option value="">Não definido</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Nova Senha <span style={{ fontWeight: '400', opacity: 0.6 }}>(deixe em branco para manter)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showEditPwd ? 'text' : 'password'} value={editPwd} onChange={e => setEditPwd(e.target.value)} style={inputStyle} placeholder="Nova senha..." autoComplete="new-password" />
                                    <button type="button" onClick={() => setShowEditPwd(!showEditPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                        {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {editStatus === 'success' && <div style={{ background: '#F0FFF4', color: '#22543D', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>✓ Salvo com sucesso!</div>}
                            {editStatus && editStatus !== 'success' && (
                                <div style={{ background: '#FFF5F5', color: '#C53030', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>
                                    Erro: {editStatus === 'error' ? 'Tente novamente.' : editStatus}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                    CANCELAR
                                </button>
                                <button onClick={handleEditSave} disabled={editSaving} style={{ flex: 2, padding: '14px', borderRadius: '14px', background: 'var(--gold)', border: 'none', color: '#000', fontWeight: '900', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Save size={15} /> {editSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ MODAL DE EXCLUSÃO ══════════ */}
            {deleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1A1F2E', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid rgba(229,62,62,0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(229,62,62,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle size={28} color="#E53E3E" />
                        </div>
                        <h3 style={{ color: 'white', fontWeight: '900', fontSize: '18px', marginBottom: '10px' }}>Excluir Usuário?</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
                            Você está prestes a excluir permanentemente:
                        </p>
                        <p style={{ color: 'white', fontWeight: '800', fontSize: '15px', marginBottom: '6px' }}>{deleteModal.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '24px' }}>{formatCPF(deleteModal.cpf)}</p>
                        <p style={{ color: '#E53E3E', fontSize: '12px', fontWeight: '700', marginBottom: '24px' }}>Esta ação não pode ser desfeita.</p>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.6)', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                CANCELAR
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={deleteLoading} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#E53E3E', border: 'none', color: 'white', fontWeight: '900', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Trash2 size={14} /> {deleteLoading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

const groupStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' };
const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '14px', outline: 'none', color: '#111111', background: '#FFFFFF', boxSizing: 'border-box' };

export default UserManagementCMS;
