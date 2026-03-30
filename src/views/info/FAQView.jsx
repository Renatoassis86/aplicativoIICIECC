import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';

const FAQView = ({ onClose }) => {
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      id: 1,
      question: "O que é o II CIECC?",
      answer: "É o II Congresso Internacional de Educação Cristã Clássica, um fórum de excelência dedicado à discussão, disseminação e consolidação das raízes históricas e do futuro da educação clássica no Brasil."
    },
    {
      id: 2,
      question: "Onde e quando o evento será realizado?",
      answer: "Nos dias 01 e 02 de maio de 2026, na Rua Loefgren, 1279, Vila Clementino - SP, próximo ao Metrô Santa Cruz."
    },
    {
      id: 3,
      question: "Quem são os palestrantes confirmados?",
      answer: "O evento contará com nomes como Dr. Chris Schlect, Dr. Keith Nix, Ms. Thiago Dutra, Esp. Maurício Fonseca, Ms. Elmer Pires, Esp. Matheus Macedo e Rosely Garcia."
    },
    {
      id: 4,
      question: "O que é o Fórum de Líderes?",
      answer: "É um momento especial na manhã do dia 02/05, focado em diretores, proprietários e mantenedores de escolas cristãs, tratando de forma prática a gestão e os desafios do setor."
    },
    {
      id: 5,
      question: "Como chegar ao local do evento?",
      answer: "O local fica a apenas 8 minutos a pé da estação Santa Cruz (Linhas 1-Azul e 5-Lilás do Metrô). Também há fácil acesso via apps de transporte."
    },
    {
      id: 6,
      question: "Há sugestões de hospedagem próximas?",
      answer: "Sim: Transamerica Executive Vila Clementino (5 min a pé), Green Place Ibirapuera (6 min a pé) e Grand Mercure SP Ibirapuera (10 min de carro)."
    },
    {
      id: 7,
      question: "Qual o público-alvo do congresso?",
      answer: "Educadores, pesquisadores, líderes escolares, pais e todos os interessados na Tradição Clássica e na Educação Cristã."
    },
    {
      id: 8,
      question: "Como posso realizar minha inscrição?",
      answer: "As inscrições são feitas diretamente pelo portal oficial: cursos.ficv.edu.br/ciecc/. No App, você pode acompanhar a agenda e interagir com congressistas."
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div className="modal-content slide-up" style={{ 
        height: '92vh', 
        borderRadius: '24px 24px 0 0', 
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 20px', 
          background: 'white', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'var(--secondary)' }}>FAQ & Suporte</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tire suas dúvidas sobre o evento</p>
          </div>
          <button onClick={onClose} style={{ padding: '8px', background: '#F7FAFC', borderRadius: '50%' }}>
            <X size={24} color="var(--secondary)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            <input 
              type="text" 
              placeholder="Pesquisar dúvida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: '#F8F9FA',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredFaqs.map(faq => (
              <div 
                 key={faq.id} 
                 className="card" 
                 style={{ 
                   padding: '16px', 
                   cursor: 'pointer',
                   border: activeId === faq.id ? '1px solid var(--primary)' : '1px solid transparent'
                 }}
                 onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)', flex: 1, paddingRight: '12px' }}>
                    {faq.question}
                  </p>
                  {activeId === faq.id ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
                {activeId === faq.id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', opacity: 0.8 }}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="card" style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: 'var(--secondary)', 
            color: 'white',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MessageCircle size={32} color="var(--gold)" />
            <h4 style={{ fontSize: '16px', fontWeight: '800' }}>Não encontrou o que procurava?</h4>
            <p style={{ fontSize: '13px', opacity: 0.7 }}>Nossa equipe está online para te ajudar agora mesmo.</p>
            <button 
              onClick={() => window.open('https://wa.me/558393322457', '_blank')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--gold)',
                color: 'var(--secondary)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                marginTop: '12px'
              }}
            >
              FALAR COM SUPORTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQView;
