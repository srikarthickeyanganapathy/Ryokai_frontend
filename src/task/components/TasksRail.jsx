import React, { useMemo } from 'react'
import { CalendarClock, Sun, Sunrise } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'
import { ProgressRing } from '@/shared/ui/Progress'
import { EmptyState } from '@/shared/ui/EmptyState'

/* ============================================================
   components/TasksRail.jsx -- week ring + due today / tomorrow.
   Pure presentation derivations over the page's real tasks.
   ============================================================ */

function daysUntil(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  return Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
}

const isOpen = t => (t.currentStatus || t.status || '').toUpperCase() !== 'DONE' && !t.archived

function TaskLine({ task, onOpen }) {
  const d = daysUntil(task.dueDate)
  return (
    <button
      onClick={() => onOpen(task)}
      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer text-left"
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d == null ? 'var(--text-muted)' : d < 0 ? 'var(--danger)' : 'var(--warning)' }} />
      <span className="flex-1 min-w-0">
        <span className="block text-[12px] font-medium truncate">{task.title || 'Untitled task'}</span>
        {task.projectName && <span className="block text-[9.5px] text-[var(--text-muted)] truncate">{task.projectName}</span>}
      </span>
      {d != null && (
        <Badge variant={d < 0 ? 'danger' : d === 0 ? 'danger' : 'warning'} size="xs">
          {d < 0 ? `${Math.abs(d)}d late` : d === 0 ? 'Today' : `${d}d`}
        </Badge>
      )}
    </button>
  )
}

export function TasksRail({ tasks = [], onOpen }) {
  const week = useMemo(() => tasks.filter(t => { const d = daysUntil(t.dueDate); return isOpen(t) && d != null && d >= 0 && d <= 7 }), [tasks])
  const today = useMemo(() => tasks.filter(t => { const d = daysUntil(t.dueDate); return isOpen(t) && d === 0 }), [tasks])
  const tomorrow = useMemo(() => tasks.filter(t => { const d = daysUntil(t.dueDate); return isOpen(t) && d === 1 }), [tasks])

  const total = Math.max(1, tasks.length)
  const done = tasks.filter(t => (t.currentStatus || t.status || '').toUpperCase() === 'DONE').length
  const weekPct = Math.min(100, Math.round((week.length / total) * 100))

  return (
    <aside className="space-y-4 pt-4 lg:pt-0">
      {/* Week ring */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] p-4 flex items-center gap-3.5">
        <ProgressRing value={weekPct} size={56} strokeWidth={5}>
          <span className="text-[13px] font-bold tabular-nums">{week.length}</span>
        </ProgressRing>
        <div>
          <p className="text-[13px] font-bold">Due this week</p>
          <p className="text-[11px] text-[var(--text-secondary)]">{done} of {tasks.length} done overall</p>
        </div>
      </div>

      {/* Due today */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <Sun className="w-4 h-4 text-[var(--warning)]" strokeWidth={1.75} />
          <span className="text-[13px] font-bold">Due today</span>
          <Badge variant="warning" size="xs" className="tabular-nums ml-auto">{today.length}</Badge>
        </div>
        <div className="p-2">
          {today.length === 0 ? (
            <p className="text-[11.5px] text-[var(--text-muted)] px-2 py-3">Nothing due today.</p>
          ) : (
            today.map(t => <TaskLine key={t.id} task={t} onOpen={onOpen} />)
          )}
        </div>
      </div>

      {/* Due tomorrow */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <Sunrise className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
          <span className="text-[13px] font-bold">Due tomorrow</span>
          <Badge variant="secondary" size="xs" className="tabular-nums ml-auto">{tomorrow.length}</Badge>
        </div>
        <div className="p-2">
          {tomorrow.length === 0 ? (
            <p className="text-[11.5px] text-[var(--text-muted)] px-2 py-3">Nothing due tomorrow.</p>
          ) : (
            tomorrow.map(t => <TaskLine key={t.id} task={t} onOpen={onOpen} />)
          )}
        </div>
      </div>

      {tasks.length === 0 && (
        <EmptyState icon={CalendarClock} title="No tasks" description="Tasks will appear here." className="min-h-[160px]" />
      )}
    </aside>
  )
}

export default TasksRail
