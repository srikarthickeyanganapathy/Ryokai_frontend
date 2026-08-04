import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Animated number that counts up/down smoothly.
 */
export function AnimatedNumber({ value, duration = 600, className, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    if (previousValue.current === value) {
      setDisplayValue(value);
      return;
    }
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
 * Radial progress ring for utilization.
 */
export function CapacityRing({ value, size = 80, stroke = 8, className }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  let strokeColor = 'var(--accent)';
  if (value > 100) strokeColor = 'var(--danger)';
  else if (value >= 85) strokeColor = 'var(--warning)';

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-subtle)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700 ease-out"
      />
      <text
        x="50%"
        y="50%"
        dy="0.35em"
        textAnchor="middle"
        className="font-mono font-bold"
        fill="var(--text-primary)"
        fontSize={size * 0.25}
      >
        {value}%
      </text>
    </svg>
  );
}
