import React from 'react';
import { UserCircle, School, GraduationCap, Users, Heart, ArrowRight } from 'lucide-react';

const UserTypeSelectionView = ({ onSelect }) => {
  const types = [
    { id: 'organizador', label: 'Organizador / Staff', icon: <UserCircle size={24} />, category: 'general' },
    { id: 'apoio', label: 'Apoio / Voluntário', icon: <Heart size={24} />, category: 'general' },
    { id: 'mantenedor', label: 'Mantenedor de escola', icon: <School size={24} />, category: 'school' },
    { id: 'gestor', label: 'Gestor de escola', icon: <School size={24} />, category: 'school' },
    { id: 'diretor', label: 'Diretor de escola', icon: <School size={24} />, category: 'school' },
    { id: 'coordenador', label: 'Coordenador de escola', icon: <School size={24} />, category: 'school' },
    { id: 'aluno_ficv', label: 'Aluno da FICV', icon: <GraduationCap size={24} />, category: 'general' },
    { id: 'pai_parceira', label: 'Pai/Mãe de Escola parceira Cidade Viva Education', icon: <Users size={24} />, category: 'general' },
    { id: 'colaborador_cv', label: 'Colaborador do Sistema Cidade Viva', icon: <Heart size={24} />, category: 'general' },
    { id: 'familia_educadora', label: 'Família educadora (Homeschooling/Afterschooling)', icon: <Users size={24} />, category: 'general' },
    { id: 'academico', label: 'Acadêmico ou professor de outra Instituição de Ensino Superior', icon: <GraduationCap size={24} />, category: 'general' },
    { id: 'professor_basico', label: 'Professor de Escola de Ensino Básico', icon: <Users size={24} />, category: 'general' },
    { id: 'servo_kids', label: 'Servo da Rede Kids/Membro (Igreja Cidade Viva)', icon: <Heart size={24} />, category: 'general' },
    { id: 'lider_infantil', label: 'Líderes de Escola Bíblica e Voluntários de ministério infantil (outras igrejas)', icon: <Users size={24} />, category: 'general' },
  ];

  return (
    <div className="select-type-screen fade-in" style={{
      minHeight: '100vh',
      background: 'white',
      paddingBottom: '100px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Institucional com Logo e Fundo Escuro */}
      <div style={{ 
        background: 'var(--secondary)', 
        padding: '30px 24px', 
        display: 'flex', 
        justifyContent: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '32px'
      }}>
        <img src="/logo.png" alt="CIECC" style={{ height: '55px' }} />
      </div>

      <header style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--secondary)', lineHeight: '1.2' }}>
          Qual é o tipo de <span style={{ color: 'var(--primary)' }}>sua inscrição?</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
          Essa informação nos ajuda a personalizar sua experiência no Hub.
        </p>
      </header>

      <div style={{ display: 'grid', gap: '12px' }}>
        {types.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              background: 'var(--accent)', 
              padding: '10px', 
              borderRadius: '12px', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {type.icon}
            </div>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--secondary)' }}>
              {type.label}
            </span>
            <ArrowRight size={18} color="#CBD5E0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserTypeSelectionView;
