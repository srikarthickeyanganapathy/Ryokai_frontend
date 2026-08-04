import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Animated number that counts up/down smoothly using requestAnimationFrame.
 * Eases with a cubic-out curve for a natural deceleration.
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
 * Progress bar with smooth width easing and an optional glow pulse on update.
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
