import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * PillNav
 * ────────────────────────────────────────────────
 * Shared pill-button navigation. The canonical look
 * for view/filter switching across the app (calendar
 * Week/Month, Tasks view + status, team Work segment,
 * discussions, insights range, etc.). Single-select.
 *
 * Drop-in for both SegmentedToggle and FilterTabs:
 * accepts `items` / `options` / `filters` prop names.
 *
 * @param {Array<{value: string, label: string, icon?: React.ElementType}>} items - Pill definitions
 * @param {string} value - Currently active value
 * @param {(value: string) => void} onChange - Callback when a pill is clicked
 * @param {Object} [counts] - Optional map of value -> count badge number
 * @param {string} [className] - Additional container classes
 */
export function PillNav({ items, options, filters, value, onChange, counts, className }) {
  const list = items || options || filters || []
  return (
    <div
      className={cn(
        'inline-flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]',
        className
      )}
    >
      {list.map(opt => {
        const IconEl = opt.icon
        const isActive = value === opt.value
        const count = counts ? counts[opt.value] : undefined
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors duration-150 cursor-pointer h-auto select-none whitespace-nowrap',
              isActive
                ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {IconEl && <IconEl className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            {opt.label}
            {typeof count === 'number' && (
              <span
                className={cn(
                  'text-[10px] tabular-nums leading-none px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default PillNav
