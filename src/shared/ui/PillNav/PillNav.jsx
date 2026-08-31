import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * PillNav
 * ---
 * Canonical pill/tab/segmented switcher for the entire application.
 * Consumes the behavior of FilterTabs and SegmentedToggle via variant prop.
 *
 * @param {"standard"|"filter"|"segmented"} [variant="standard"]
 *   standard  -- Plain pill nav, CSS-only active state (existing PillNav behavior)
 *   filter    -- Animated sliding highlight indicator (existing FilterTabs behavior)
 *   segmented -- iOS-style segmented control with sliding background (existing SegmentedToggle behavior)
 *
 * @param {Array<{value: string, label: string, icon?: React.ElementType}>} items
 *   Item definitions. Also accepts `options` or `filters` as aliases for backward compat.
 *
 * @param {string} value - Currently active value
 * @param {(value: string) => void} onChange - Callback when a pill is clicked
 * @param {Object} [counts] - Optional map of value -> count badge number
 * @param {string} [className] - Additional container classes
 * @param {string} [layoutId] - framer-motion layoutId for animated variants (default: auto-generated)
 */
export function PillNav({
  variant = 'standard',
  items,
  options,
  filters,
  value,
  onChange,
  counts,
  className,
  layoutId: layoutIdProp,
}) {
  const list = items || options || filters || []
  const isAnimated = variant === 'filter' || variant === 'segmented'
  const motionLayoutId = layoutIdProp || `pillnav-${variant}`

  /** Container styles per variant */
  const containerClasses = {
    standard: 'inline-flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]',
    filter: 'relative inline-flex items-center gap-0.5 p-0.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--color-border-subtle)]',
    segmented: 'relative inline-flex items-center bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] shadow-2xs',
  }

  /** Active indicator styles per variant (non-animated: CSS class; animated: motion.div classes) */
  const activeClasses = {
    standard: 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]',
    filter: 'absolute inset-0 bg-[var(--bg-base)] rounded-md shadow-sm',
    segmented: 'absolute inset-0 bg-[var(--bg-elevated)] rounded-lg shadow-xs',
  }

  /** Inactive text classes per variant */
  const inactiveClasses = {
    standard: 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
    filter: 'text-[var(--text-muted)] hover:text-[var(--text-base)]',
    segmented: 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
  }

  /** Button base classes per variant */
  const buttonBase = {
    standard: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors duration-150 cursor-pointer h-auto select-none whitespace-nowrap',
    filter: 'relative px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 z-10',
    segmented: 'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold z-10',
  }

  /** Count badge classes */
  const countBadgeActive = {
    standard: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    filter: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    segmented: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  }
  const countBadgeInactive = {
    standard: 'bg-[var(--bg-elevated)] text-[var(--text-muted)]',
    filter: 'bg-[var(--color-border-subtle)] text-[var(--text-muted)]',
    segmented: 'bg-[var(--color-border-subtle)] text-[var(--text-muted)]',
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      {list.map((opt) => {
        const IconEl = opt.icon
        const isActive = value === opt.value
        const count = counts ? counts[opt.value] : undefined

        const Wrapper = isAnimated ? motion.button : 'button'
        const wrapperProps = isAnimated ? { whileTap: { scale: 0.96 } } : {}

        return (
          <Wrapper
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={cn(
              buttonBase[variant],
              isActive && !isAnimated && activeClasses[variant],
              !isActive && inactiveClasses[variant]
            )}
            {...wrapperProps}
          >
            {isActive && isAnimated && (
              <motion.div
                layoutId={motionLayoutId}
                className={activeClasses[variant]}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              />
            )}
            {IconEl && (
              <IconEl
                className={cn(
                  'w-3.5 h-3.5 shrink-0',
                  isAnimated && 'relative z-10'
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                isAnimated && 'relative z-10',
                variant === 'segmented' && 'hidden sm:inline'
              )}
            >
              {opt.label}
            </span>
            {typeof count === 'number' && (
              <span
                className={cn(
                  'text-[10px] tabular-nums leading-none px-1.5 py-0.5 rounded-full',
                  isAnimated && 'relative z-10',
                  isActive ? countBadgeActive[variant] : countBadgeInactive[variant]
                )}
              >
                {count}
              </span>
            )}
          </Wrapper>
        )
      })}
    </div>
  )
}

export default PillNav
