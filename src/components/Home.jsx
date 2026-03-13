import React from 'react';
import { ChevronRight, PlayCircle, Calendar, Users, Megaphone, HelpCircle } from 'lucide-react';

const Home = () => {
  const cards = [
    { title: 'Programação', desc: 'Veja a agenda completa e favorite os momentos que deseja acompanhar.', icon: Calendar },
    { title: 'Palestrantes', desc: 'Conheça os convidados, temas e trilhas de conteúdo do congresso.', icon: Users },
    { title: 'Parceiros', desc: 'Acesse expositores, patrocinadores e espaços de relacionamento.', icon: HelpCircle },
    { title: 'Comunicados', desc: 'Receba avisos oficiais, orientações e atualizações do evento.', icon: Megaphone },
  ];

  return (
    <div className="home-scroll-container">
      {/* Dark Header Section */}
      <header className="home-header">
        <div className="header-bg-decor-1"></div>
        <div className="header-bg-decor-2"></div>
        
        <div className="header-content">
          <div className="header-top-row">
            <span className="badge-glass">CIECC 2026</span>
            <span className="user-greeting">Olá, congressista</span>
          </div>
          
          <h1 className="header-title">
            App Oficial do Congresso
          </h1>
          <p className="header-subtitle">
            Agenda, networking, parceiros, comunicados, conteúdos e experiência completa do evento em um só lugar.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="home-content-body">
        {/* Next Step Card */}
        <section className="highlight-card">
          <p className="section-label">Próximo passo</p>
          <h2 className="card-title">Monte sua experiência no congresso</h2>
          <p className="card-desc">
            Explore a programação, marque sessões de interesse e acompanhe avisos importantes em tempo real.
          </p>
          <button className="btn-action">
            Ver programação
          </button>
        </section>

        {/* Action Grid */}
        <section className="action-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="action-card">
                <div className="icon-wrapper">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="item-title">{card.title}</h3>
                <p className="item-desc">{card.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Featured Card */}
        <section className="featured-dark-card">
          <p className="section-label text-white-60">Destaque</p>
          <h3 className="featured-title">Credenciamento, localização e QR Code</h3>
          <p className="featured-desc">
            Deixe espaço preparado para check-in, mapa do local, tickets e acesso rápido aos recursos do evento.
          </p>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-scroll-container {
          flex: 1;
          overflow-y: auto;
          background-color: var(--bg-secondary);
          padding-bottom: 100px;
        }

        .home-header {
          background-color: var(--accent);
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
        }

        .header-bg-decor-1 {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 128px;
          height: 128px;
          border-radius: 50%;
          background-color: rgba(214, 31, 38, 0.2);
          filter: blur(40px);
        }

        .header-bg-decor-2 {
          position: absolute;
          top: 64px;
          left: -32px;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          filter: blur(40px);
        }

        .header-content {
          position: relative;
          z-index: 10;
        }

        .header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .badge-glass {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
        }

        .user-greeting {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          margin: 0;
        }

        .header-subtitle {
          margin-top: 12px;
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.75);
        }

        .home-content-body {
          padding: 20px;
        }

        .highlight-card {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 20px;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-desc {
          margin-top: 8px;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .btn-action {
          margin-top: 16px;
          width: 100%;
          background-color: var(--primary);
          color: white;
          padding: 12px;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 10px 15px -3px rgba(214, 31, 38, 0.2);
        }

        .action-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .action-card {
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .icon-wrapper {
          width: 40px;
          height: 40px;
          background-color: rgba(214, 31, 38, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-title {
          margin-top: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .item-desc {
          margin-top: 8px;
          font-size: 0.75rem;
          line-height: 1.4;
          color: var(--text-secondary);
        }

        .featured-dark-card {
          margin-top: 20px;
          background-color: var(--accent);
          border-radius: 24px;
          padding: 20px;
          color: white;
        }

        .featured-title {
          margin-top: 8px;
          font-size: 1rem;
          font-weight: 600;
        }

        .featured-desc {
          margin-top: 8px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .text-white-60 { color: rgba(255, 255, 255, 0.6); }
      `}} />
    </div>
  );
};

export default Home;
