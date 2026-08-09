import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { Calendar, Flag, User, Clock, ExternalLink, CheckCircle2 } from '@/shared/ui/Icons'
import { PRIORITY_COLORS } from '@/shared/lib/priority'
import { resolveStatus } from '@/shared/lib/statusregistry'

/**
 * TaskDrawer
 * ─────────────────────────────────────────────────────────
 * Quick-view contextual drawer for task summary.
 * Shown when hovering/clicking a task reference in dashboards,
 * activity streams, or notification feeds.
 *
 * Expects `data` payload:
 *   { id, title, description?, status, priority, assignedTo, dueDate?, projectName? }
 *
 * WEF Boundary: Pure UI. No API calls. All data injected via props.
 */

/** Maps CRITICAL priority label (some data sources) to canonical URGENT key */
const normalizePriorityKey = (p) => {
  const key = String(p || '').toUpperCase()
  return key === 'CRITICAL' ? 'URGENT' : key
}

export function TaskDrawer({ data, onClose }) {
  if (!data) return null

  const { id, title, description, status, priority, assignedTo, dueDate, projectName, currentStatus } = data
  const displayStatus = currentStatus || status || 'TODO'
  const displayPriority = (priority || 'MEDIUM').toUpperCase()

  const isOverdue = dueDate && new Date(dueDate) < new Date() && displayStatus !== 'COMPLETED' && displayStatus !== 'APPROVED'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-start gap-3 mb-3">
          <Badge className={cn('text-[10px] font-mono uppercase', resolveStatus(displayStatus).colorClass)}>
            {displayStatus.replace('_', ' ')}
          </Badge>
          <Badge className={cn('text-[10px] font-mono uppercase', PRIORITY_COLORS[normalizePriorityKey(displayPriority)] || PRIORITY_COLORS.MEDIUM)}>
            {displayPriority}
          </Badge>
        </div>
        <Heading level={3} className="text-lg font-semibold leading-snug">
          {title}
        </Heading>
        {projectName && (
          <Text variant="muted" className="text-xs mt-1.5">in {projectName}</Text>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {description && (
          <div className="space-y-2">
            <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Description</Text>
            <Text className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap line-clamp-6">
              {description}
            </Text>
          </div>
        )}

        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Details</Text>

          {assignedTo && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <User className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>Assigned to <span className="font-medium text-[var(--text-primary)]">{assignedTo}</span></span>
            </div>
          )}

          {dueDate && (
            <div className={cn(
              'flex items-center gap-3 text-sm',
              isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'
            )}>
              <Calendar className={cn('w-4 h-4 shrink-0', isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')} />
              <span>
                {isOverdue ? 'Overdue: ' : 'Due '}
                {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <Flag className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span>Priority: <span className="font-medium">{displayPriority}</span></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Button variant="outline" className="w-full gap-2 text-xs" onClick={onClose}>
          <ExternalLink className="w-3.5 h-3.5" />
          Open full task view
        </Button>
      </div>
    </div>
  )
}
