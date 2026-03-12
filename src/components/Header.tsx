import { useState, useEffect } from 'react';
import './Header.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="container">
        <div className="header__content">
          <a href="/" className="header__logo">
            <span className="header__logo-icon">◆</span>
            <span className="header__logo-text">Minimal</span>
          </a>

          <button
            className="header__menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'hamburger--active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--open' : ''}`}>
            <a href="#features" className="header__nav-link">Features</a>
            <a href="#about" className="header__nav-link">About</a>
            <a href="#contact" className="header__nav-link">Contact</a>
            <button className="header__cta">Get Started</button>
          </nav>
        </div>
      </div>
    </header>
  );
}
