import React from 'react'
import academyimg1 from "../assets/img1.jpg";
import academyimg2 from "../assets/img2.jpg";
import academyimg3 from "../assets/img3.jpg";
import './Home.css';
const Home = () => {
  
  return (
  <>
  <main className="modern-home">

    {/* HERO SECTION */}
    <section
      className="hero-section"
      style={{ backgroundImage: `url(${academyimg1})` }}
    >
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">
          Elevate Your <span>Performance</span>
        </h1>
        <p className="hero-subtitle">
          Smart Athlete Monitoring & Professional Coaching Platform
        </p>

        <div className="hero-buttons">
          <button className="btn btn-primary btn-lg px-4">Get Started</button>
          <button className="btn btn-outline-light btn-lg px-4 ms-3">
            Learn More
          </button>
        </div>
      </div>
    </section>


    {/* FEATURES SECTION */}
    <section className="features-modern container py-5">

      <div className="text-center mb-5">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">
          Smart system designed for coaches and athletes
        </p>
      </div>

      <div className="row g-4">

        <div className="col-md-4">
          <div className="glass-card">
            <h4>📊 Smart Tracking</h4>
            <p>Monitor fatigue level and performance matrix with precision.</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card">
            <h4>🏆 Expert Coaches</h4>
            <p>Professional guidance from experienced trainers.</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card">
            <h4>🚀 Career Growth</h4>
            <p>Structured system to help athletes grow efficiently.</p>
          </div>
        </div>

      </div>
    </section>


    {/* CTA SECTION */}
    <section className="cta-section text-center">
      <h2>Ready to Transform Your Game?</h2>
      <button className="btn btn-light btn-lg mt-3 px-5">
        Join Now
      </button>
    </section>


    {/* FOOTER */}
    <footer className="modern-footer">
      <p>© 2026 Aayush Academy Pvt. Ltd. | All Rights Reserved</p>
    </footer>

  </main>
</>
  )
}

export default Home