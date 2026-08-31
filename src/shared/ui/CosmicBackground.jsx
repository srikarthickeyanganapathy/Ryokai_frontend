import React, { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * CosmicBackground -- ambient pulsar/starfield particles that extend the
 * Ryokai branding beyond just the logo. Renders a subtle animated canvas
 * with tiny floating particles and occasional twinkle pulses.
 *
 * Uses requestAnimationFrame and is fully throttled when tab is hidden.
 * Extremely lightweight (~3KB) with zero dependencies.
 *
 * @param {'full'|'sidebar'|'hero'} [props.variant='full'] -- density control
 * @param {number} [props.opacity=0.4] -- overall particle opacity
 */
export function CosmicBackground({ variant = 'full', opacity = 0.4, className }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationId;

    const density = variant === 'sidebar' ? 40 : variant === 'hero' ? 80 : 50;

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.r = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.hue = Math.random() < 0.15 ? 195 + Math.random() * 30 : 210 + Math.random() * 40; // cyan/blue range
        this.lifetime = Math.random() < 0.05 ? 60 + Math.random() * 120 : Infinity; // rare short-lived "spark"
        this.age = 0;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;
        if (this.age > this.lifetime) this.reset();
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }
      draw(ctx, time) {
        const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.3 + 0.7;
        const sparkFade = this.lifetime < Infinity
          ? 1 - (this.age / this.lifetime)
          : 1;
        const a = this.alpha * twinkle * sparkFade * opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${a})`;
        ctx.fill();

        // Subtle glow for larger particles
        if (this.r > 0.8) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${a * 0.08})`;
          ctx.fill();
        }
      }
    }

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: density }, () => new Particle());
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(ctx, time); });
      animationId = requestAnimationFrame(animate);
    };

    init();
    window.addEventListener('resize', init);
    animationId = requestAnimationFrame(animate);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animationId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', init);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [variant, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none z-0', className)}
      aria-hidden="true"
    />
  );
}
