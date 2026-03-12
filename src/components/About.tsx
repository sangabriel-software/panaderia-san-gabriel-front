import './About.css';

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about__content">
          <div className="about__text">
            <h2 className="about__title">
              Built for the
              <br />
              <span className="about__title-highlight">Modern Web</span>
            </h2>
            <p className="about__description">
              We believe in the power of simplicity. Our platform combines cutting-edge
              technology with intuitive design to deliver experiences that just work.
            </p>
            <p className="about__description">
              Every detail is crafted with care, from the subtle animations to the
              thoughtful spacing. We focus on what matters most: creating tools that
              empower you to do your best work.
            </p>
            <div className="about__features">
              <div className="about__feature">
                <div className="about__feature-icon">✓</div>
                <div className="about__feature-text">Modern Technology Stack</div>
              </div>
              <div className="about__feature">
                <div className="about__feature-icon">✓</div>
                <div className="about__feature-text">Intuitive User Interface</div>
              </div>
              <div className="about__feature">
                <div className="about__feature-icon">✓</div>
                <div className="about__feature-text">Continuous Innovation</div>
              </div>
            </div>
          </div>

          <div className="about__visual">
            <div className="about__card about__card--1">
              <div className="about__card-metric">150+</div>
              <div className="about__card-label">Components</div>
            </div>
            <div className="about__card about__card--2">
              <div className="about__card-metric">50k+</div>
              <div className="about__card-label">Lines of Code</div>
            </div>
            <div className="about__card about__card--3">
              <div className="about__card-metric">100%</div>
              <div className="about__card-label">Responsive</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
