import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    // Reveal the CTA button roughly around the end of the 8-second animation
    const timer = setTimeout(() => {
      setShowCTA(true);
    }, 7500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-root">
      {/* Hardware-accelerated native video element */}
      <video
        className="frame-canvas"
        src="/landing-animation.mp4"
        autoPlay
        muted
        playsInline
        style={{ objectFit: 'cover' }}
      />

      {/* Logo */}
      <div className="landing-logo">
        <span className="logo-text">Process</span>
        <span className="logo-accent"> AI</span>
      </div>

      {/* CTA — appears after animation finishes */}
      <div className={`cta-overlay ${showCTA ? 'visible' : ''}`}>
        <button className="cta-button" onClick={() => navigate('/home')}>
          <span>Enter Process AI</span>
          <span className="cta-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
