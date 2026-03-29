import React, { useState } from 'react';
import { 
  PlayCircle, 
  Camera, 
  Video, 
  Tv, 
  Images, 
  Mic2, 
  ChevronRight,
  MonitorPlay
} from 'lucide-react';

const MediaTab = () => {
  const sections = [
    { label: 'Fotos do Evento', icon: <Images size={20} />, count: '124 fotos', color: '#FDF2F2' },
    { label: 'Entrevistas', icon: <Mic2 size={20} />, count: '8 vídeos', color: '#EBF8FF' },
    { label: 'Palestras Gravadas', icon: <MonitorPlay size={20} />, count: '4 coberturas', color: '#F0FFF4' },
    { label: 'Galeria Institucional', icon: <Tv size={20} />, count: '15 fotos', color: '#FAF5FF' },
  ];

  const highlights = [
    { id: 1, title: 'Resumo Dia 1', date: '28 Março', dur: '03:45', type: 'video' },
    { id: 2, title: 'Depoimentos de Congressistas', date: '29 Março', dur: '12:10', type: 'interview' }
  ];

  return (
    <div className="tab-content fade-in" style={{ padding: '0 0 40px' }}>
      <header style={{ 
        padding: '24px 20px', 
        background: 'white', 
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'var(--font-serif)' }}>Mídia</h2>
      </header>

      {/* Live Stream Section */}
      <section style={{ padding: '20px' }}>
        <div style={{ 
          background: 'var(--secondary)', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden', 
          position: 'relative' 
        }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              position: 'absolute', 
              top: '16px', 
              left: '16px', 
              background: 'var(--primary)', 
              padding: '4px 10px', 
              borderRadius: '4px', 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '700', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              zIndex: 10
            }}>
              <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
              LIVE • AUDITÓRIO PRINCIPAL
            </div>
            <PlayCircle size={64} color="rgba(255,255,255,0.4)" />
          </div>
          <div style={{ padding: '16px', color: 'white' }}>
            <p style={{ fontSize: '15px', fontWeight: '700' }}>Painel: O Futuro da Educação Cristã</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Iniciado há 15 minutos • Cobertura ao Vivo</p>
          </div>
        </div>
      </section>

      {/* Gallery Sections Grid */}
      <section style={{ padding: '0 20px 24px' }}>
        <h4 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>Categorias</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {sections.map(sec => (
            <div key={sec.label} className="card" style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              background: 'white'
            }}>
              <div style={{ 
                background: sec.color, 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--secondary)',
                opacity: 0.8
              }}>
                {sec.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{sec.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sec.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Videos/Interviews */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '700', fontSize: '16px' }}>Destaques</h4>
          <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '600' }}>Ver tudo</span>
        </div>
        
        {highlights.map(item => (
          <div key={item.id} className="card" style={{ padding: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '80px', height: '60px', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={20} color="var(--primary)" />
              <span style={{ position: 'absolute', bottom: '2px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '8px', padding: '1px 4px', borderRadius: '2px' }}>{item.dur}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>{item.title}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.date}</p>
            </div>
            <ChevronRight size={18} color="#CBD5E0" />
          </div>
        ))}
      </section>
    </div>
  );
};

export default MediaTab;
