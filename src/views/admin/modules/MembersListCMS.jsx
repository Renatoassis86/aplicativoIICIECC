import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, RefreshCw, Edit2 } from 'lucide-react';
import { fetchAllMembers, fetchAllProfiles } from '../../../services/adminService';
import { formatCPF } from '../../../utils/cpfUtils';

const MembersListCMS = ({ onEditUser = () => {} }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState('all');
    const [members, setMembers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const mData = await fetchAllMembers();
            const pData = await fetchAllProfiles();
            
            const combined = mData.map(m => {
                const profile = pData.find(p => p.cpf === m.cpf);
                return {
                    ...m,
                    user_type: profile ? profile.user_type : 'congressista'
                };
            });
            
            setMembers(combined);
        } catch (e) {
            console.error('Erro ao carregar lista:', e);
        }
        setLoading(false);
    };

    const userTypes = [
        { id: 'all', label: 'Todos' },
        { id: 'congressista', label: 'Congressistas' },
        { id: 'aluno_ficv', label: 'Alunos FICV' },
        { id: 'professor_basico', label: 'Professores Básico' },
        { id: 'colaborador_cv', label: 'Colaboradores CV' },
        { id: 'gestor', label: 'Gestores/Diretores' },
        { id: 'academico', label: 'Acadêmicos' },
        { id: 'servo_kids', label: 'Rede Kids/Voluntários' },
        { id: 'admin', label: 'Organizadores' },
    ];

    const filtered = members.filter(m => {
        const matchesSearch = (m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.cpf?.includes(searchTerm));
        const matchesType = activeType === 'all' || m.user_type === activeType || 
                          (activeType === 'gestor' && ['gestor', 'diretor', 'coordenador', 'mantenedor'].includes(m.user_type));
        return matchesSearch && matchesType;
    });

    return (
        <div className="members-list-container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontWeight: '900', fontSize: '24px', color: '#FFFFFF', marginBottom: '8px' }}>Lista de Membros</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Total carregado: <strong>{members.length}</strong> inscritos</p>
                </div>
                <button 
                   onClick={loadData}
                   disabled={loading}
                   style={{ 
                       padding: '12px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', 
                       border: '1px solid var(--border-color)', color: 'white', fontWeight: '800', 
                       cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
                   }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {loading ? 'Sincronizando...' : 'SINCRONIZAR'}
                </button>
            </header>

            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {userTypes.map(type => (
                    <button 
                        key={type.id}
                        onClick={() => setActiveType(type.id)}
                        style={{ 
                            padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', 
                            whiteSpace: 'nowrap', transition: 'all 0.3s', border: '1px solid var(--border-color)',
                            background: activeType === type.id ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                            color: activeType === type.id ? '#000' : 'rgba(255,255,255,0.6)'
                        }}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input 
                    type="text" 
                    placeholder="Buscar por nome, CPF ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        width: '100%', padding: '16px 16px 16px 50px', borderRadius: '16px', border: '1px solid var(--border-color)',
                        background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '15px', outline: 'none'
                    }}
                />
            </div>

            <div className="card-main" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={thStyle}>Membro</th>
                                <th style={thStyle}>Documento</th>
                                <th style={thStyle}>Contato</th>
                                <th style={thStyle}>Localização</th>
                                <th style={thStyle}>Tipo de Inscrito</th>
                                <th style={thStyle}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((m, idx) => (
                                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                                                {m.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '800', color: 'white', fontSize: '14px' }}>{m.name}</p>
                                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                  ID: {m.id ? String(m.id).substring(0, 8) : '---'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '700' }}>{formatCPF(m.cpf)}</p>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <p style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {m.email || '---'}</p>
                                            <p style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {m.phone || '---'}</p>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <p style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={12} /> {m.city ? `${m.city}/${m.state}` : '---'}
                                        </p>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', 
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                            background: 'rgba(212, 193, 156, 0.1)', color: 'var(--gold)'
                                        }}>
                                            {m.user_type?.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <Users size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>Nenhum membro encontrado com estes filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const thStyle = { padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '16px 20px', verticalAlign: 'middle' };

export default MembersListCMS;
