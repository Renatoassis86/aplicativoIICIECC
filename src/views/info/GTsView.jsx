import React from 'react';
import { ArrowLeft, BookOpen, GraduationCap, Users, Globe, Calendar, CheckCircle, FileText } from 'lucide-react';

const GTsView = ({ onClose }) => {
  const gts = [
    {
      id: 1,
      title: 'GT 1 - História da Educação Cristã Clássica',
      description: 'Reflexões teóricas, históricas e filosóficas sobre a educação clássica e sua relação com a tradição cristã.',
      icon: <Globe size={24} color="#D81E1E" />
    },
    {
      id: 2,
      title: 'GT 2 - Educação e Virtude',
      description: 'Estudos sobre a formação moral, caráter e ética na educação clássica cristã.',
      icon: <GraduationCap size={24} color="#D69E2E" />
    },
    {
      id: 3,
      title: 'GT 3 - Métodos e Práticas Pedagógicas',
      description: 'Investigação sobre o método de ensino clássico, as sete artes liberais e também o estudo de línguas na educação clássica.',
      icon: <BookOpen size={24} color="#2B6CB0" />
    },
    {
      id: 4,
      title: 'GT 4 - Educação Clássica na Sociedade',
      description: 'Impacto da educação cristã clássica na cultura contemporânea e desafios para sua implementação.',
      icon: <Users size={24} color="#38A169" />
    }
  ];

  return (
    <div className="fixed-modal-overlay" style={{ background: '#F7F8FA' }}>
      <div className="modal-wrapper" style={{ background: '#F7F8FA' }}>
        <header style={{
          padding: 'env(safe-area-inset-top, 40px) 20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--secondary)',
          color: 'white',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10
        }}>
          <button onClick={onClose} className="clickable" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex' }}>
            <ArrowLeft size={24} color="white" />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)' }}>GTs do Congresso</h2>
            <p style={{ fontSize: '11px', opacity: 0.7, fontWeight: '600' }}>SUBMISSÃO DE TRABALHOS</p>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>Summae Sapientiae</h3>
            <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.5' }}>
              Uma oportunidade de apresentar pesquisas e reflexões que preservam a tradição intelectual cristã.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gts.map(gt => (
              <div key={gt.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ minWidth: '40px', height: '40px', borderRadius: '10px', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {gt.icon}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '4px' }}>{gt.title}</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-main)', opacity: 0.8 }}>{gt.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
             <button onClick={() => window.open('mailto:contato@ciecc.com.br', '_blank')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               SUBMETER TRABALHO <CheckCircle size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTsView;
