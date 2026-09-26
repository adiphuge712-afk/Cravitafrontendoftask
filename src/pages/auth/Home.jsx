import { Link } from 'react-router-dom';

import academyimg1 from '@/assets/img1.jpg';
import academyimg2 from '@/assets/img2.jpg';
import academyimg3 from '@/assets/img3.jpg';
import './Home.css';

const FEATURES = [
  {
    icon: '📊',
    title: 'Smart tracking',
    text: 'Monitor fatigue level and performance metrics session by session, with precision.',
  },
  {
    icon: '🏆',
    title: 'Expert coaches',
    text: 'Professional guidance from experienced trainers who plan around your real data.',
  },
  {
    icon: '🚀',
    title: 'Career growth',
    text: 'A structured system that helps athletes progress efficiently, not just train harder.',
  },
];

const SHOWCASE = [
  {
    src: academyimg2,
    alt: 'Athletes training together at the academy',
    title: 'Train with a plan',
    text: 'Coaches publish drills, durations and dates — you always know what today looks like.',
  },
  {
    src: academyimg3,
    alt: 'A coach guiding an athlete through a drill',
    title: 'Close the feedback loop',
    text: 'Mark sessions complete and tell your coach how they felt. The next plan adapts.',
  },
];

/** Public landing page. No auth hook here - visitors arrive signed out. */
const Home = () => (
  <main className="home">
    <section className="home-hero">
      <img className="home-hero__img" src={academyimg1} alt="" aria-hidden="true" />
      <div className="home-hero__scrim" />

      <div className="home-hero__content">
        <span className="home-eyebrow">Athlete monitoring platform</span>
        <h1 className="home-hero__title">
          Elevate your <span>performance</span>
        </h1>
        <p className="home-hero__subtitle">
          Smart athlete monitoring and professional coaching, in one place.
        </p>

        <div className="home-hero__actions">
          <Link to="/register" className="home-btn home-btn--primary">
            Get started
          </Link>
          <a href="#features" className="home-btn home-btn--ghost">
            Learn more
          </a>
        </div>
      </div>
    </section>

    <section className="home-section" id="features">
      <header className="home-section__head">
        <h2 className="home-section__title">Why choose us</h2>
        <p className="home-section__subtitle">
          A smart system designed for coaches and athletes alike.
        </p>
      </header>

      <div className="home-feature-grid">
        {FEATURES.map((f) => (
          <article className="home-feature" key={f.title}>
            <span className="home-feature__icon" aria-hidden="true">
              {f.icon}
            </span>
            <h3 className="home-feature__title">{f.title}</h3>
            <p className="home-feature__text">{f.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="home-section home-section--tint">
      <div className="home-showcase">
        {SHOWCASE.map((s) => (
          <article className="home-showcase__item" key={s.title}>
            <img className="home-showcase__img" src={s.src} alt={s.alt} loading="lazy" />
            <div className="home-showcase__body">
              <h3 className="home-showcase__title">{s.title}</h3>
              <p className="home-showcase__text">{s.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="home-cta">
      <h2 className="home-cta__title">Ready to transform your game?</h2>
      <p className="home-cta__text">Sign in and pick up exactly where your last session ended.</p>
      <Link to="/login" className="home-btn home-btn--light">
        Join now
      </Link>
    </section>

    <footer className="home-footer">
      <p>© 2026 Aayush Academy Pvt. Ltd. | All Rights Reserved</p>
    </footer>
  </main>
);

export default Home;
