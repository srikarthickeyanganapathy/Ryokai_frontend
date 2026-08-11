import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, AlertTriangle, CalendarClock, FolderKanban, Trash2, X, UserPlus } from 'lucide-react'
import { Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Checkbox } from '@/shared/ui/Checkbox'
import { PriorityBadge } from '@/shared/ui/PriorityBadge'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { PillNav } from '@/shared/ui/PillNav'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useDeleteTask, useRejectTask } from '@/task'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'

/* ============================================================
   components/TasksTab.jsx — Work segment (tasks side).
   Urgency-first groups (Overdue → This week → Later → No date →
   Done), filter chips with live counts, and the full task
   function set: quick-complete (canEditTask), inline assign
   (canAssignTask), delete (canDeleteTask + confirm), row click →
   TaskPanel, and a bulk bar (complete / submit for review /
   send back / assign / delete) — all permission-rendered the
   same way as the org-wide tasks page. Status changes go through
   the page's real onUpdateTaskStatus; assignment through
   handleAssignTask (taskId, memberId, username).
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
  if (d < 0) return { label: d === -1 ? 'Overdue' : `${Math.abs(d)}d overdue`, tone: 'danger' }
  if (d === 0) return { label: 'Today', tone: 'warning' }
  if (d <= 7) return { label: `${d}d`, tone: 'warning' }
  return { label: new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), tone: 'muted' }
}

const isDone = t => (t.currentStatus || t.status || '').toUpperCase() === 'DONE'
const isReview = t => /REVIEW|SUBMITTED/.test((t.currentStatus || t.status || '').toUpperCase())
const isOpen = t => !isDone(t)
const statusOf = t => (t.currentStatus || t.status || 'TODO').toUpperCase()

export function AssigneeAvatar({ name, size = 'md' }) {
  const cls = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 text-[10px]'
  if (!name) return <span className={cn(cls, 'rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shrink-0')} />
  return (
    <Avatar className={cn(cls, 'shrink-0')} title={name}>
      <AvatarFallback className={cn(cls, 'font-bold')} style={{ background: `hsl(${hashHue(name)} 65% 48%)`, color: '#fff' }}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

function AssignList({ members, current, onPick }) {
  return (
    <div className="p-1">
      <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Assign to</p>
      {members.length === 0 && <p className="px-2.5 pb-2 text-[11px] text-[var(--text-muted)]">No members.</p>}
      {members.map(m => {
        const name = m.username || m.name
        const isCurrent = name === current
        return (
          <button key={m.id || name} onClick={() => onPick(m)}
            className={cn('w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[var(--bg-subtle)] cursor-pointer text-left', isCurrent && 'text-[var(--accent)] font-bold')}>
            <AssigneeAvatar name={name} size="sm" />
            <span className="flex-1 min-w-0 truncate">{name}</span>
            {isCurrent && <Check className="w-3 h-3" />}
          </button>
        )
      })}
    </div>
  )
}

export function TaskRow({ task, members, canAssignTask, canEditTask, canDeleteTask, isReadOnly, isAssigning, selected, onToggleSelect, onAssign, onComplete, onDelete, onOpen }) {
  const [assignOpen, setAssignOpen] = useState(false)
  const due = dueInfo(task.dueDate)
  const done = isDone(task)
  const review = isReview(task)
  const canComplete = !done && !review && !isReadOnly && canEditTask

  return (
    <div
      className={cn('flex items-center gap-2.5 px-3 py-2.5 relative transition-colors', isAssigning && 'bg-[var(--accent-soft)]/30', onOpen && 'cursor-pointer hover:bg-[var(--bg-subtle)]/50')}
      onClick={() => onOpen?.(task)}
    >
      <Checkbox checked={!!selected} onCheckedChange={onToggleSelect} onClick={e => e.stopPropagation()} className="shrink-0" aria-label={`Select ${task.title}`} />
      {canComplete && (
        <button
          onClick={e => { e.stopPropagation(); onComplete(task) }} title="Mark done"
          className="w-6 h-6 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-transparent hover:text-[var(--success)] hover:border-[var(--success)] hover:bg-[var(--success-soft)] transition-all shrink-0 cursor-pointer">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      )}
      {done && (
        <span className="w-6 h-6 rounded-lg bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30 flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
        </span>
      )}
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', due?.tone === 'danger' ? 'bg-[var(--danger)]' : due?.tone === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--border-default)]')} />
      <span className={cn('flex-1 min-w-0 truncate text-[12.5px]', done ? 'text-[var(--text-muted)] line-through' : 'font-medium')}>{task.title}</span>
      <PriorityBadge priority={task.priority} />
      {due && <Badge variant={due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'outline'} className="text-[10px] shrink-0">{due.label}</Badge>}
      <StatusBadge status={task.currentStatus || task.status} variant="pill" showIcon={false} className="shrink-0" />
      {canDeleteTask && !isReadOnly && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(task) }} title="Delete task"
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all shrink-0 cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="shrink-0" onClick={e => e.stopPropagation()}>
        <Popover open={assignOpen} onOpenChange={setAssignOpen}>
          <PopoverTrigger asChild>
            <button title="Assign" className={cn('block rounded-lg transition-opacity cursor-pointer', (canAssignTask && !isReadOnly) ? 'hover:opacity-80' : 'pointer-events-none')}>
              <AssigneeAvatar name={typeof task.assignedTo === 'string' ? task.assignedTo : task.assignee?.username || task.assignedTo?.username} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-0" align="end">
            <AssignList members={members} current={typeof task.assignedTo === 'string' ? task.assignedTo : task.assignee?.username || task.assignedTo?.username}
              onPick={m => { setAssignOpen(false); onAssign(task.id, m.id, m.username || m.name) }} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due', label: 'Due soon' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

export function TasksTab({
  team, teamTasks, taskBoard, filter = 'all', onFilterChange,
  canAssignTask, canEditTask, canDeleteTask, canReviewTask, isReadOnly,
  assigningTaskId, setAssigningTaskId, handleAssignTask, onUpdateTaskStatus,
  onViewProjects, onOpenTask,
}) {
  const members = team?.members || []
  const { confirm, dialog: confirmDialog } = useConfirmDialog()
  const deleteMutation = useDeleteTask()
  const rejectMutation = useRejectTask()
  const [selectedIds, setSelectedIds] = useState({})
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false)

  const counts = useMemo(() => {
    const c = { all: teamTasks.length, overdue: 0, due: 0, in_progress: 0, done: 0 }
    teamTasks.forEach(t => {
      const d = daysUntil(t.dueDate)
      if (isDone(t)) c.done += 1
      else if (isOpen(t)) c.in_progress += 1
      if (isOpen(t) && d != null && d < 0) c.overdue += 1
      if (isOpen(t) && d != null && d >= 0 && d <= 7) c.due += 1
    })
    return c
  }, [teamTasks])

  const filtered = useMemo(() => {
    let list = teamTasks
    if (filter === 'overdue') list = list.filter(t => isOpen(t) && daysUntil(t.dueDate) != null && daysUntil(t.dueDate) < 0)
    else if (filter === 'due') list = list.filter(t => { const d = daysUntil(t.dueDate); return isOpen(t) && d != null && d >= 0 && d <= 7 })
    else if (filter === 'in_progress') list = list.filter(isOpen)
    else if (filter === 'done') list = list.filter(isDone)
    return list
  }, [teamTasks, filter])

  const groups = useMemo(() => {
    const g = { overdue: [], thisWeek: [], later: [], noDate: [], done: [] }
    filtered.forEach(t => {
      const d = daysUntil(t.dueDate)
      if (isDone(t)) g.done.push(t)
      else if (d == null) g.noDate.push(t)
      else if (d < 0) g.overdue.push(t)
      else if (d <= 7) g.thisWeek.push(t)
      else g.later.push(t)
    })
    const sortDue = (a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)
    g.overdue.sort(sortDue); g.thisWeek.sort(sortDue); g.later.sort(sortDue)
    return [
      { key: 'overdue', label: 'Overdue', tone: 'danger', items: g.overdue },
      { key: 'thisWeek', label: 'This week', tone: 'warning', items: g.thisWeek },
      { key: 'later', label: 'Later', tone: 'accent', items: g.later },
      { key: 'noDate', label: 'No date', tone: 'muted', items: g.noDate },
      { key: 'done', label: 'Done', tone: 'success', items: g.done },
    ].filter(grp => grp.items.length > 0)
  }, [filtered])

  const selectedTasks = useMemo(() => teamTasks.filter(t => selectedIds[String(t.id)]), [teamTasks, selectedIds])
  const selectedCount = selectedTasks.length

  const handleAssign = (taskId, memberId, memberUsername) => {
    setAssigningTaskId?.(taskId)
    handleAssignTask?.(taskId, memberId, memberUsername)
  }

  const handleDelete = async (task) => {
    const ok = await confirm({
      title: 'Delete this task?',
      description: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (ok === false) return
    deleteMutation.mutate(task.id)
  }

  /* ---- bulk actions (same semantics as the org-wide tasks page) ---- */
  const handleBulkComplete = () => {
    let skipped = 0
    selectedTasks.forEach(t => {
      if (!isDone(t) && !isReview(t)) onUpdateTaskStatus?.(t.id, 'DONE')
      else skipped += 1
    })
    if (skipped > 0) toast.info(`${skipped} task(s) skipped (done or in review)`)
    setSelectedIds({})
  }

  const handleBulkSubmit = () => {
    let skipped = 0
    selectedTasks.forEach(t => {
      const s = statusOf(t)
      if (['IN_PROGRESS', 'DOING', 'REJECTED', 'TODO', 'TO_DO'].includes(s)) onUpdateTaskStatus?.(t.id, 'SUBMITTED')
      else skipped += 1
    })
    if (skipped > 0) toast.info(`${skipped} task(s) could not be submitted`)
    setSelectedIds({})
  }

  const handleBulkReject = async () => {
    if (!canReviewTask) { toast.error('You do not have permission to review tasks'); return }
    const submittable = selectedTasks.filter(t => statusOf(t) === 'SUBMITTED')
    if (submittable.length === 0) { toast.error('Only submitted tasks can be sent back'); return }
    const reason = await confirm({
      title: 'Send back for rework',
      description: 'What needs to change?',
      requireInput: true,
      inputPlaceholder: 'e.g. Missing acceptance criteria...',
      confirmLabel: 'Send back',
      danger: true,
    })
    if (reason === false) return
    submittable.forEach(t => rejectMutation.mutate({ id: t.id, reason: reason || 'Rework' }))
    setSelectedIds({})
  }

  const handleBulkAssign = (member) => {
    selectedTasks.forEach(t => handleAssign(t.id, member.id, member.username || member.name))
    setSelectedIds({})
  }

  const handleBulkDelete = async () => {
    if (!canDeleteTask) { toast.error('You do not have permission to delete tasks'); return }
    const ok = await confirm({
      title: `Delete ${selectedCount} task${selectedCount !== 1 ? 's' : ''}?`,
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (ok === false) return
    selectedTasks.forEach(t => deleteMutation.mutate(t.id))
    setSelectedIds({})
  }

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = { ...prev }
    if (next[String(id)]) delete next[String(id)]
    else next[String(id)] = true
    return next
  })

  return (
    <div className="pt-4">
      {confirmDialog}

      {/* Filter tabs + view shortcut */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <PillNav filters={FILTERS} value={filter} onChange={v => onFilterChange?.(v)} counts={counts} />
        <span className="flex-1" />
        {onViewProjects && (
          <Button size="xs" variant="ghost" className="gap-1 text-[11px]" onClick={onViewProjects}>
            <FolderKanban className="w-3 h-3" /> View projects <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Bulk bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 flex-wrap rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/30 px-3 py-2 mb-3">
            <span className="text-[12px] font-bold tabular-nums">{selectedCount} selected</span>
            <Button size="xs" className="gap-1" onClick={handleBulkComplete}><Check className="w-3 h-3" /> Complete</Button>
            <Button size="xs" variant="outline" onClick={handleBulkSubmit}>Submit for review</Button>
            {canReviewTask && <Button size="xs" variant="outline" onClick={handleBulkReject}>Send back</Button>}
            <div className="relative">
              <Popover open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
                <PopoverTrigger asChild>
                  <Button size="xs" variant="outline" className="gap-1">
                    <UserPlus className="w-3 h-3" /> Assign
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-0" align="start">
                  <AssignList members={members} current={null}
                    onPick={m => { setBulkAssignOpen(false); handleBulkAssign(m) }} />
                </PopoverContent>
              </Popover>
            </div>
            {canDeleteTask && (
              <Button size="xs" variant="outline" className="gap-1 text-[var(--danger)]" onClick={handleBulkDelete}>
                <Trash2 className="w-3 h-3" /> Delete
              </Button>
            )}
            <button onClick={() => setSelectedIds({})} className="ml-auto p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgency groups */}
      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)]">
            <EmptyState icon={Check} title="Nothing here" description="No tasks match this filter." className="min-h-[160px]" />
          </div>
        )}
        {groups.map(grp => (
          <section key={grp.key} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] overflow-hidden">
            <header className={cn('flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border-subtle)]',
              grp.tone === 'danger' && 'bg-[var(--danger)]/5', grp.tone === 'warning' && 'bg-[var(--warning)]/5')}>
              {grp.tone === 'danger' && <AlertTriangle className="w-3.5 h-3.5 text-[var(--danger)]" />}
              {grp.tone === 'warning' && <CalendarClock className="w-3.5 h-3.5 text-[var(--warning)]" />}
              {grp.tone === 'accent' && <CalendarClock className="w-3.5 h-3.5 text-[var(--accent)]" />}
              {grp.tone === 'success' && <Check className="w-3.5 h-3.5 text-[var(--success)]" />}
              <Heading level={4} className="text-[12px] font-bold flex-1">{grp.label}</Heading>
              <Badge variant="neutral" className="text-[10px] tabular-nums">{grp.items.length}</Badge>
            </header>
            <div className="divide-y divide-[var(--border-subtle)]">
              {grp.items.map(t => (
                <TaskRow key={t.id} task={t} members={members} canAssignTask={canAssignTask} canEditTask={canEditTask}
                  canDeleteTask={canDeleteTask} isReadOnly={isReadOnly}
                  isAssigning={assigningTaskId === t.id} selected={!!selectedIds[String(t.id)]}
                  onToggleSelect={() => toggleSelect(t.id)} onAssign={handleAssign}
                  onComplete={() => onUpdateTaskStatus?.(t.id, 'DONE')} onDelete={handleDelete} onOpen={onOpenTask} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default TasksTab
