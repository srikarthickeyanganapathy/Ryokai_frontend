/**
 * NOTE: Per full-stack audit, TaskDependencyController and task history backend contracts
 * are unverified / unopened. This explorer component is currently kept as a general visualization
 * in src/features/task/components/explorers/ rather than pre-committed to a dedicated slice.
 */
import React, { useMemo } from 'react'
import ExplorerNavBar from './ExplorerNavBar'
import ActivityTimeline from './ActivityTimeline'
import { Clock, ArrowRightLeft, User, CalendarDays } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'

const STATUS_COLORS = {
  COMPLETED: '#10b981', DONE: '#10b981',
  IN_PROGRESS: '#3b82f6', IN_REVIEW: '#f59e0b', SUBMITTED: '#f59e0b',
  OPEN: '#64748b', TODO: '#64748b', BLOCKED: '#ef4444'
}

export default function HistoryExplorer({ context, navigator, analysis, onCenterOnGraph }) {
  const { currentTask, currentTaskId } = navigator

  // Compute lifecycle metrics from task data
  const lifecycle = useMemo(() => {
    if (!currentTask) return null

    const created = currentTask.createdAt ? new Date(currentTask.createdAt) : null
    const updated = currentTask.updatedAt ? new Date(currentTask.updatedAt) : null
    const due = currentTask.dueDate ? new Date(currentTask.dueDate) : null
    const now = new Date()
    const status = currentTask.status || currentTask.currentStatus || 'OPEN'

    const daysSinceCreation = created ? Math.floor((now - created) / (1000 * 60 * 60 * 24)) : null
    const daysSinceUpdate = updated ? Math.floor((now - updated) / (1000 * 60 * 60 * 24)) : null
    const daysUntilDue = due ? Math.floor((due - now) / (1000 * 60 * 60 * 24)) : null
    const isOverdue = due && due < now && status !== 'COMPLETED' && status !== 'DONE'
    const isStale = daysSinceUpdate && daysSinceUpdate > 7

    return { created, updated, due, daysSinceCreation, daysSinceUpdate, daysUntilDue, isOverdue, isStale, status }
  }, [currentTask])

  if (!currentTask || !lifecycle) {
    return <div className="p-4 text-[var(--text-tertiary)] text-sm italic">No task selected</div>
  }

  const assigneeName = typeof currentTask.assignee === 'object' ? currentTask.assignee?.username : (currentTask.assignee || currentTask.assignedTo || 'Unassigned');
  const creatorName = typeof currentTask.creator === 'object' ? currentTask.creator?.username : (currentTask.creator || currentTask.createdBy || '—');

  return (
    <div className="space-y-4">
      <ExplorerNavBar navigator={navigator} onCenterOnGraph={onCenterOnGraph} />

      {/* Lifecycle Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Age</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">
            {lifecycle.daysSinceCreation !== null ? `${lifecycle.daysSinceCreation}d` : '—'}
          </div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Last Activity</div>
          <div className={cn("text-sm font-bold", lifecycle.isStale ? "text-amber-400" : "text-[var(--text-primary)]")}>
            {lifecycle.daysSinceUpdate !== null ? `${lifecycle.daysSinceUpdate}d ago` : '—'}
          </div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Deadline</div>
          <div className={cn("text-sm font-bold", lifecycle.isOverdue ? "text-rose-500" : lifecycle.daysUntilDue !== null && lifecycle.daysUntilDue <= 3 ? "text-amber-400" : "text-[var(--text-primary)]")}>
            {lifecycle.daysUntilDue !== null ? (lifecycle.isOverdue ? `${Math.abs(lifecycle.daysUntilDue)}d overdue` : `${lifecycle.daysUntilDue}d left`) : '—'}
          </div>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3">
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Status</div>
          <div className="text-sm font-bold" style={{ color: STATUS_COLORS[lifecycle.status] || '#64748b' }}>
            {lifecycle.status}
          </div>
        </div>
      </div>

      {/* Staleness Warning */}
      {lifecycle.isStale && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--warning-soft)] border border-amber-500/25">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs text-[var(--warning)] font-medium">
            No activity for {lifecycle.daysSinceUpdate} days — this task may be stalled
          </span>
        </div>
      )}

      {/* State Timeline (Visual) */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ArrowRightLeft size={12} className="text-[var(--accent)]" />
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
            Activity Feed
          </span>
        </div>
        
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3">
          <ActivityTimeline taskId={currentTaskId} />
        </div>
      </div>

      {/* Ownership */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <User size={12} className="text-purple-400" />
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
            Ownership
          </span>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-tertiary)]">Assignee</span>
            <span className="text-[var(--text-primary)] font-medium">{assigneeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-tertiary)]">Created by</span>
            <span className="text-[var(--text-primary)] font-medium">{creatorName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
