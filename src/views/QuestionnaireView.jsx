import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  School,
  FileText,
  BarChart3,
  ThumbsUp
} from 'lucide-react';

const QuestionnaireView = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const totalSteps = 9; // Blocos 0 a 8

  // Frases motivacionais por passo
  const motivations = [
    "Vamos começar! Sua experiência no 1º congresso é muito importante.",
    "Ótimo! Agora vamos te identificar melhor.",
    "Incrível! Queremos conhecer o perfil da sua instituição.",
    "Excelente progresso! Vamos entender sua visão pedagógica.",
    "Você está indo muito bem! O que influencia suas escolhas?",
    "Quase na reta final! Vamos falar sobre investimentos.",
    "Sua opinião sincera nos ajuda a crescer.",
    "Apenas mais dois passos! Como você nos recomenda?",
    "Último passo! Seu interesse em soluções futuras é vital."
  ];

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const updateData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="questionnaire-screen fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      paddingBottom: '100px'
    }}>
      {/* Gamified Header */}
      <div style={{ 
        background: 'white', 
        padding: '24px 20px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--accent)', padding: '6px', borderRadius: '8px' }}>
              <Zap size={18} color="var(--primary)" fill="var(--primary)" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Progresso do Perfil
            </span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#EDF2F7', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: 'var(--primary)', 
            borderRadius: '10px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}></div>
        </div>
      </div>

      <main style={{ padding: '24px 20px' }}>
        {/* Step Indicator */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: 'var(--secondary)', 
            color: 'white', 
            padding: '4px 12px', 
            borderRadius: '50px', 
            fontSize: '11px', 
            fontWeight: '700' 
          }}>
            PASSO {step + 1} DE {totalSteps}
          </div>
        </div>

        {/* Motivational Card */}
        <div className="fade-in" key={step} style={{ 
          background: 'var(--accent)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '24px',
          border: '1px solid rgba(216,30,30,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Star size={20} color="var(--primary)" fill="var(--primary)" />
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', lineHeight: '1.4' }}>
            {motivations[step]}
          </p>
        </div>

        {/* Form Sections */}
        <div className="fade-in" key={`content-${step}`}>
          {step === 0 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bloco 0: Elegibilidade</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Sua instituição participou do 1º Congresso Internacional de Educação Cristã Clássica?</p>
              <div style={{ display: 'grid', gap: '12px' }}>
                {['Sim', 'Não'].map(opt => (
                  <button key={opt} onClick={() => updateData('participou_anterior', opt)} style={{
                    padding: '16px', border: formData.participou_anterior === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '12px', background: formData.participou_anterior === opt ? 'var(--accent)' : 'white',
                    textAlign: 'left', fontWeight: '600', color: formData.participou_anterior === opt ? 'var(--primary)' : 'var(--secondary)'
                  }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bloco 1: Identificação</h3>
              <div className="input-group">
                <label className="input-label">Cargo/Função na Instituição</label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {['Mantenedor(a)', 'Diretor(a)', 'Coordenador(a)', 'Professor(a)', 'Administrativo', 'Outro'].map(opt => (
                    <button key={opt} onClick={() => updateData('cargo', opt)} style={{
                      padding: '12px', border: formData.cargo === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '8px', background: formData.cargo === opt ? 'var(--accent)' : 'white',
                      textAlign: 'left', fontSize: '14px'
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label className="input-label">Nome da Instituição</label>
                <input type="text" className="input-field" placeholder="Ex: Escola Cristã Esperança" onChange={(e) => updateData('escola_nome', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Bloco 2: Perfil Institucional</h3>
              <label className="input-label">Tempo de funcionamento</label>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Menos de 1 ano', '1 a 5 anos', '6 a 10 anos', 'Mais de 10 anos'].map(opt => (
                  <button key={opt} onClick={() => updateData('tempo_escola', opt)} style={{
                    padding: '12px', border: formData.tempo_escola === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px', background: formData.tempo_escola === opt ? 'var(--accent)' : 'white',
                    textAlign: 'left', fontSize: '14px'
                  }}>{opt}</button>
                ))}
              </div>
              <div style={{ marginTop: '20px' }}>
                <label className="input-label">Confessionalidade Cristã</label>
                {['Escola cristã confessional', 'Em transição', 'Em estudo', 'Não considerado'].map(opt => (
                  <button key={opt} onClick={() => updateData('confessionalidade', opt)} style={{
                    display: 'block', width: '100%', marginBottom: '8px', padding: '12px', border: '1px solid var(--border)',
                    borderRadius: '8px', textAlign: 'left', fontSize: '13px'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Modelo Pedagógico</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>“Nossa escola possui clareza e alinhamento institucional quanto à cosmovisão cristã aplicada ao currículo.”</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'].map(opt => (
                  <button key={opt} onClick={() => updateData('concordancia_cosmovisao', opt)} style={{
                    padding: '12px', border: formData.concordancia_cosmovisao === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px', textAlign: 'left', fontSize: '14px'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Fatores de Escolha</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Quais fatores mais influenciam a escolha de um sistema de ensino?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {['Qualidade acadêmica', 'Coerência teológica', 'Material didático', 'Suporte aos professores', 'Reputação', 'Preço'].map(opt => (
                  <label key={opt} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <input type="checkbox" onChange={(e) => {
                      const current = formData.fatores_escolha || [];
                      const next = e.target.checked ? [...current, opt] : current.filter(x => x !== opt);
                      updateData('fatores_escolha', next);
                    }} />
                    <span style={{ fontSize: '14px' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="block">
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Investimento</h3>
              <p className="input-label">Quanto investe por aluno/ano em livros?</p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Até R$ 500', 'R$ 500 a R$ 1.000', 'Mais de R$ 1.000', 'Prefiro não responder'].map(opt => (
                  <button key={opt} onClick={() => updateData('investimento_livros', opt)} style={{
                    padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', fontSize: '14px'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {step >= 6 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Trophy size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3>Quase lá!</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Os blocos finais de satisfação e recomendação estão prontos. Vamos finalizar seu perfil?</p>
              <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
                 <div className="input-group">
                    <label className="input-label">Nível de Interesse em solução completa</label>
                    {['Muito interesse', 'Interesse moderado', 'Pouco interesse', 'Nenhum'].map(opt => (
                      <button key={opt} className="btn-primary" style={{ background: 'white', color: 'var(--secondary)', border: '1px solid var(--border)', marginBottom: '8px', fontSize: '14px' }}>
                        {opt}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '20px', 
          background: 'white', 
          boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '12px'
        }}>
          {step > 0 && (
            <button onClick={handleBack} style={{ 
              flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', 
              fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <ArrowLeft size={18} /> Voltar
            </button>
          )}
          <button onClick={handleNext} className="btn-primary" style={{ 
            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
          }}>
            {step === totalSteps - 1 ? 'Finalizar Questionário' : 'Continuar'} 
            {step === totalSteps - 1 ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuestionnaireView;
