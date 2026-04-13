import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, RefreshCw, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { fetchAllMembers, fetchAllProfiles, deleteMember } from '../../../services/adminService';
import { formatCPF } from '../../../utils/cpfUtils';
import { supabase } from '../../../lib/supabase';

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
                    user_type: profile ? profile.user_type : 'congressista',
                    avatar_url: profile?.avatar_url,
                    job_title: profile?.job_title
                };
            });
            
            setMembers(combined);
        } catch (e) {
            console.error('Erro ao carregar lista:', e);
        }
        setLoading(false);
    };

    const handleDeleteUser = async (cpf) => {
        if (!window.confirm('Excluir este membro PERMANENTEMENTE? Esta ação não pode ser desfeita.')) return;
        try {
            setLoading(true);
            await deleteMember(cpf);
            alert('Membro excluído com sucesso do banco de dados.');
            loadData();
        } catch (e) {
            alert('Falha na exclusão: ' + e.message);
        } finally {
            setLoading(false);
        }
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
        const matchesSearch = (
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            m.cpf?.includes(searchTerm) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesType = activeType === 'all' || m.user_type === activeType || 
                          (activeType === 'gestor' && ['gestor', 'diretor', 'coordenador', 'mantenedor'].includes(m.user_type));
        return matchesSearch && matchesType;
    });

    return (
        <div className="members-list-container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontWeight: '900', fontSize: '24px', color: '#FFFFFF', marginBottom: '8px' }}>Lista de Membros</h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Total carregado: <strong>{members.length}</strong> inscritos</p>
                </div>
                <button 
                   onClick={loadData}
                   disabled={loading}
                   className="sync-btn-mobile"
                   style={{ 
                       padding: '12px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', 
                       border: '1px solid var(--border-color)', color: 'white', fontWeight: '800', 
                       cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
                   }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {loading ? 'Carregando...' : 'ATUALIZAR LISTA'}
                </button>
            </header>

            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="no-scrollbar">
                {userTypes.map(type => (
                    <button 
                        key={type.id}
                        onClick={() => setActiveType(type.id)}
                        style={{ 
                            padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', 
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
                        background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '15px', outline: 'none'
                    }}
                />
            </div>

            <div className="card-main" style={{ padding: 0, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ overflowX: 'auto' }} className="no-scrollbar">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '940px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={thStyle}>Membro</th>
                                <th style={thStyle}>Contato & WhatsApp</th>
                                <th style={thStyle}>Instituição / Escola</th>
                                <th style={thStyle}>Tipo / Cargo</th>
                                <th style={thStyle}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((m, idx) => {
                                const isLeader = ['gestor', 'diretor', 'coordenador', 'mantenedor'].includes(m.user_type);
                                const cleanPhone = m.phone ? m.phone.replace(/\D/g, '') : '';
                                const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
                                
                                return (
                                    <tr key={m.id || m.cpf} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>
                                                    {m.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '800', color: 'white', fontSize: '14px' }}>{m.name}</p>
                                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                                                      {formatCPF(m.cpf)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {m.email ? (
                                                    <a href={`mailto:${m.email}`} style={{ fontSize: '12px', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '700' }}>
                                                        <Mail size={12} /> {m.email}
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontWeight: '500' }}>Sem e-mail</span>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {m.phone ? (
                                                        <>
                                                            <span style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                                                                <Phone size={12} /> {m.phone}
                                                            </span>
                                                            {waLink && (
                                                                <a href={waLink} target="_blank" rel="noreferrer" style={{ 
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: '24px', height: '24px', background: 'rgba(37, 211, 102, 0.1)', 
                                                                    borderRadius: '6px', color: '#25D366' 
                                                                }}>
                                                                    <MessageCircle size={14} fill="#25D366" color="white" />
                                                                </a>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontWeight: '500' }}>Sem telefone</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <p style={{ fontSize: '13px', color: isLeader ? 'var(--gold)' : '#FFFFFF', fontWeight: isLeader ? '900' : '700' }}>
                                                    {m.institution || '---'}
                                                </p>
                                                {m.job_title && (
                                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{m.job_title}</p>
                                                )}
                                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>{m.city ? `${m.city}/${m.state}` : ''}</p>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', 
                                                textTransform: 'uppercase', letterSpacing: '0.8px',
                                                background: isLeader ? 'rgba(212, 193, 156, 0.15)' : 'rgba(255,255,255,0.05)', 
                                                color: isLeader ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                                                border: isLeader ? '1px solid rgba(212, 193, 156, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {m.user_type?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => onEditUser(m)}
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}
                                                    title="Editar Perfil"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(m.cpf)}
                                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', cursor: 'pointer' }}
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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

const thStyle = { padding: '16px 20px', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle = { padding: '16px 20px', verticalAlign: 'middle' };

export default MembersListCMS;
