import React, { useMemo } from 'react'
import ExplorerNavBar from './ExplorerNavBar'
import { Clock, ArrowRightLeft, User, CalendarDays } from 'lucide-react'
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

  // Blocker events (current state)
  const blockers = useMemo(() => analysis.getBlockers(currentTaskId), [analysis, currentTaskId])
  const unblocks = useMemo(() => analysis.getUnblocks(currentTaskId), [analysis, currentTaskId])

  if (!currentTask || !lifecycle) {
    return <div className="p-4 text-white/30 text-sm italic">No task selected</div>
  }

  return (
    <div className="space-y-4">
      <ExplorerNavBar navigator={navigator} onCenterOnGraph={onCenterOnGraph} />

      {/* Lifecycle Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Age</div>
          <div className="text-sm font-bold text-white">
            {lifecycle.daysSinceCreation !== null ? `${lifecycle.daysSinceCreation}d` : '—'}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Last Activity</div>
          <div className={cn("text-sm font-bold", lifecycle.isStale ? "text-amber-400" : "text-white")}>
            {lifecycle.daysSinceUpdate !== null ? `${lifecycle.daysSinceUpdate}d ago` : '—'}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Deadline</div>
          <div className={cn("text-sm font-bold", lifecycle.isOverdue ? "text-rose-400" : lifecycle.daysUntilDue !== null && lifecycle.daysUntilDue <= 3 ? "text-amber-400" : "text-white")}>
            {lifecycle.daysUntilDue !== null ? (lifecycle.isOverdue ? `${Math.abs(lifecycle.daysUntilDue)}d overdue` : `${lifecycle.daysUntilDue}d left`) : '—'}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Status</div>
          <div className="text-sm font-bold" style={{ color: STATUS_COLORS[lifecycle.status] || '#64748b' }}>
            {lifecycle.status}
          </div>
        </div>
      </div>

      {/* Staleness Warning */}
      {lifecycle.isStale && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300">
            No activity for {lifecycle.daysSinceUpdate} days — this task may be stalled
          </span>
        </div>
      )}

      {/* State Timeline (Visual) */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ArrowRightLeft size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Timeline
          </span>
        </div>
        <div className="relative pl-4 border-l border-white/10 space-y-3">
          {lifecycle.created && (
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border-2 border-zinc-950" />
              <div className="text-[10px] text-white/30 font-mono">{lifecycle.created.toLocaleDateString()}</div>
              <div className="text-xs text-white/70">Task created</div>
            </div>
          )}
          {currentTask.assignedTo && (
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-zinc-950" />
              <div className="text-xs text-white/70">Assigned to <span className="text-purple-300 font-medium">{currentTask.assignedTo}</span></div>
            </div>
          )}
          {blockers.length > 0 && (
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-zinc-950" />
              <div className="text-xs text-white/70">
                {blockers.length} blocker{blockers.length > 1 ? 's' : ''} linked
              </div>
              <div className="mt-1 space-y-0.5">
                {blockers.slice(0, 3).map(b => (
                  <button
                    key={b.id}
                    onClick={() => navigator.navigateTo(b.id)}
                    className="block text-[11px] text-rose-300/70 hover:text-rose-200 transition-colors cursor-pointer truncate"
                  >
                    → {b.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-950"
              style={{ backgroundColor: STATUS_COLORS[lifecycle.status] || '#64748b' }}
            />
            <div className="text-[10px] text-white/30 font-mono">
              {lifecycle.updated ? lifecycle.updated.toLocaleDateString() : 'Current'}
            </div>
            <div className="text-xs text-white/70">
              Current status: <span className="font-medium" style={{ color: STATUS_COLORS[lifecycle.status] }}>{lifecycle.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <User size={12} className="text-purple-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Ownership
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs">
          <div className="flex justify-between mb-1">
            <span className="text-white/40">Assignee</span>
            <span className="text-white/90 font-medium">{currentTask.assignedTo || currentTask.assignee || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Created by</span>
            <span className="text-white/90 font-medium">{currentTask.createdBy || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
