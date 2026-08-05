import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * FilterTabs
 * ─────────────────────────────────────────────────────────
 * Shared pill-tab bar used across all module pages for filtering.
 * Replaces 7+ identical hand-rolled implementations.
 *
 * @param {Array<{value: string, label: string}>} filters - Tab definitions
 * @param {string} value - Currently active filter value
 * @param {(value: string) => void} onChange - Callback when tab is clicked
 * @param {Object} [counts] - Optional map of filter value → count badge number
 * @param {string} [className] - Additional container classes
 */
export function FilterTabs({ filters, value, onChange, counts, className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 p-0.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--color-border-subtle)]',
        className
      )}
    >
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap',
            value === f.value
              ? 'bg-[var(--bg-base)] text-[var(--text-base)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'
          )}
        >
          {f.label}
          {counts && counts[f.value] !== undefined && (
            <span
              className={cn(
                'text-[10px] font-mono px-1.5 rounded-full leading-tight',
                value === f.value
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'bg-[var(--color-border-subtle)] text-[var(--text-muted)]'
              )}
            >
              {counts[f.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
