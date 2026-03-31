import React from 'react';
import { X, BookOpen, GraduationCap, Users, Globe, Calendar, CheckCircle, FileText } from 'lucide-react';

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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'white',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <header style={{
        padding: 'env(safe-area-inset-top, 20px) 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '12px' }}>
            <BookOpen size={20} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>
              Grupos de Trabalho
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Summae Sapientiae
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-app)', border: 'none', padding: '8px', borderRadius: '50%' }}>
          <X size={20} color="var(--text-main)" />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Banner de Chamada */}
        <div style={{
          background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: 'white',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '10px', fontWeight: '800', background: 'var(--gold)', color: 'var(--secondary)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Submissão de Artigos
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '12px 0 8px' }}>
              Summae Sapientiae
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.5' }}>
              Uma oportunidade de apresentar pesquisas e reflexões que preservam, aprofundam e fortalecem a tradição intelectual e o pensamento cristão.
            </p>
          </div>
          <FileText size={80} color="white" style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.1 }} />
        </div>

        <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
          Eixos Temáticos (GTs)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {gts.map(gt => (
            <div key={gt.id} className="card" style={{ padding: '20px', borderLeft: `4px solid ${gt.icon.props.color}` }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {gt.icon}
                </div>
                <div>
                  <h5 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '8px', lineHeight: '1.2' }}>{gt.title}</h5>
                  <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', opacity: 0.8 }}>{gt.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', padding: '24px', background: 'var(--bg-app)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" /> Prazos Importantes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>Fim das Submissões</span>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>10/04/2026 - 23h59</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>Resultados</span>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>20/04/2026</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>Apresentação no Congresso</span>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800' }}>01 e 02 de Maio</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', paddingBottom: '40px' }}>
           <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
             Os resumos devem seguir as normas de submissão oficiais.
           </p>
           <button style={{ 
             width: '100%', 
             padding: '16px', 
             borderRadius: '16px', 
             background: 'var(--primary)', 
             color: 'white', 
             border: 'none', 
             fontWeight: '800',
             fontSize: '14px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '8px',
             boxShadow: '0 8px 16px rgba(216,30,30,0.2)'
           }} onClick={() => window.open('mailto:contato@ciecc.com.br', '_blank')}>
             SUBMETER MEU TRABALHO <CheckCircle size={18} />
           </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      ` }} />
    </div>
  );
};

export default GTsView;
