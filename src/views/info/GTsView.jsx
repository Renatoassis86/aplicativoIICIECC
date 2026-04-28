import { ArrowLeft, BookOpen, ExternalLink, Send, Award, Calendar, Mail, FileText, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const URL_REVISTA   = 'https://periodicos.ficv.edu.br/summaesapientiae/issue/view/9/16';
const URL_SUBMISSAO = 'https://periodicos.ficv.edu.br/index.php/summaesapientiae/user/register';
const URL_CHAMADA   = 'https://cursos.ficv.edu.br/ciecc/chamada-congresso.html';
const EMAIL_RESUMOS = 'congresso@ficv.edu.br';

const GTS = [
  { n: 1, t: 'História da Educação Cristã Clássica', d: 'Reflexões teóricas, históricas e filosóficas.' },
  { n: 2, t: 'Educação e Virtude', d: 'Estudos sobre formação moral, caráter e ética.' },
  { n: 3, t: 'Métodos e Práticas Pedagógicas', d: 'Trivium, quadrivium, método clássico e línguas.' },
  { n: 4, t: 'Educação Clássica na Sociedade', d: 'Impacto na cultura contemporânea e desafios.' },
];

const EIXOS_TEMATICOS = [
  'Fundamentos da Educação Cristã Clássica',
  'Educação Cristã Clássica no Brasil: em casa e na escola',
  'As Sete Artes Liberais e a formação intelectual',
  'Diferenças entre a Educação Moderna e a Educação Clássica',
  'Filosofia da Educação e sua relação com a Tradição Cristã',
  'O estudo das línguas no ensino clássico',
];

const Accordion = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
      >
        <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ flex: 1, fontSize: '15px', fontWeight: '900', color: 'var(--secondary)' }}>{title}</span>
        {open ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--primary)" />}
      </button>
      {open && <div style={{ padding: '0 20px 20px' }}>{children}</div>}
    </div>
  );
};

const BtnPrimary = ({ label, icon, url, color }) => (
  <button
    onClick={() => window.open(url, '_blank')}
    style={{ width: '100%', background: color || 'var(--primary)', color: 'white', padding: '16px', borderRadius: '14px', fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '10px' }}
  >
    {icon} {label}
  </button>
);

export default function GTsView({ onClose }) {
  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: 'calc(env(safe-area-inset-top, 24px) + 12px) 20px 14px',
        background: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <button onClick={onClose} style={{ padding: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', border: 'none', display: 'flex', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: 'white', margin: 0 }}>Revista & Submissões</h2>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>II CIECC 2026</p>
        </div>
      </header>

      <div style={{ padding: 'calc(env(safe-area-inset-top, 24px) + 76px) 20px 100px' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #4A101D 0%, #2d0a12 100%)', borderRadius: '24px', padding: '28px 24px', marginBottom: '24px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(212,193,156,0.08)' }} />
          <img src="/logo.png" alt="CIECC" style={{ height: '44px', marginBottom: '16px', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          <h3 style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'var(--font-serif)', color: '#D4C19C', marginBottom: '8px', lineHeight: '1.3' }}>
            Chamada para o<br />II CIECC 2026
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '20px' }}>
            1 e 2 de Maio de 2026 · Rua Loefgren, 1279 · Vila Clementino, São Paulo
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.open(URL_CHAMADA, '_blank')} style={{ flex: 1, background: '#D4C19C', color: '#4A101D', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FileText size={15} /> EDITAL COMPLETO
            </button>
            <button onClick={() => window.open(URL_REVISTA, '_blank')} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <BookOpen size={15} /> VER REVISTA
            </button>
          </div>
        </div>

        {/* ── REVISTA SUMMAE SAPIENTIAE ── */}
        <Accordion title="Revista Summae Sapientiae" icon={<BookOpen size={18} color="var(--primary)" />} defaultOpen={true}>
          <div style={{ background: '#FFFBF0', border: '1px solid #F6E9C4', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--secondary)', fontWeight: '600', lineHeight: '1.5', textAlign: 'center' }}>
              "O homem nobre dedica seus esforços às raízes."<br />
              <span style={{ fontSize: '12px', opacity: 0.7 }}>— Confúcio, Analectos, i. 2</span>
            </p>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '14px' }}>
            A equipe editorial da <strong>Revista Summae Sapientiae</strong> anuncia a chamada para o dossiê temático <strong>Educação Cristã Clássica</strong>. Este número especial investiga as bases filosóficas, históricas e práticas desse modelo educacional fundamentado na Tradição, na virtude e na busca pela verdade.
          </p>

          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '16px' }}>
            Este dossiê convida pesquisadores e profissionais das áreas de Educação, Filosofia, Teologia e Pedagogia a submeterem artigos sobre:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {EIXOS_TEMATICOS.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F8F9FA', padding: '10px 12px', borderRadius: '10px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '13px', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '600' }}>{e}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Calendar size={16} color="#C53030" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#C53030', fontWeight: '800' }}>
              Prazo para submissão: <strong>10 de abril de 2026</strong>
            </p>
          </div>

          <BtnPrimary label="VISUALIZAR EDIÇÃO ATUAL" icon={<ExternalLink size={16} />} url={URL_REVISTA} color="#D4A017" />
          <BtnPrimary label="SUBMETER ARTIGO (REVISTA)" icon={<Send size={16} />} url={URL_SUBMISSAO} />
          <BtnPrimary label="EDITAL DOSSIÊ TEMÁTICO" icon={<FileText size={16} />} url={URL_CHAMADA} color="var(--secondary)" />
        </Accordion>

        {/* ── GRUPOS DE TRABALHO ── */}
        <Accordion title="Grupos de Trabalho (GTs)" icon={<Award size={18} color="var(--primary)" />} defaultOpen={true}>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '20px' }}>
            O II CIECC proporciona espaço para apresentação e comunicação dos <strong>Grupos de Trabalho (GTs)</strong>. Você pode participar presencialmente e submeter trabalhos online. Os aceitos serão publicados nos Anais do Congresso.
          </p>

          <h5 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px' }}>Eixos Temáticos</h5>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {GTS.map(gt => (
              <div key={gt.n} style={{ padding: '14px 16px', background: '#F8F9FA', borderRadius: '14px', borderLeft: '4px solid var(--primary)' }}>
                <p style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', marginBottom: '2px' }}>GT {gt.n} — {gt.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{gt.d}</p>
              </div>
            ))}
          </div>

          <BtnPrimary label="SUBMISSÃO VIA EDITAL COMPLETO" icon={<Send size={16} />} url={URL_CHAMADA} color="#D4A017" />
        </Accordion>

        {/* ── MODALIDADES ── */}
        <Accordion title="Modalidades de Submissão" icon={<FileText size={18} color="var(--primary)" />}>

          {/* Artigos */}
          <div style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '14px', marginBottom: '24px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>📄 Artigos Científicos Completos</h5>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '12px' }}>
              Submeter exclusivamente pelo site da Revista Summae Sapientiae. Artigos aprovados são publicados na Revista e os autores recebem <strong>inscrição gratuita</strong> no Congresso.
            </p>
            <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.6' }}>
              Máx. 9.000 palavras · Times New Roman 12 · Normas ABNT
            </div>
            <BtnPrimary label="SUBMETER ARTIGO CIENTÍFICO" icon={<Send size={15} />} url={URL_SUBMISSAO} />
          </div>

          {/* Resumos */}
          <div style={{ borderLeft: '4px solid var(--gold)', paddingLeft: '14px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>📝 Resumos para os Anais</h5>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '12px' }}>
              Submissão gratuita e exclusivamente por e-mail. Somente autores individuais. Avaliação às cegas.
            </p>
            <div style={{ background: '#FFFBF0', border: '1px solid #F6E9C4', padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '800', marginBottom: '8px' }}>No e-mail, informe:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Nome completo', 'Título do resumo', 'Cidade', 'Telefone (WhatsApp)'].map((item, i) => (
                  <p key={i} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {item}</p>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', marginTop: '10px' }}>
                Assunto: "SUBMISSÃO RESUMO - CONGRESSO 2025: SOBRENOME"
              </p>
            </div>
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>Máx. 3.000 palavras · Estrutura:</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Introdução → Objetivo → Metodologia → Resultados → Conclusão → Referências</p>
            </div>
            <button
              onClick={() => window.open(`mailto:${EMAIL_RESUMOS}?subject=SUBMISSÃO RESUMO - CONGRESSO 2025`, '_blank')}
              style={{ width: '100%', background: 'var(--gold)', color: '#4A101D', padding: '14px', borderRadius: '12px', fontSize: '13px', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0' }}
            >
              <Mail size={16} /> ENVIAR RESUMO POR E-MAIL
            </button>
          </div>
        </Accordion>

        {/* ── PREMIAÇÕES ── */}
        <Accordion title="Premiações" icon={<Gift size={18} color="var(--primary)" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'linear-gradient(135deg, #4A101D 0%, #6B141A 100%)', borderRadius: '16px', padding: '18px', color: 'white' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>🎟️</span>
                <div>
                  <p style={{ fontWeight: '900', fontSize: '14px', color: '#D4C19C', marginBottom: '6px' }}>Isenção de Taxa</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Autores de Artigos Científicos aprovados recebem <strong>inscrição gratuita</strong> no II CIECC 2026.
                  </p>
                </div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #744210 0%, #975a16 100%)', borderRadius: '16px', padding: '18px', color: 'white' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>🏆</span>
                <div>
                  <p style={{ fontWeight: '900', fontSize: '14px', color: '#F6E05E', marginBottom: '6px' }}>Bolsa de Pós-Graduação</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                    Os autores dos <strong>melhores artigos</strong> recebem bolsa integral para qualquer Pós-Graduação ativa da FICV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Accordion>

        {/* ── PRAZOS ── */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
            <Calendar size={20} color="var(--primary)" />
            <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--secondary)' }}>Prazos Importantes</h4>
          </div>
          {[
            { label: 'Submissão de trabalhos', value: '10 de abril de 2026' },
            { label: 'Divulgação de resultados', value: '20 de abril de 2026' },
            { label: 'Realização do Congresso', value: '1 e 2 de maio de 2026' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)' }}>{p.value}</span>
            </div>
          ))}
        </div>

        {/* ── BOTÕES FINAIS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px' }}>
          <BtnPrimary label="SUBMETER ARTIGO (REVISTA)" icon={<Send size={16} />} url={URL_SUBMISSAO} />
          <BtnPrimary label="VER EDITAL CONGRESSO COMPLETO" icon={<ExternalLink size={16} />} url={URL_CHAMADA} color="var(--secondary)" />
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>
          © 2026 II CIECC · Faculdade Internacional Cidade Viva
        </p>
      </div>
    </div>
  );
}
