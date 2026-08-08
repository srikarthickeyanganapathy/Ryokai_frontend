import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { Button } from '@/shared/ui/Button'
import {
  CheckCheckIcon, Calendar, MoreHorizontal, Filter, Plus, CheckSquare,
  Users, Clock, Tag, Archive, ArrowRight, AlertCircle, AlertTriangle,
  ChevronDown, X, KanbanSquare, User, Target, ListTodo
} from '@/shared/ui/Icons'
import { Icons } from '@/shared/ui/Icons'

const IS_DONE = (s) => s === 'Done' || s === 'COMPLETED'
const IS_REVIEW = (s) => String(s || '').toUpperCase().includes('REVIEW')

const COLUMNS = [
  { key: 'unassigned', title: 'To Do',     color: 'bg-slate-400',   accent: 'var(--text-muted)' },
  { key: 'inProgress',  title: 'In Progress', color: 'bg-blue-400',   accent: '#3b82f6' },
  { key: 'review',      title: 'In Review',   color: 'bg-purple-400', accent: '#8b5cf6' },
  { key: 'completed',   title: 'Done',        color: 'bg-emerald-400',accent: '#10b981' },
]

const PRIORITY_DOT = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-blue-500' }
const PRIORITY_ORDER = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

// Aging thresholds in days
const STALE_THRESHOLD = 3
const CRITICAL_STALE_THRESHOLD = 7

const SAVED_VIEWS = [
  { key: 'all',         label: 'All Tasks',     icon: ListTodo },
  { key: 'myTasks',     label: 'My Tasks',      icon: User },
  { key: 'unassigned',  label: 'Unassigned',    icon: Users },
  { key: 'dueThisWeek', label: 'Due This Week', icon: Calendar },
  { key: 'blocked',     label: 'Blocked',       icon: AlertCircle },
]

function isStale(task) {
  if (!task.updatedAt && !task.updated_at) return false
  const updated = new Date(task.updatedAt || task.updated_at)
  const days = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24)
  return { days, stale: days >= STALE_THRESHOLD, critical: days >= CRITICAL_STALE_THRESHOLD }
}

function isDueThisWeek(task) {
  if (!task.dueDate) return false
  const due = new Date(task.dueDate)
  const now = new Date()
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
  return due >= now && due <= endOfWeek
}

function filterBySavedView(tasks, viewKey, currentUserId) {
  switch (viewKey) {
    case 'myTasks':
      return tasks.filter(t => t.assignedTo === currentUserId)
    case 'unassigned':
      return tasks.filter(t => !t.assignedTo)
    case 'dueThisWeek':
      return tasks.filter(t => isDueThisWeek(t) || (t.dueDate && new Date(t.dueDate) < new Date() && !IS_DONE(t.status)))
    case 'blocked':
      return tasks.filter(t => t.status === 'BLOCKED' || t.blocked)
    default:
      return tasks
  }
}

/* ── Animated Count Badge ── */
function AnimatedCountBadge({ count }) {
  const springCount = useSpring(count, { stiffness: 300, damping: 25 })

  return (
    <motion.span
      className="text-[11px] font-mono font-semibold text-[var(--text-muted)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-md border border-[var(--border-subtle)] tabular-nums min-w-[24px] text-center inline-block"
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      key={count}
    >
      {count}
    </motion.span>
  )
}

/* ── Bulk Actions Toolbar ── */
function BulkActionsToolbar({ count, onClear, onArchive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden mb-3"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--accent-soft)]/20 border border-[var(--accent-border)] rounded-xl">
        <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
        <span className="text-[12px] font-semibold text-[var(--accent)]">{count} selected</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1">
            <Users className="w-3 h-3" /> Assign
          </Button>
          <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1">
            <ArrowRight className="w-3 h-3" /> Move
          </Button>
          <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1">
            <Tag className="w-3 h-3" /> Priority
          </Button>
          <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1 text-[var(--danger)]" onClick={onArchive}>
            <Archive className="w-3 h-3" /> Archive
          </Button>
        </div>
        <button onClick={onClear} className="ml-2 p-1 rounded-md hover:bg-[var(--bg-subtle)] transition-colors">
          <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </button>
      </div>
    </motion.div>
  )
}

/* ── KanbanCard (enhanced) ── */
function KanbanCard({ task, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask, onDragStart, isDragging, isSelected, onToggleSelect, isBulkMode }) {
  const priority = normalizePriority(task.priority) || 'Medium'
  const done = IS_DONE(task.status)
  const isReview = IS_REVIEW(task.status)
  const stale = isStale(task)
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !done

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      draggable={!isReadOnly && !isBulkMode}
      onDragStart={onDragStart}
      className={cn(
        'group relative p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm transition-all cursor-grab active:cursor-grabbing',
        done && 'opacity-50',
        isSelected && 'ring-2 ring-[var(--accent)] border-[var(--accent)]'
      )}
    >
      {/* Status indicator bar */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5 rounded-t-xl',
        done ? 'bg-emerald-400' : isReview ? 'bg-purple-400' : 'bg-[var(--accent)]'
      )} />

      <div className="flex items-start justify-between gap-2 mb-2 pt-1">
        {/* Bulk select checkbox */}
        {isBulkMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(task.id) }}
            className="shrink-0 mt-0.5"
          >
            <div className={cn(
              'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
              isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]'
            )}>
              {isSelected && <Icons.check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </button>
        )}

        <span className={cn(
          'text-[12px] font-medium leading-snug flex-1',
          done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
        )}>
          {task.title}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {/* Aging indicator */}
          {!done && stale.stale && (
            <div className="relative group/aging" title={`Last updated ${Math.round(stale.days)}d ago`}>
              <Clock className={cn('w-3 h-3', stale.critical ? 'text-[var(--danger)]' : 'text-[var(--warning)]')} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[var(--text-primary)] text-white text-[9px] rounded-md whitespace-nowrap opacity-0 group-hover/aging:opacity-100 transition-opacity pointer-events-none z-10">
                Last updated {Math.round(stale.days)} days ago
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[var(--text-primary)]" />
              </div>
            </div>
          )}
          <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5', PRIORITY_DOT[priority] || 'bg-gray-400')} title={`${priority} priority`} />
        </div>
      </div>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((l, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              {l}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[9px] text-[var(--text-muted)]">+{task.labels.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {dueDate ? (
          <span className={cn('text-[10px] font-medium flex items-center gap-1', isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')}>
            <Calendar className="w-3 h-3" /> {dueDate}
          </span>
        ) : (
          <span />
        )}

        {task.assignedTo ? (
          <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold shrink-0 border border-[var(--accent-border)]" title={task.assignedTo}>
            {String(task.assignedTo).charAt(0).toUpperCase()}
          </div>
        ) : (
          <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
            <PopoverTrigger asChild>
              <button disabled={!canAssignTask || isReadOnly} className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                <MoreHorizontal className="w-3 h-3" /> Assign
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {team?.members?.map(m => (
                  <button key={m.id} onClick={() => handleAssignTask(task.id, m.id, m.username)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] rounded-md hover:bg-[var(--bg-subtle)] transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold">
                      {String(m.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{m.username}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   TasksTab — Kanban + swimlanes + filters + bulk select
   ══════════════════════════════════════════════════════ */
export function TasksTab({ teamTasks, taskBoard, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask, onUpdateTaskStatus }) {
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterDueDate, setFilterDueDate] = useState('all')
  const [filterLabel, setFilterLabel] = useState('all')
  const [savedView, setSavedView] = useState('all')
  const [swimlane, setSwimlane] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const PRIORITIES = ['all', 'URGENT', 'HIGH', 'MEDIUM', 'LOW']

  // Collect unique assignees and labels
  const assignees = useMemo(() => {
    const set = new Set()
    teamTasks.forEach(t => { if (t.assignedTo) set.add(t.assignedTo) })
    return ['all', ...Array.from(set)]
  }, [teamTasks])

  const allLabels = useMemo(() => {
    const set = new Set()
    teamTasks.forEach(t => { t.labels?.forEach(l => set.add(l)) })
    return ['all', ...Array.from(set)]
  }, [teamTasks])

  // Filter tasks
  const filterTasks = useCallback((tasks) => {
    let filtered = filterBySavedView(tasks, savedView, team?.currentUserId)

    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => normalizePriority(t.priority)?.toUpperCase() === filterPriority)
    }
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === filterAssignee)
    }
    if (filterDueDate === 'today') {
      const today = new Date().toDateString()
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today)
    } else if (filterDueDate === 'week') {
      filtered = filtered.filter(t => isDueThisWeek(t))
    } else if (filterDueDate === 'overdue') {
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !IS_DONE(t.status))
    }
    if (filterLabel !== 'all') {
      filtered = filtered.filter(t => t.labels?.includes(filterLabel))
    }

    return filtered
  }, [filterPriority, filterAssignee, filterDueDate, filterLabel, savedView, team])

  const priorityCounts = useMemo(() => {
    const counts = {}
    PRIORITIES.forEach(p => {
      counts[p] = p === 'all' ? teamTasks.length : teamTasks.filter(t => normalizePriority(t.priority)?.toUpperCase() === p).length
    })
    return counts
  }, [teamTasks])

  const handleDragStart = (e, task) => {
    if (isReadOnly || bulkMode) return
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e, columnKey) => {
    e.preventDefault()
    if (draggedTask && onUpdateTaskStatus) {
      const col = COLUMNS.find(c => c.key === columnKey)
      if (col && draggedTask.status !== col.title && !(columnKey === 'completed' && IS_DONE(draggedTask.status))) {
        const targetStatus = col.title.toUpperCase().replace(' ', '_')
        onUpdateTaskStatus(draggedTask.id, targetStatus)
      }
    }
    setDraggedTask(null)
    setDragOverCol(null)
  }

  const toggleSelect = (taskId) => {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const clearSelection = () => {
    setSelectedTasks(new Set())
    setBulkMode(false)
  }

  const handleQuickCreate = (columnKey) => {
    // Placeholder — parent can wire this up
    console.log('Quick create in column:', columnKey)
  }

  // Group tasks for swimlane view
  const getGroupedTasks = (rawTasks) => {
    const tasks = filterTasks(rawTasks)
    if (!swimlane) return { '': tasks }

    const groups = {}
    tasks.forEach(t => {
      const key = t.assignedTo || 'Unassigned'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })

    // Ensure consistent group order
    const order = Object.keys(groups).sort((a, b) => {
      if (a === 'Unassigned') return -1
      if (b === 'Unassigned') return 1
      return a.localeCompare(b)
    })
    return Object.fromEntries(order.map(k => [k, groups[k]]))
  }

  if (teamTasks.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
        <ImmersiveEmptyState
          icon={CheckCheckIcon}
          title="No tasks yet"
          description="Tasks assigned to this team will appear here in a kanban board."
        />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
      {/* Saved Views Bar */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
        {SAVED_VIEWS.map(view => {
          const Icon = view.icon
          const isActive = savedView === view.key
          return (
            <button
              key={view.key}
              onClick={() => setSavedView(view.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {view.label}
            </button>
          )
        })}
      </div>

      {/* Toolbar: Filters + view toggles */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Priority filter chips */}
          <div className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-0.5">
            {PRIORITIES.map(p => {
              const isActive = filterPriority === p
              const label = p === 'all' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()
              const dot = p === 'all' ? null : PRIORITY_DOT[p]
              return (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1',
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />}
                  {label}
                  <span className="text-[9px] opacity-70">{priorityCounts[p]}</span>
                </button>
              )
            })}
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
              showFilters
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
            )}
          >
            <Filter className="w-3 h-3" />
            Filters
            {(['today', 'week', 'overdue'].includes(filterDueDate) || filterAssignee !== 'all' || filterLabel !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        </div>

        {/* Right toggles */}
        <div className="flex items-center gap-1">
          {/* Swimlane toggle */}
          <button
            onClick={() => setSwimlane(!swimlane)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
              swimlane
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            )}
          >
            <KanbanSquare className="w-3 h-3" />
            Swimlanes
          </button>

          {/* Bulk select toggle */}
          <button
            onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection() }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
              bulkMode
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            )}
          >
            <CheckSquare className="w-3 h-3" />
            Select
          </button>
        </div>
      </div>

      {/* Extended filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
              {/* Assignee filter */}
              {assignees.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[var(--text-muted)]" />
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className="text-[10px] font-medium bg-transparent border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-border)]"
                  >
                    <option value="all">All Assignees</option>
                    {assignees.filter(a => a !== 'all').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Due date filter */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                <select
                  value={filterDueDate}
                  onChange={e => setFilterDueDate(e.target.value)}
                  className="text-[10px] font-medium bg-transparent border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-border)]"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Label filter */}
              {allLabels.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                  <select
                    value={filterLabel}
                    onChange={e => setFilterLabel(e.target.value)}
                    className="text-[10px] font-medium bg-transparent border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-border)]"
                  >
                    <option value="all">All Labels</option>
                    {allLabels.filter(l => l !== 'all').map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex-1" />
              <button
                onClick={() => { setFilterAssignee('all'); setFilterDueDate('all'); setFilterLabel('all') }}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk actions toolbar */}
      <AnimatePresence>
        {bulkMode && selectedTasks.size > 0 && (
          <BulkActionsToolbar
            count={selectedTasks.size}
            onClear={clearSelection}
            onArchive={() => {
              console.log('Archive:', Array.from(selectedTasks))
              clearSelection()
            }}
          />
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const rawTasks = taskBoard[col.key] || []
          const tasks = filterTasks(rawTasks)
          const isDragOver = dragOverCol === col.key
          const grouped = getGroupedTasks(rawTasks)
          const groupEntries = Object.entries(grouped)

          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDrop={e => handleDrop(e, col.key)}
              onDragLeave={() => setDragOverCol(null)}
              className={cn(
                'flex flex-col gap-2 p-2.5 rounded-xl transition-all min-h-[200px]',
                isDragOver && !isReadOnly
                  ? 'bg-[var(--accent-soft)]/30 ring-2 ring-[var(--accent)]/30 shadow-lg shadow-[var(--accent)]/10 scale-[1.01]'
                  : 'bg-[var(--bg-subtle)]/30'
              )}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', col.color)} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{col.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AnimatedCountBadge count={tasks.length} />
                  {!isReadOnly && (
                    <button
                      onClick={() => handleQuickCreate(col.key)}
                      className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
                      title={`Add task to ${col.title}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2 flex-1">
                <AnimatePresence mode="popLayout">
                  {swimlane ? (
                    // Swimlane view — grouped by assignee
                    groupEntries.map(([assignee, assigneeTasks]) => (
                      <div key={assignee} className="mb-2">
                        <div className="flex items-center gap-2 px-1 pb-1.5 mb-1">
                          <div className="w-4 h-4 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[7px] font-bold text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {assignee.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{assignee}</span>
                          <span className="text-[9px] text-[var(--text-muted)]/60">{assigneeTasks.length}</span>
                        </div>
                        <div className="space-y-1.5">
                          {assigneeTasks.map(task => (
                            <KanbanCard
                              key={task.id}
                              task={task}
                              team={team}
                              canAssignTask={canAssignTask}
                              isReadOnly={isReadOnly}
                              assigningTaskId={assigningTaskId}
                              setAssigningTaskId={setAssigningTaskId}
                              handleAssignTask={handleAssignTask}
                              onDragStart={e => handleDragStart(e, task)}
                              isDragging={draggedTask?.id === task.id}
                              isSelected={selectedTasks.has(task.id)}
                              onToggleSelect={toggleSelect}
                              isBulkMode={bulkMode}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Flat view
                    tasks.map(task => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        team={team}
                        canAssignTask={canAssignTask}
                        isReadOnly={isReadOnly}
                        assigningTaskId={assigningTaskId}
                        setAssigningTaskId={setAssigningTaskId}
                        handleAssignTask={handleAssignTask}
                        onDragStart={e => handleDragStart(e, task)}
                        isDragging={draggedTask?.id === task.id}
                        isSelected={selectedTasks.has(task.id)}
                        onToggleSelect={toggleSelect}
                        isBulkMode={bulkMode}
                      />
                    ))
                  )}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-16 border border-dashed border-[var(--border-subtle)] rounded-lg">
                    <Text size="xs" variant="muted" className="opacity-40">Drop tasks here</Text>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
