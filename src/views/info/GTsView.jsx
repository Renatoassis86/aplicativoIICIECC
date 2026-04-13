import React from 'react';
import { BookOpen, ExternalLink, Send, Info, Award, Calendar, MapPin } from 'lucide-react';
import { useContent } from '../../hooks/useContent';

const GTsView = ({ onClose }) => {
  const { content: revista } = useContent('gts', 'gts_revista_summae');
  const { content: eixos } = useContent('gts', 'gts_eixos_tematicos');
  const { content: prazos } = useContent('gts', 'gts_prazos');
  const { content: premiacoes } = useContent('gts', 'gts_premiacoes');

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', padding: 'calc(env(safe-area-inset-top, 24px) + 60px) 20px 100px' }}>
      
      {/* Título Principal */}
      <div style={{ marginBottom: '32px', textAlign: 'left' }}>
         <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>Revista e GTs</h2>
         <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Chamada II CIECC 2026</p>
      </div>

      {/* Logo CIECC */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img 
          src="/logo.png" 
          alt="CIECC" 
          style={{ 
            height: '60px', 
            marginBottom: '16px',
            filter: 'brightness(0) saturate(100%) invert(14%) sepia(85%) saturate(3015%) hue-rotate(334deg) brightness(84%) contrast(92%)' 
          }} 
        />
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Chamada para o <br/> II CIECC 2026
        </h3>
      </div>

      {/* Seção 1: Revista Summae Sapientiae */}
      {revista && (
        <section className="card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
              <BookOpen size={24} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--secondary)' }}>{revista.title}</h4>
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}
             dangerouslySetInnerHTML={{ __html: revista.description }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {revista.links?.map((link, idx) => (
              <button 
                key={idx}
                onClick={() => window.open(link.url, '_blank')}
                style={{ background: link.type === 'primary' ? 'var(--primary)' : 'var(--secondary)', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {link.type === 'primary' ? <Send size={18} /> : <ExternalLink size={18} />} {link.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Seção 2: Grupos de Trabalho (GTs) */}
      <section className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
           <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
            <Award size={24} color="var(--primary)" />
          </div>
          <h4 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--secondary)' }}>Grupos de Trabalho (GTs)</h4>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}>
          O II CIECC busca fomentar o diálogo e divulgar o conhecimento científico interdisciplinar. Contamos com duas modalidades de submissão:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F8F9FA', padding: '12px', borderRadius: '12px' }}>
              <Info size={16} color="var(--primary)" />
              <p style={{ fontSize: '12px', fontWeight: '600' }}>Artigos Completos (Publicação na Revista)</p>
           </div>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F8F9FA', padding: '12px', borderRadius: '12px' }}>
              <Info size={16} color="var(--primary)" />
              <p style={{ fontSize: '12px', fontWeight: '600' }}>Resumos para os Anais (Trabalhos em andamento)</p>
           </div>
        </div>

        {/* Listagem de GTs */}
        <h5 style={{ fontSize: '13px', fontWeight: '900', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--secondary)' }}>Eixos Temáticos:</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {eixos?.map(gt => (
            <div key={gt.n} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>GT {gt.n} - {gt.t}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{gt.d}</p>
            </div>
          ))}
        </div>

        {/* Informações Cruciais */}
        <div style={{ background: '#FFF5F5', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #FED7D7' }}>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <Calendar size={18} color="#E53E3E" />
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#C53030' }}>Prazos Importantes</p>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
             {prazos?.map((prazo, idx) => (
               <p key={idx} style={{ fontSize: '12px', color: '#742A2A', lineHeight: '1.4' }}>
                 • <strong>{prazo.label}:</strong> {prazo.value}
               </p>
             ))}
           </div>
        </div>

        <button 
          onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/chamada-congresso.html', '_blank')}
          style={{ width: '100%', background: 'var(--gold)', color: 'var(--primary)', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
          <Send size={20} /> Submissão GTs
        </button>
      </section>

      {/* Benefícios / Premiações */}
      <section className="card dark-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)', color: 'white' }}>
        <h4 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', color: 'var(--gold)' }}>Premiações (Modalidade Artigos)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {premiacoes?.map((premio, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ minWidth: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
              <p style={{ fontSize: '13px', lineHeight: '1.4' }}><strong>{premio.label}:</strong> {premio.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Localização e Footer do Edital */}
      <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px 0' }}>
        <p style={{ fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
          <MapPin size={12} /> Local: Vila Clementino - São Paulo
        </p>
        <p style={{ fontSize: '11px' }}>© 2026 II CIECC. Todos os direitos reservados.</p>
      </div>

    </div>
  );
};

export default GTsView;
