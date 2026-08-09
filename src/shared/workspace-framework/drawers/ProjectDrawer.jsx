import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Progress } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { Calendar, Users, FolderKanban, ExternalLink, Clock } from '@/shared/ui/Icons'
import { resolveStatus } from '@/shared/lib/statusregistry'

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-border)]' },
  COMPLETED: { label: 'Completed', color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  ON_HOLD: { label: 'On Hold', color: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]' },
  CANCELLED: { label: 'Cancelled', color: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-border)]' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
}

/**
 * ProjectDrawer
 * ─────────────────────────────────────────────────────────
 * Quick-view contextual drawer for project summaries.
 * Shown when clicking a project reference in task lists,
 * dashboards, or analytics.
 *
 * Expects `data` payload:
 *   { id, name, description?, status, taskCount?, completedCount?, dueDate?, teamName?, organizationName? }
 *
 * WEF Boundary: Pure UI. No API calls. All data injected via props.
 */

export function ProjectDrawer({ data, onClose }) {
  if (!data) return null

  const {
    id, name, description, status = 'ACTIVE',
    taskCount = 0, completedCount = 0,
    dueDate, teamName, organizationName
  } = data

  const statusDef = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <Heading level={3} className="text-lg font-semibold truncate">
              {name}
            </Heading>
            <Badge className={cn('text-[10px] font-mono uppercase mt-1', statusDef.color)}>
              {statusDef.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {description && (
          <div className="space-y-2">
            <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">About</Text>
            <Text className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap line-clamp-4">
              {description}
            </Text>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Progress</Text>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">{completedCount} of {taskCount} tasks</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Details</Text>

          {organizationName && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <FolderKanban className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>{organizationName}</span>
            </div>
          )}

          {teamName && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <Users className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>Team: {teamName}</span>
            </div>
          )}

          {dueDate && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>Due {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Button variant="outline" className="w-full gap-2 text-xs" onClick={onClose}>
          <ExternalLink className="w-3.5 h-3.5" />
          Open project details
        </Button>
      </div>
    </div>
  )
}
