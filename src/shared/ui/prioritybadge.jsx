import React from 'react'
import { cn } from '@/shared/lib/cn'
import { resolveStatus } from '@/shared/lib/statusregistry'

/**
 * PriorityBadge — canonical priority badge using the status registry.
 * Matches URGENT, HIGH, MEDIUM, LOW from STATUS_REGISTRY.
 */
export function PriorityBadge({ priority, className }) {
  const def = resolveStatus(priority)
  if (!def) return <span className={cn('text-[var(--text-muted)] text-xs', className)}>{priority || '—'}</span>

  const Icon = def.icon

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
      {Icon && <Icon className="w-3 h-3" strokeWidth={def.iconStroke || 1.5} />}
      <span>{priority}</span>
    </span>
  )
}
