import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * StatPill
 * ─────────────────────────────────────────────────────────
 * Shared pill badge for displaying a metric value with an icon and label.
 *
 * @param {React.ElementType} [icon] - Lucide icon component
 * @param {string} label - The descriptive label for the metric
 * @param {string|number} value - The numeric value or text
 * @param {boolean} [highlight] - Apply accent highlighting
 * @param {string} [className] - Additional classes
 */
export function StatPill({ icon: Icon, label, value, highlight, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border transition-colors',
        highlight
          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]/20'
          : 'border-[var(--border-subtle)]',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'w-3.5 h-3.5',
            highlight ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          )}
          aria-hidden="true"
        />
      )}
      <span className="text-[13px] font-bold text-[var(--text-primary)] tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-[var(--text-muted)] font-medium">
        {label}
      </span>
    </div>
  );
}
