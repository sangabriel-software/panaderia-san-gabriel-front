import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-icon">✨</span>
            <span>New features available</span>
          </div>

          <h1 className="hero__title">
            Modern Design,
            <br />
            <span className="hero__title-gradient">Simplified</span>
          </h1>

          <p className="hero__description">
            A minimalist approach to creating beautiful, functional web experiences.
            Clean design meets powerful functionality.
          </p>

          <div className="hero__actions">
            <button className="btn btn--primary">
              Get Started
              <span className="btn__arrow">→</span>
            </button>
            <button className="btn btn--secondary">
              Learn More
            </button>
          </div>

          <div className="hero__stats">
            <div className="hero__stat">
              <div className="hero__stat-value">10k+</div>
              <div className="hero__stat-label">Active Users</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-value">99.9%</div>
              <div className="hero__stat-label">Uptime</div>
            </div>
            <div className="hero__stat">
              <div className="hero__stat-value">24/7</div>
              <div className="hero__stat-label">Support</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__shapes">
        <div className="hero__shape hero__shape--1"></div>
        <div className="hero__shape hero__shape--2"></div>
        <div className="hero__shape hero__shape--3"></div>
      </div>
    </section>
  );
}
