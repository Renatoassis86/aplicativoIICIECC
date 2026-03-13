import React from 'react';
import { PlayCircle, Calendar, Users, Megaphone, HelpCircle, ChevronRight, Map, Award } from 'lucide-react';

const Home = () => {
  const cards = [
    { title: 'Programação', desc: 'Agenda completa e favoritos.', icon: Calendar, color: 'bg-burgundy' },
    { title: 'Palestrantes', desc: 'Conheça os convidados.', icon: Users, color: 'bg-gold' },
    { title: 'Parceiros', desc: 'Expositores e networking.', icon: HelpCircle, color: 'bg-cream' },
    { title: 'Comunicados', desc: 'Avisos importantes em tempo real.', icon: Megaphone, color: 'bg-burgundy' },
  ];

  return (
    <div className="home-scroll-container">
      {/* Classical Burgundy Header */}
      <header className="classical-header">
        <div className="header-parchment-overlay"></div>
        <div className="header-canvas-texture"></div>
        
        <div className="header-content">
          <div className="header-top-row">
            <span className="edition-badge">CIECC 2026</span>
            <span className="welcome-text">Seja bem-vindo(a)</span>
          </div>
          
          <h1 className="header-main-title">
            II Congresso Internacional de Educação Cristã Clássica
          </h1>
          <div className="header-gold-line"></div>
          <p className="header-desc">
            Acompanhe a jornada acadêmica e espiritual do evento.
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="home-body">
        {/* Featured Live/Action Card */}
        <section className="featured-card-classical">
          <div className="card-label">SESSÃO ATUAL</div>
          <h2 className="card-title-serif">Abertura: As Sete Artes Liberais</h2>
          <p className="card-subtitle">Local: Auditório Principal • 09:00</p>
          <button className="btn-classical-gold">
            <PlayCircle size={18} /> DETALHES DA SESSÃO
          </button>
        </section>

        {/* Quick Menu */}
        <div className="section-header-serif">Navegação</div>
        <div className="action-grid-classical">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="action-card-academic">
                <div className={`icon-box ${card.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="academic-item-title">{card.title}</h3>
                <p className="academic-item-desc">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer / Info */}
        <section className="info-strip">
          <div className="info-item">
            <Map size={18} />
            <span>Mapa do Local</span>
          </div>
          <div className="info-item">
            <Award size={18} />
            <span>Meus Certificados</span>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-scroll-container {
          flex: 1;
          overflow-y: auto;
          background-color: var(--bg-secondary);
          padding-bottom: 110px;
        }

        .classical-header {
          background-color: var(--primary);
          padding: 40px 24px 32px;
          position: relative;
          color: white;
          text-align: center;
          border-bottom: 3px solid var(--accent);
        }

        .header-parchment-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: url("https://www.transparenttextures.com/patterns/parchment.png");
          pointer-events: none;
        }

        .header-canvas-texture {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("https://www.transparenttextures.com/patterns/linen.png");
          pointer-events: none;
        }

        .header-content { position: relative; z-index: 1; }

        .header-top-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .edition-badge {
          border: 1px solid var(--accent);
          padding: 4px 16px;
          font-family: var(--font-heading);
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: var(--accent);
        }

        .welcome-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .header-main-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          line-height: 1.3;
          max-width: 90%;
          margin: 0 auto;
          color: white;
        }

        .header-gold-line {
          height: 1px;
          width: 80px;
          background-color: var(--accent);
          margin: 16px auto;
        }

        .header-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 280px;
          margin: 0 auto;
        }

        .home-body { padding: 24px; }

        .featured-card-classical {
          background-color: white;
          border: 1px solid var(--border);
          padding: 24px;
          margin-bottom: 32px;
          position: relative;
          box-shadow: var(--shadow);
        }

        .featured-card-classical::before {
          content: "";
          position: absolute;
          inset: 6px;
          border: 1px solid var(--accent);
          opacity: 0.2;
          pointer-events: none;
        }

        .card-label {
          font-family: var(--font-heading);
          font-size: 0.65rem;
          color: var(--primary);
          margin-bottom: 8px;
          letter-spacing: 0.1em;
          font-weight: 700;
        }

        .card-title-serif {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .btn-classical-gold {
          width: 100%;
          background-color: var(--primary);
          color: white;
          border: 1px solid var(--accent);
          padding: 12px;
          font-weight: 700;
          font-family: var(--font-heading);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .section-header-serif {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--primary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-header-serif::after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: var(--border);
        }

        .action-grid-classical {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }

        .action-card-academic {
          background-color: white;
          padding: 16px;
          border-radius: 4px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .bg-burgundy { background-color: var(--primary); color: white; }
        .bg-gold { background-color: var(--accent); color: white; }
        .bg-cream { background-color: var(--bg-tertiary); color: var(--primary); border: 1px solid var(--accent); }

        .academic-item-title {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .academic-item-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 6px;
          line-height: 1.4;
        }

        .info-strip {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .info-item {
          flex: 1;
          padding: 12px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}} />
    </div>
  );
};

export default Home;
