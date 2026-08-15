import React from 'react'
import { cn } from '@/shared/lib/cn'
import { resolveStatus } from '@/shared/lib/statusRegistry'

/**
 * StatusBadge — canonical status badge using the single-source status registry.
 * Replaces 52+ component-level inline status color definitions.
 *
 * @param {{ status: string, variant?: 'badge'|'pill'|'dot', className?: string, showIcon?: boolean }} props
 */
export function StatusBadge({ status, variant = 'badge', className, showIcon = true }) {
  const def = resolveStatus(status)
  if (!def) return <span className="text-[var(--text-muted)] text-xs">{status || 'Unknown'}</span>

  const Icon = def.icon

  if (variant === 'dot') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span className={cn('w-1.5 h-1.5 rounded-full', def.color === 'success' ? 'bg-[var(--success)]' :
          def.color === 'danger' ? 'bg-[var(--danger)]' :
          def.color === 'warning' ? 'bg-[var(--warning)]' :
          def.color === 'active' ? 'bg-[var(--accent)]' :
          'bg-[var(--text-muted)]')} />
        <span className="sr-only">{def.ariaLabel}</span>
      </span>
    )
  }

  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
          def.colorClass,
          className
        )}
        role="status"
        aria-label={def.ariaLabel}
      >
        {showIcon && Icon && <Icon className="w-3 h-3" strokeWidth={def.iconStroke || 1.5} />}
        <span>{def.description || status}</span>
      </span>
    )
  }

  // Default: badge
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border',
        def.colorClass,
        className
      )}
      role="status"
      aria-label={def.ariaLabel}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" strokeWidth={def.iconStroke || 1.5} />}
      <span>{def.description || status}</span>
    </span>
  )
}

/**
 * StatusDot — minimal colored dot indicator for status.
 */
export function StatusDot({ status, className }) {
  return <StatusBadge status={status} variant="dot" className={className} />
}

/**
 * StatusPill — rounded pill variant for compact status display.
 */
export function StatusPill({ status, className }) {
  return <StatusBadge status={status} variant="pill" className={className} />
}
