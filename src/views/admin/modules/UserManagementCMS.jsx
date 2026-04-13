import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Briefcase, Trash2, Save, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { fetchAllMembers, fetchAllProfiles, createOrUpdateAdminUser, deleteMember } from '../../../services/adminService';
import { formatCPF } from '../../../utils/cpfUtils';

const UserManagementCMS = ({ initialUser = null, onClearSelection = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        cpf: '',
        email: '',
        user_type: 'staff',
        password: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (initialUser) {
            setNewUser(initialUser);
            setIsEditing(true);
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
                    user_type: profile ? profile.user_type : 'congressista'
                };
            });
            
            setUsers(combined);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.cpf || !newUser.user_type) {
            alert('Preencha os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            await createOrUpdateAdminUser(newUser);
            alert(isEditing ? 'Perfil atualizado com sucesso!' : 'Novo usuário configurado!');
            setNewUser({ name: '', cpf: '', email: '', user_type: 'staff', password: '' });
            setIsEditing(false);
            onClearSelection();
            loadData();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
        setLoading(false);
    };

    const handleDelete = async (cpf, name) => {
        if (!window.confirm(`Tem certeza que deseja excluir permanentemente ${name}? Esta ação não pode ser desfeita.`)) return;
        
        setLoading(true);
        try {
            await deleteMember(cpf);
            alert('Usuário excluído com sucesso do banco de dados.');
            // Limpa o termo de busca para garantir que a lista atualizada apareça sem filtros que possam confundir
            setSearchTerm('');
            await loadData();
        } catch (e) {
            alert('Erro ao excluir: ' + e.message);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.cpf?.includes(searchTerm)
    );

    return (
        <div className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ 
                    background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', 
                    border: isEditing ? '2px solid var(--gold)' : '1px solid var(--border-color)', 
                    backdropFilter: 'blur(10px)', position: 'relative' 
                }}>
                    <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                        {isEditing ? <Shield size={20} color="var(--gold)" /> : <UserPlus size={20} color="var(--gold)" />}
                        {isEditing ? 'Edição de Perfil' : 'Configurar Acesso'}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
                        {isEditing ? `Alterando dados de ${newUser.name}` : 'Adicione ou atualize permissões de usuários.'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Nome Completo</label>
                            <input 
                                type="text" 
                                value={newUser.name} 
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                style={inputStyle}
                                placeholder="Ex: João Silva"
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>CPF</label>
                            <input 
                                type="text" 
                                value={newUser.cpf} 
                                onChange={(e) => setNewUser({...newUser, cpf: e.target.value})}
                                style={inputStyle}
                                placeholder="Apenas números"
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>E-mail</label>
                            <input 
                                type="email" 
                                value={newUser.email} 
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                style={inputStyle}
                                placeholder="usuario@email.com"
                            />
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tipo de Usuário</label>
                            <select 
                                value={newUser.user_type}
                                onChange={(e) => setNewUser({...newUser, user_type: e.target.value})}
                                style={inputStyle}
                            >
                                <option value="admin">Organizador / Admin</option>
                                <option value="staff">Staff Evento</option>
                                <option value="patrocinador_master">Patrocinador Master</option>
                                <option value="patrocinador_diamante">Patrocinador Diamante</option>
                                <option value="patrocinador_ouro">Patrocinador Ouro</option>
                                <option value="palestrante">Palestrante</option>
                                <option value="apoio">Equipe de Apoio</option>
                                <option value="congressista">Congressista Comum</option>
                            </select>
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>{isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}</label>
                            <div style={{ position: 'relative' }}>
                                <RefreshCw size={16} style={{ position: 'absolute', right: '12px', top: '14px', color: 'rgba(255,255,255,0.2)' }} />
                                <input 
                                    type="text" 
                                    value={newUser.password} 
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    style={inputStyle}
                                    placeholder={isEditing ? "Alterar senha..." : "Senha inicial"}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleCreateUser}
                            disabled={loading}
                            className="btn-primary"
                            style={{ 
                                width: '100%', textTransform: 'uppercase', height: '48px', 
                                background: isEditing ? 'var(--gold)' : 'var(--primary)',
                                color: isEditing ? '#000' : '#FFF'
                             }}
                        >
                            {isEditing ? <Save size={18} /> : <UserPlus size={18} />} 
                            {isEditing ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR ACESSO'}
                        </button>

                        {isEditing && (
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setNewUser({ name: '', cpf: '', email: '', user_type: 'staff', password: '' });
                                    onClearSelection();
                                }}
                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <X size={14} /> CANCELAR EDIÇÃO
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#FFFFFF' }}>Gerenciamento de Usuários</h3>
                    <button 
                        type="button" 
                        disabled={loading}
                        onClick={loadData}
                        style={{ width: 'auto', padding: '12px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {loading ? <div className="animate-spin">⌛</div> : <><RefreshCw size={16} /> RECARREGAR</>}
                    </button>
                </div>

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou CPF..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '40px' }}
                    />
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredUsers.map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                            <div style={{ 
                                width: '40px', height: '40px', borderRadius: '10px', 
                                background: u.user_type === 'admin' ? 'rgba(212, 193, 156, 0.1)' : 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: u.user_type === 'admin' ? 'var(--gold)' : '#94A3B8'
                            }}>
                                {u.user_type === 'admin' ? <Shield size={20} /> : <Briefcase size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={18} color="var(--gold)" />
                                        <div>
                                            <p style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF' }}>{u.name}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => {
                                                setNewUser({
                                                    name: u.name || '',
                                                    cpf: u.cpf || '',
                                                    email: u.email || '',
                                                    user_type: u.user_type || 'congressista'
                                                });
                                                setIsEditing(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            style={{ background: 'rgba(212, 193, 156, 0.1)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', border: 'none', cursor: 'pointer' }}
                                        >
                                            EDITAR
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(u.cpf, u.name)}
                                            style={{ background: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E', padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{formatCPF(u.cpf)} • {u.email || 'Sem e-mail'}</p>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>Nenhum usuário encontrado.</p>}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
};

const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: '700', color: '#FFFFFF' };
const badgeStyle = { fontSize: '10px', fontWeight: '900', color: 'var(--gold)', background: 'rgba(212, 193, 156, 0.1)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)' };

export default UserManagementCMS;
