import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * FilterTabs
 * ─────────────────────────────────────────────────────────
 * Shared pill-tab bar with sliding highlight indicator.
 * Used across all module pages (Workload, Directory, etc.) for filtering.
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
        'relative inline-flex items-center gap-0.5 p-0.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--color-border-subtle)]',
        className
      )}
    >
      {filters.map((f) => {
        const isActive = value === f.value;
        return (
          <motion.button
            key={f.value}
            onClick={() => onChange(f.value)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 z-10',
              isActive
                ? 'text-[var(--text-base)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-base)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="filter-tabs-highlight"
                className="absolute inset-0 bg-[var(--bg-base)] rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
            {counts && counts[f.value] !== undefined && (
              <motion.span
                animate={{ scale: isActive ? 1 : 0.95 }}
                className={cn(
                  'relative z-10 text-[10px] font-mono px-1.5 rounded-full leading-tight',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--color-border-subtle)] text-[var(--text-muted)]'
                )}
              >
                {counts[f.value]}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
