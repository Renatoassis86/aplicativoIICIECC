import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Lock, 
  Clock, 
  MapPin, 
  User,
  ExternalLink,
  FileText
} from 'lucide-react';
import { fetchSessionMaterials, isSessionLiveOrFinished } from '../../services/agenda/agendaService';

const SessionDetailModal = ({ isOpen, onClose, session, isFavorite, onToggleFavorite }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (isOpen && session) {
      loadMaterials();
      setIsLive(isSessionLiveOrFinished(session.date, session.time));
    }
  }, [isOpen, session]);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await fetchSessionMaterials(session.id);
    setMaterials(data);
    setLoading(false);
  };

  if (!isOpen || !session) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 100000000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        background: 'white',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header Image/Pattern */}
        <div style={{ 
          height: '140px', 
          background: 'var(--primary)', 
          position: 'relative',
          padding: '24px',
          flexShrink: 0
        }}>
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', top: '16px', right: '16px', 
              background: 'rgba(255,255,255,0.2)', border: 'none', 
              borderRadius: '50%', padding: '10px', color: 'white', 
              cursor: 'pointer', display: 'flex'
            }}
          >
            <X size={20} />
          </button>

          <button 
            onClick={() => onToggleFavorite(session.id)}
            style={{ 
              position: 'absolute', top: '16px', left: '16px', 
              background: isFavorite ? 'var(--gold)' : 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '20px', padding: '8px 16px', color: isFavorite ? 'var(--secondary)' : 'white', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '11px', fontWeight: '900', transition: 'all 0.3s'
            }}
          >
            <Heart size={16} fill={isFavorite ? 'var(--secondary)' : 'none'} />
            {isFavorite ? 'NA MINHA AGENDA' : 'ADICIONAR À AGENDA'}
          </button>
          
          <span style={{ 
            background: 'var(--gold)', color: 'var(--secondary)', 
            padding: '4px 12px', borderRadius: '20px', 
            fontSize: '11px', fontWeight: '800', 
            textTransform: 'uppercase' 
          }}>
            {session.category}
          </span>
          <h2 style={{ 
            color: 'white', fontSize: '24px', fontWeight: '900', 
            fontFamily: 'var(--font-serif)', marginTop: '8px',
            lineHeight: '1.2'
          }}>
            {session.title}
          </h2>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Info Grid */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: '1fr 1fr', 
            gap: '16px', marginBottom: '32px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '10px' }}>
                <Clock size={16} />
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Horário</p>
                <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{session.time}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '10px' }}>
                <MapPin size={16} />
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Local</p>
                <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{session.room}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '16px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <User size={20} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Palestrante</p>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{session.speaker || session.name}</p>
            </div>
          </div>

          {/* Repository Section */}
          <div style={{ borderTop: '2px solid #F1F5F9', paddingTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--secondary)' }}>Materiais Didáticos</h3>
              <span style={{ fontSize: '12px', color: isLive ? 'var(--gold)' : '#94A3B8', fontWeight: '800' }}>
                {isLive ? '• DISPONÍVEL' : '• EM BREVE'}
              </span>
            </div>

            {!isLive ? (
              <div style={{ 
                padding: '32px 24px', 
                background: '#F1F5F9', 
                borderRadius: '24px', 
                textAlign: 'center',
                border: '1.5px dashed #CBD5E1'
              }}>
                <Lock size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', lineHeight: '1.4' }}>
                  Os materiais estarão disponíveis <br/> no início desta sessão ({session.time}).
                </p>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Carregando materiais...</div>
            ) : materials.length === 0 ? (
              <div style={{ 
                padding: '32px 24px', background: '#F8FAFC', borderRadius: '24px', textAlign: 'center', color: '#94A3B8'
              }}>
                <FileText size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px', fontWeight: '600' }}>Nenhum material anexado.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {materials.map(mat => (
                  <a 
                    key={mat.id}
                    href={mat.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', 
                      padding: '16px', background: 'white', borderRadius: '16px', 
                      border: '1px solid #E2E8F0', textDecoration: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ padding: '10px', background: 'var(--primary)15', color: 'var(--primary)', borderRadius: '12px' }}>
                      <Download size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--secondary)' }}>{mat.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clique para visualizar/baixar</p>
                    </div>
                    <ExternalLink size={16} color="#CBD5E1" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ padding: '20px 24px', background: '#F8FAFC', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
            &copy; 2026 II CIECC • Conteúdo restrito para congressistas.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SessionDetailModal;
