import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './LandingPage.css';

const TOTAL_FRAMES = 240;
const FRAME_PATH = (i) => `/frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;

// ─── Loader ──────────────────────────────────────────────────────────────────
function NeuralLoader({ progress }) {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-ring">
          <svg viewBox="0 0 100 100" width="120" height="120">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(140,120,255,0.08)" strokeWidth="1" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="rgba(140,120,255,0.7)" strokeWidth="1.5"
              strokeDasharray={`${progress * 2.64} 264`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 0.3s' }}
            />
          </svg>
          <div className="loader-percentage">{Math.floor(progress)}%</div>
        </div>
        <div className="loader-text">NEURAL SYNCHRONIZATION</div>
        <div className="loader-bar-track">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameObjRef = useRef({ value: 0 });
  const hasStartedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const images = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = img.onerror = () => {
        loaded++;
        setLoadProgress((loaded / TOTAL_FRAMES) * 100);
        if (loaded === TOTAL_FRAMES) setTimeout(() => setLoading(false), 400);
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Draw frame (center-cover)
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }, []);

  // Resize handler
  useEffect(() => {
    if (loading) return;
    const resize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFrame(frameObjRef.current.value);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [loading, drawFrame]);

  // Auto-play animation immediately after loading
  useEffect(() => {
    if (loading || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    drawFrame(0);

    // Small delay then auto-play the full sequence
    const timer = setTimeout(() => {
      gsap.to(frameObjRef.current, {
        value: TOTAL_FRAMES - 1,
        duration: 8,
        ease: 'power1.inOut',
        onUpdate: () => drawFrame(frameObjRef.current.value),
        onComplete: () => setShowCTA(true),
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [loading, drawFrame]);

  if (loading) return <NeuralLoader progress={loadProgress} />;

  return (
    <div className="landing-root">
      <canvas ref={canvasRef} className="frame-canvas" />

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
