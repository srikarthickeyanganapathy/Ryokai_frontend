import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * AnimatedNumber
 * ─────────────────────────────────────────────────────────
 * Animated number that counts up/down smoothly using requestAnimationFrame.
 * Eases with a cubic-out curve for natural deceleration.
 */
export function AnimatedNumber({ value, duration = 600, className, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (previousValue.current === value) return;

    const start = previousValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue}
      {suffix}
    </span>
  );
}

/**
 * ProgressBar
 * ─────────────────────────────────────────────────────────
 * Horizontal progress bar with smooth width easing and optional glow pulse.
 */
export function ProgressBar({ value, className, barClassName, glow = true, height = 'h-1.5' }) {
  const [glowing, setGlowing] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current !== value) {
      setGlowing(true);
      previous.current = value;
      const t = setTimeout(() => setGlowing(false), 700);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className={cn('bg-[var(--bg-subtle)] rounded-full overflow-hidden', height, className)}>
      <div
        className={cn(
          'h-full bg-[var(--accent)] rounded-full transition-all duration-700 ease-out',
          glow && glowing && 'shadow-[0_0_8px_var(--accent)]',
          barClassName,
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/**
 * ProgressRing
 * ─────────────────────────────────────────────────────────
 * SVG circular progress indicator with smooth animation.
 * Used by ProjectCard and detail pages for a premium ring display.
 *
 * @param {number} value - Progress percentage (0-100)
 * @param {number} [size=48] - Diameter in px
 * @param {number} [strokeWidth=4] - Ring stroke width
 * @param {string} [className] - Additional wrapper classes
 * @param {React.ReactNode} [children] - Content rendered inside the ring (e.g. percentage text)
 */
export function ProgressRing({ value, size = 48, strokeWidth = 4, className, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
