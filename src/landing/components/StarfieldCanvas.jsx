import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

export function StarfieldCanvas({ isDark }) {
  const canvasRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const particlesRef = useRef([]);
  const frameRef = useRef(null);

  const initParticles = useCallback((w, h) => {
    return Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.5 + 0.1,
      tw: Math.random() * 0.02 + 0.005,
      to: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? 195 + Math.random() * 30 : 210 + Math.random() * 40
    }));
  }, []);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const cv = canvasRef.current;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    particlesRef.current = initParticles(cv.width, cv.height);
  }, [initParticles]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!ctx) return;

    handleResize();
    window.addEventListener('resize', handleResize);

    const starOp = isDark ? 0.95 : 0.25;

    const draw = (t) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const particles = particlesRef.current;
      
      for (const p of particles) {
        if (!shouldReduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }
        
        if (p.x < -10) p.x = cv.width + 10;
        if (p.x > cv.width + 10) p.x = -10;
        if (p.y < -10) p.y = cv.height + 10;
        if (p.y > cv.height + 10) p.y = -10;
        
        const tw = shouldReduceMotion ? 1 : Math.sin(t * p.tw + p.to) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${(p.a * tw * 0.3 * starOp).toFixed(3)})`;
        ctx.fill();
      }

      if (!shouldReduceMotion) {
        frameRef.current = requestAnimationFrame(draw);
      }
    };

    if (shouldReduceMotion) {
      draw(0);
    } else {
      frameRef.current = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [handleResize, isDark, shouldReduceMotion]);

  return (
    <canvas 
      ref={canvasRef} 
      id="stars" 
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
