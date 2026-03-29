import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Zap 
} from 'lucide-react';

const BaseSurvey = ({ steps, onComplete, themeColor = 'var(--primary)' }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const totalSteps = steps.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete(formData);
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
  const currentStepData = steps[step];

  return (
    <div className="questionnaire-screen fade-in" style={{ minHeight: '100vh', background: 'var(--bg-app)', paddingBottom: '120px' }}>
      {/* Header Institucional com Logo e Fundo Escuro */}
      <div style={{ 
        background: 'var(--secondary)', 
        padding: '20px 24px', 
        display: 'flex', 
        justifyContent: 'center',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px'
      }}>
        <img src="/logo.png" alt="CIECC" style={{ height: '45px' }} />
      </div>

      {/* Progress Header */}
      <div style={{ background: 'white', padding: '24px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color={themeColor} fill={themeColor} />
            <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{currentStepData.title}</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: themeColor }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#EDF2F7', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: themeColor, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      <main style={{ padding: '24px 20px' }}>
        {/* Motivation Card */}
        <div className="fade-in" key={step} style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `4px solid ${themeColor}` }}>
          <Star size={20} color={themeColor} fill={themeColor} />
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--secondary)', lineHeight: '1.4' }}>{currentStepData.motivation}</p>
        </div>

        {/* Render Questions */}
        <div className="fade-in" key={`content-${step}`}>
          {currentStepData.questions.map(q => (
            <div key={q.id} style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--secondary)' }}>{q.text}</label>
              
              {q.type === 'radio' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => updateData(q.id, opt)} style={{
                      padding: '16px', border: formData[q.id] === opt ? `2px solid ${themeColor}` : '1px solid var(--border)',
                      borderRadius: '12px', background: 'white', textAlign: 'left', fontWeight: '600', color: formData[q.id] === opt ? themeColor : 'var(--secondary)'
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {q.type === 'select' && (
                <select 
                  className="input-field"
                  value={formData[q.id] || ''}
                  onChange={(e) => updateData(q.id, e.target.value)}
                  style={{ background: 'white' }}
                >
                  <option value="">Selecione...</option>
                  {q.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === 'autocomplete' && (
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="Comece a digitar..."
                    value={formData[q.id] || ''}
                    list={`list-${q.id}`}
                    onChange={(e) => updateData(q.id, e.target.value)}
                  />
                  <datalist id={`list-${q.id}`}>
                    {q.options.map(opt => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              )}

              {q.type === 'checkbox' && (
// ... (keep the rest)
                <div style={{ display: 'grid', gap: '12px' }}>
                  {q.options.map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'white' }}>
                      <input type="checkbox" onChange={(e) => {
                        const current = formData[q.id] || [];
                        updateData(q.id, e.target.checked ? [...current, opt] : current.filter(x => x !== opt));
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'ranking' && (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[1, 2, 3].map(pos => (
                    <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '800', color: themeColor }}>{pos}º</span>
                      <select 
                        onChange={(e) => {
                          const current = formData[q.id] || {};
                          updateData(q.id, { ...current, [pos]: e.target.value });
                        }}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
                      >
                        <option value="">Selecione um fator...</option>
                        {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'text' || q.type === 'email' || q.type === 'tel' ? (
                <input type={q.type} className="input-field" placeholder="Digite aqui..." onChange={(e) => updateData(q.id, e.target.value)} />
              ) : null}

              {q.type === 'scale' && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => updateData(q.id, opt)} style={{
                      padding: '12px', border: formData[q.id] === opt ? `2px solid ${themeColor}` : '1px solid var(--border)',
                      borderRadius: '8px', background: 'white', textAlign: 'left', fontSize: '14px'
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {q.type === 'range' && (
                <div style={{ textAlign: 'center' }}>
                  <input type="range" min={q.min} max={q.max} onChange={(e) => updateData(q.id, e.target.value)} style={{ width: '100%', accentColor: themeColor }} />
                  <p style={{ fontSize: '24px', fontWeight: '800', color: themeColor, marginTop: '8px' }}>{formData[q.id] || 5}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sticky Actions */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: 'white', display: 'flex', gap: '12px', borderTop: '1px solid var(--border)' }}>
          {step > 0 && (
            <button onClick={handleBack} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={18} /> Voltar
            </button>
          )}
          <button onClick={handleNext} className="btn-primary" style={{ flex: 2, background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {step === totalSteps - 1 ? 'Finalizar Questionário' : 'Continuar'} 
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default BaseSurvey;
