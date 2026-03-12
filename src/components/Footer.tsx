import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">◆</span>
              <span className="footer__logo-text">Minimal</span>
            </div>
            <p className="footer__tagline">
              Building beautiful, functional experiences for the modern web.
            </p>
          </div>

          <div className="footer__links">
            <div className="footer__column">
              <h4 className="footer__column-title">Product</h4>
              <a href="#features" className="footer__link">Features</a>
              <a href="#about" className="footer__link">About</a>
              <a href="#" className="footer__link">Pricing</a>
              <a href="#" className="footer__link">Updates</a>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Company</h4>
              <a href="#about" className="footer__link">About Us</a>
              <a href="#" className="footer__link">Careers</a>
              <a href="#" className="footer__link">Blog</a>
              <a href="#contact" className="footer__link">Contact</a>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Resources</h4>
              <a href="#" className="footer__link">Documentation</a>
              <a href="#" className="footer__link">Help Center</a>
              <a href="#" className="footer__link">Community</a>
              <a href="#" className="footer__link">Support</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            {currentYear} Minimal. All rights reserved.
          </p>
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </a>
            <a href="#" className="footer__social-link" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"></path>
              </svg>
            </a>
            <a href="#" className="footer__social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
