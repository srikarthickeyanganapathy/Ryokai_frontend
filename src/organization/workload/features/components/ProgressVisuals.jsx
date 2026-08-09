/**
 * @deprecated Use @/shared/ui/Progress/ProgressVisuals instead.
 * This file is kept for backward compat only — re-exports the canonical module.
 * The CapacityRing is unique to workload — kept here; all others delegate.
 */
export { AnimatedNumber, ProgressBar } from '@/shared/ui/Progress/ProgressVisuals';
import React from 'react';

/** Capacity gauge ring — unique to workload domain */
export function CapacityRing({ value, size = 80, stroke = 8, className }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-subtle)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent)" strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{value}%</div>
    </div>
  );
}
