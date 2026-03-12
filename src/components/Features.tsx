import './Features.css';

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Optimized performance ensures your application runs smoothly and efficiently.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Design',
    description: 'Clean, modern aesthetics that provide an exceptional user experience.',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Responsive design that looks perfect on any device, from mobile to desktop.',
  },
  {
    icon: '🔒',
    title: 'Secure',
    description: 'Built with security best practices to protect your data and privacy.',
  },
  {
    icon: '🚀',
    title: 'Scalable',
    description: 'Architecture designed to grow with your needs and handle any workload.',
  },
  {
    icon: '🎯',
    title: 'Focused',
    description: 'Minimalist approach that emphasizes what truly matters to your users.',
  },
];

export default function Features() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features__header">
          <h2 className="features__title">Why Choose Us</h2>
          <p className="features__subtitle">
            Everything you need to build exceptional digital experiences
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-card__icon">{feature.icon}</div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
