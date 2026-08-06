import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * SegmentedToggle
 * ─────────────────────────────────────────────────────────
 * Shared component for switching view modes (e.g. Grid vs Table).
 * Features a sliding background indicator between options.
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
        'relative inline-flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-2xs',
        className
      )}
    >
      {options.map((opt) => {
        const IconEl = opt.icon;
        const isActive = value === opt.value;

        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold z-10',
              isActive
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
            title={opt.label}
          >
            {isActive && (
              <motion.div
                layoutId="segmented-toggle-bg"
                className="absolute inset-0 bg-[var(--bg-elevated)] rounded-lg shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              />
            )}
            {IconEl && <IconEl className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />}
            <span className="hidden sm:inline relative z-10">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
