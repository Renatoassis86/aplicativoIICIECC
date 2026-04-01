import React from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Send, Info, Award, Calendar, MapPin } from 'lucide-react';

const GTsView = ({ onClose }) => {
  return (
    <div className="fixed-modal-overlay" style={{ background: '#F7F8FA' }}>
      <div className="modal-wrapper" style={{ background: '#F7F8FA' }}>
        
        {/* Header - Burgundy */}
        <header style={{ 
          padding: 'calc(env(safe-area-inset-top, 24px) + 30px) 20px 24px', 
          background: 'var(--primary)', 
          color: 'white',
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10
        }}>
           <button onClick={onClose} className="clickable" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '12px', display: 'flex' }}>
             <ArrowLeft size={24} color="white" />
           </button>
           <div>
             <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '800' }}>Revista e GTs</h2>
             <p style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>II CIECC 2026</p>
           </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 60px' }}>
          
          {/* Logo CIECC */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
          <section className="card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '4px solid var(--gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="var(--primary)" />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--secondary)' }}>Revista Summae Sapientiae</h4>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '20px' }}>
              A equipe editorial da Revista <strong>Summae Sapientiae</strong> tem o prazer de anunciar a chamada para o dossiê temático: <strong>Educação Cristã Clássica</strong>. Este número especial busca investigar as bases filosóficas, históricas e práticas desse modelo educacional.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => window.open('https://periodicos.ficv.edu.br/summaesapientiae/issue/view/9/16', '_blank')}
                style={{ background: 'var(--secondary)', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ExternalLink size={18} /> Veja a edição do CIECC 2025
              </button>
              <button 
                onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/chamada-dossie.html', '_blank')}
                style={{ background: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Send size={18} /> Chamada de artigos CIECC 2026
              </button>
            </div>
          </section>

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
              {[
                { n: 1, t: 'História da Educação Cristã Clássica', d: 'Reflexões teóricas, históricas e filosóficas.' },
                { n: 2, t: 'Educação e Virtude', d: 'Estudos sobre formação moral, caráter e ética.' },
                { n: 3, t: 'Métodos e Práticas Pedagógicas', d: 'Investigação sobre método clássico, trivium, quadrivium e línguas.' },
                { n: 4, t: 'Educação Clássica na Sociedade', d: 'Impacto na cultura contemporânea e desafios.' }
              ].map(gt => (
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
               <p style={{ fontSize: '12px', color: '#742A2A', lineHeight: '1.4' }}>
                 • <strong>Submissões até:</strong> 10/04/2026 às 23h59 <br/>
                 • <strong>Resultados:</strong> 20/04/2026 <br/>
                 • <strong>Evento:</strong> 01 e 02 de maio de 2026
               </p>
            </div>

            <button 
              onClick={() => window.open('https://cursos.ficv.edu.br/ciecc/chamada-congresso.html', '_blank')}
              style={{ width: '100%', background: 'var(--gold)', color: 'var(--primary)', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              <Send size={20} /> Submissão GTs
            </button>
          </section>

          {/* Benefícios / Premiações */}
          <section className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)', color: 'white' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', color: 'var(--gold)' }}>Premiações (Modalidade Artigos)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ minWidth: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
                <p style={{ fontSize: '13px', lineHeight: '1.4' }}><strong>Isenção de taxa:</strong> Gratuidade na inscrição para o II CIECC da FICV para autores aprovados.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ minWidth: '24px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
                <p style={{ fontSize: '13px', lineHeight: '1.4' }}><strong>Bolsa de Pós-Graduação:</strong> Os melhores artigos receberão uma Bolsa Integral para qualquer Pós da FICV.</p>
              </div>
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
      </div>
    </div>
  );
};

export default GTsView;
