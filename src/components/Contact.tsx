import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact__content">
          <div className="contact__info">
            <h2 className="contact__title">Get in Touch</h2>
            <p className="contact__description">
              Have a question or want to work together? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </p>

            <div className="contact__details">
              <div className="contact__detail">
                <div className="contact__detail-icon">📧</div>
                <div>
                  <div className="contact__detail-label">Email</div>
                  <div className="contact__detail-value">hello@minimal.com</div>
                </div>
              </div>

              <div className="contact__detail">
                <div className="contact__detail-icon">📍</div>
                <div>
                  <div className="contact__detail-label">Location</div>
                  <div className="contact__detail-value">San Francisco, CA</div>
                </div>
              </div>

              <div className="contact__detail">
                <div className="contact__detail-icon">⏰</div>
                <div>
                  <div className="contact__detail-label">Hours</div>
                  <div className="contact__detail-value">Mon-Fri 9am-6pm PST</div>
                </div>
              </div>
            </div>
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="Tell us about your project..."
                rows={5}
                required
              />
            </div>

            <button type="submit" className="form-submit">
              Send Message
              <span className="form-submit__arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
