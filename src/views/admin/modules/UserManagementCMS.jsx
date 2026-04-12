import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Briefcase, Trash2, Save, RefreshCw } from 'lucide-react';
import { fetchAllMembers, fetchAllProfiles, createOrUpdateAdminUser } from '../../../services/adminService';
import { formatCPF } from '../../../utils/cpfUtils';

const UserManagementCMS = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        cpf: '',
        email: '',
        user_type: 'staff'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const members = await fetchAllMembers();
            const profiles = await fetchAllProfiles();
            
            // Cruzar dados para pegar o user_type do perfil
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
            alert('Usuário configurado com sucesso!');
            setNewUser({ name: '', cpf: '', email: '', user_type: 'staff' });
            loadData();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.cpf?.includes(searchTerm)
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            {/* CRIAR USUÁRIO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                        <UserPlus size={20} color="var(--gold)" /> Configurar Acesso
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Adicione ou atualize permissões de usuários.</p>

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
                                <option value="congressista">Congressista Comum</option>
                            </select>
                        </div>

                        <button 
                            onClick={handleCreateUser}
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', textTransform: 'uppercase' }}
                        >
                            <Save size={18} /> SALVAR USUÁRIO
                        </button>
                    </div>
                </div>
            </div>

            {/* LISTAGEM */}
            <div style={{ background: 'var(--card-bg)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#FFFFFF' }}>Gerenciamento de Usuários</h3>
                    <button onClick={loadData} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
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
                                background: u.user_type === 'admin' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: u.user_type === 'admin' ? 'var(--gold)' : '#94A3B8'
                            }}>
                                {u.user_type === 'admin' ? <Shield size={20} /> : <Briefcase size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <p style={{ fontWeight: '800', fontSize: '14px', color: '#FFFFFF' }}>{u.name}</p>
                                    <span style={{ 
                                        padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900',
                                        background: u.user_type === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.1)',
                                        color: u.user_type === 'admin' ? 'var(--gold)' : '#CBD5E1',
                                        textTransform: 'uppercase'
                                    }}>
                                        {u.user_type}
                                    </span>
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
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)' };

export default UserManagementCMS;
