import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Trash2, UserPlus, UserX } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Checkbox } from '@/shared/ui/Checkbox'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { EmptyState } from '@/shared/ui/EmptyState'
import { normalizePriority, PRIORITY_HEX } from '@/shared/lib/priority'

/* ============================================================
   components/TaskListSection.jsx -- urgency-first task list.
   Groups: Overdue -> This week -> Later -> No date -> Done.
   Selection feeds your bulk bar; assign opens your Reassign
   modal; complete/delete use your quick mutations; clicking a
   row opens your TaskPanel.
   ============================================================ */

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

function daysUntil(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  return Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
}

function dueInfo(dateInput) {
  const d = daysUntil(dateInput)
  if (d == null) return null
  if (d < 0) return { label: d === -1 ? 'Overdue' : `${Math.abs(d)}d overdue`, variant: 'danger' }
  if (d === 0) return { label: 'Today', variant: 'warning' }
  if (d === 1) return { label: 'Tomorrow', variant: 'warning' }
  if (d <= 7) return { label: `${d}d`, variant: 'warning' }
  return { label: new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), variant: 'outline' }
}

const isDone = t => (t.currentStatus || t.status || '').toUpperCase() === 'DONE'
const isReview = t => /REVIEW|SUBMITTED/.test((t.currentStatus || t.status || '').toUpperCase())

function nameOf(t) {
  if (!t) return null
  return typeof t.assignedTo === 'object' ? t.assignedTo?.username : t.assignedTo
}

export function TaskRow({ task, selected, onToggleSelect, canEdit, canDelete, canAssign, onAssign, onComplete, onDelete, onOpen }) {
  const due = dueInfo(task.dueDate)
  const prio = normalizePriority(task.priority)
  const assignee = nameOf(task)
  const done = isDone(task)
  const status = task.currentStatus || task.status || 'To Do'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-subtle)]/70 transition-colors ${selected ? 'bg-[var(--accent-soft)]/40' : ''}`}
    >
      <Checkbox checked={!!selected} onCheckedChange={() => onToggleSelect(task.id)} className="shrink-0" aria-label="Select task" />
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_HEX[prio] || '#9a9ba6' }} />
      <button onClick={() => onOpen(task)} className="flex-1 min-w-0 text-left cursor-pointer">
        <p className={`text-[13px] font-medium truncate ${done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
          {task.title || 'Untitled task'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={status} variant="pill" />
          {!assignee && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)]">
              <UserX className="w-3 h-3" /> unassigned
            </span>
          )}
        </div>
      </button>
      {due && <Badge variant={due.variant} size="sm">{due.label}</Badge>}
      {!done && canEdit && onComplete && (
        <button onClick={() => onComplete(task)} title="Quick complete"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-[var(--bg-card)] transition-all cursor-pointer">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      )}
      {canDelete && onDelete && (
        <button onClick={() => onDelete(task.id)} title="Delete"
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      {assignee ? (
        <Avatar size="sm" className="shrink-0">
          <AvatarFallback style={{ background: `linear-gradient(135deg, hsl(${hashHue(assignee)} 72% 52%), hsl(${(hashHue(assignee) + 35) % 360} 68% 38%))`, color: '#fff', fontSize: 9, fontWeight: 700 }}>
            {assignee.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        canAssign && (
          <button onClick={() => onAssign(task)} title="Assign" className="w-6 h-6 rounded-full border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] flex items-center justify-center text-[12px] shrink-0 cursor-pointer">
            <UserPlus className="w-3 h-3" />
          </button>
        )
      )}
    </motion.div>
  )
}

function Group({ label, tone, tasks, ...rowProps }) {
  if (tasks.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 px-2 pb-2">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${tone}`}>{label}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] font-mono tabular-nums">{tasks.length}</span>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-[var(--shadow-xs)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map(t => <TaskRow key={t.id} task={t} {...rowProps} selected={rowProps.selectedIds?.includes(String(t.id))} onToggleSelect={rowProps.onToggleSelect} />)}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function TaskListSection({
  tasks,
  selectedIds = [],
  onToggleSelect,
  canEdit,
  canDelete,
  canAssign,
  onAssign,
  onComplete,
  onDelete,
  onOpen,
}) {
  const groups = useMemo(() => {
    const open = tasks.filter(t => !isDone(t))
    const done = tasks.filter(isDone)
    const g = [
      { key: 'over', label: 'Overdue', tone: 'text-[var(--danger)]', list: open.filter(t => daysUntil(t.dueDate) != null && daysUntil(t.dueDate) < 0) },
      { key: 'wk', label: 'This week', tone: 'text-[var(--warning)]', list: open.filter(t => { const d = daysUntil(t.dueDate); return d != null && d >= 0 && d <= 7 }) },
      { key: 'later', label: 'Later', tone: 'text-[var(--text-secondary)]', list: open.filter(t => { const d = daysUntil(t.dueDate); return d != null && d > 7 }) },
      { key: 'none', label: 'No date', tone: 'text-[var(--text-muted)]', list: open.filter(t => daysUntil(t.dueDate) == null) },
    ].filter(x => x.list.length > 0)
    if (done.length > 0) g.push({ key: 'done', label: 'Done', tone: 'text-[var(--text-muted)]', list: done })
    return g
  }, [tasks])

  if (tasks.length === 0) {
    return <EmptyState icon={Check} title="No tasks here" description="Try a different filter or search." className="min-h-[280px]" />
  }

  const rowProps = {
    selectedIds,
    onToggleSelect,
    canEdit,
    canDelete,
    canAssign,
    onAssign,
    onComplete,
    onDelete,
    onOpen,
  }

  return (
    <div className="space-y-5">
      {groups.map(g => <Group key={g.key} label={g.label} tone={g.tone} tasks={g.list} {...rowProps} />)}
    </div>
  )
}

export default TaskListSection
