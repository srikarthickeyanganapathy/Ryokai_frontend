import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * SegmentedToggle
 * ─────────────────────────────────────────────────────────
 * Shared component for switching view modes (e.g. Grid vs Table).
 *
 * @param {Array<{value: string, label: string, icon?: React.ElementType}>} options - Toggle options
 * @param {string} value - Currently active option value
 * @param {(value: string) => void} onChange - Callback when an option is clicked
 * @param {string} [className] - Additional container classes
 */
export function SegmentedToggle({ options, value, onChange, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-2xs',
        className
      )}
    >
      {options.map((opt) => {
        const IconEl = opt.icon;
        const isActive = value === opt.value;
        
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              isActive
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            title={opt.label}
          >
            {IconEl && <IconEl className="w-3.5 h-3.5" aria-hidden="true" />}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
