import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { useCreateTask, useCompleteCrewTask, useClaimTask, KanbanBoard } from '@/task';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/identity';
import { cn } from '@/shared/lib/cn';
import { PRIORITY_COLORS, normalizePriority } from '@/shared/lib/priority';
import {
  Plus, CheckCheckIcon, Calendar, Filter, CheckSquare, Users, Clock,
  AlertCircle, KanbanSquare, User, ListTodo, X, CheckCircle2
} from '@/shared/ui/Icons';

const IS_DONE = (s) => s === 'Done' || s === 'COMPLETED'

const PRIORITIES = ['all', 'URGENT', 'HIGH', 'MEDIUM', 'LOW']

const COLUMNS = [
  { key: 'unclaimed', title: 'Unclaimed', color: 'bg-amber-400', accent: 'var(--warning)' },
  { key: 'claimed', title: 'Claimed', color: 'bg-blue-400', accent: 'var(--info)' },
  { key: 'completed', title: 'Completed', color: 'bg-emerald-400', accent: 'var(--success)' },
]

const PRIORITY_DOT = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-blue-500' }

const SAVED_VIEWS = [
  { key: 'all', label: 'All Tasks', icon: ListTodo },
  { key: 'myTasks', label: 'My Claims', icon: User },
  { key: 'unclaimed', label: 'Unclaimed', icon: Users },
  { key: 'dueThisWeek', label: 'Due This Week', icon: Calendar },
  { key: 'blocked', label: 'Blocked', icon: AlertCircle },
]

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
      return tasks.filter(t => t.assignee?.username === currentUserId || t.assigneeUsername === currentUserId || t.assignedTo === currentUserId)
    case 'unclaimed':
      return tasks.filter(t => !t.assignee && !t.assigneeId && !IS_DONE(t.status))
    case 'dueThisWeek':
      return tasks.filter(t => isDueThisWeek(t))
    case 'blocked':
      return tasks.filter(t => t.status === 'BLOCKED' || t.blocked)
    default:
      return tasks
  }
}

function AnimatedCountBadge({ count }) {
  return (
    <span className="min-w-[18px] h-[18px] px-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-secondary)] flex items-center justify-center tabular-nums">
      {count}
    </span>
  )
}

function BulkActionsToolbar({ count, onClear, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-[var(--accent-soft)]/60 border border-[var(--accent-border)]"
    >
      <CheckSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
      <Text size="xs" className="font-semibold text-[var(--accent)]">{count} selected</Text>
      <div className="flex-1" />
      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={onClear}>
        <X className="w-3 h-3" /> Clear
      </Button>
      <Button size="sm" variant="primary" className="h-6 text-[10px] px-2 gap-1" onClick={onComplete}>
        <CheckCheckIcon className="w-3 h-3" /> Complete
      </Button>
    </motion.div>
  )
}

/* Crew task card — teams design language (priority bar, meta footer, hover lift) */
function CrewTaskCard({ task, isSelected, isBulkMode, onToggleSelect, onClaim, onComplete, onTaskClick }) {
  const priority = normalizePriority(task.priority)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ y: -2 }}
      onClick={() => (isBulkMode ? onToggleSelect(task.id) : onTaskClick(task))}
      className={cn(
        'group relative p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm transition-all cursor-pointer',
        isSelected && 'ring-2 ring-[var(--accent)] border-[var(--accent-border)]'
      )}
    >
      <div className={cn('absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full', PRIORITY_COLORS[priority] || 'bg-slate-300')} />

      <div className="pl-2">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Text className={cn('font-semibold text-[13px] leading-tight group-hover:text-[var(--accent)] transition-colors', IS_DONE(task.status) && 'line-through text-[var(--text-muted)]')}>
            {task.title}
          </Text>
          <span className={cn('text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0', PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM)}>
            {priority}
          </span>
        </div>

        {task.description && (
          <Text variant="muted" className="text-[11px] line-clamp-2 mb-2.5 leading-relaxed">
            {task.description}
          </Text>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-[var(--border-subtle)]/60">
          <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-muted)] font-medium">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.assignee || task.assigneeId ? (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[8px] font-bold flex items-center justify-center">
                  {task.assignee?.username?.charAt(0).toUpperCase() || 'M'}
                </div>
                <span className="truncate max-w-[60px]">{task.assignee?.username ? `@${task.assignee.username}` : 'Claimed'}</span>
              </div>
            ) : (
              !IS_DONE(task.status) && (
                <span className="flex items-center gap-1 text-[var(--warning)]">
                  <User className="w-3 h-3" /> Unclaimed
                </span>
              )
            )}
          </div>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {!task.assignee && !task.assigneeId && !IS_DONE(task.status) && (
              <Button
                size="sm" variant="outline"
                className="h-6 text-[10px] px-2 font-semibold hover:bg-[var(--accent-soft)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-colors"
                onClick={() => onClaim(task.id)}
              >
                Claim
              </Button>
            )}
            {!IS_DONE(task.status) && (
              <Button
                size="sm" variant="ghost"
                className="h-6 w-6 p-0 text-[var(--success)] hover:bg-[var(--success-soft)]"
                onClick={() => onComplete(task.id)}
                title="Mark Complete"
              >
                <CheckCheckIcon className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TasksTab({ crewId, tasks }) {
  const { user } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [savedView, setSavedView] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterDueDate, setFilterDueDate] = useState('all')
  const [swimlane, setSwimlane] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  // FIX: reuse the shared useTasks hook — useCreateTask routes to POST /tasks/crew
  // in CREWS workspace mode (same backend contract, single mutation source of truth).
  const createTaskMutation = useCreateTask()
  const claimTaskMutation = useClaimTask()
  const completeTaskMutation = useCompleteCrewTask()

  const assignees = useMemo(() => {
    const set = new Set()
    tasks.forEach(t => { if (t.assignee?.username || t.assignedTo) set.add(t.assignee?.username || t.assignedTo) })
    return ['all', ...Array.from(set)]
  }, [tasks])

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    createTaskMutation.mutate({ title, description, priority, dueDate: dueDate || null, crewId: Number(crewId) }, {
      onSuccess: () => { setIsCreateOpen(false); setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate('') }
    })
  }

  const taskBoard = useMemo(() => {
    const unclaimed = [], claimed = [], completed = []
    tasks.forEach(t => {
      if (IS_DONE(t.status)) { completed.push(t); return }
      if (!t.assignee && !t.assigneeId) { unclaimed.push(t); return }
      claimed.push(t)
    })
    return { unclaimed, claimed, completed }
  }, [tasks])

  const filterTasks = useCallback((rawTasks) => {
    let filtered = filterBySavedView(rawTasks, savedView, user?.username)
    if (filterPriority !== 'all') filtered = filtered.filter(t => normalizePriority(t.priority) === filterPriority)
    if (filterAssignee !== 'all') filtered = filtered.filter(t => (t.assignee?.username || t.assignedTo) === filterAssignee)
    if (filterDueDate === 'today') {
      const today = new Date().toDateString()
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today)
    } else if (filterDueDate === 'week') {
      filtered = filtered.filter(t => isDueThisWeek(t))
    } else if (filterDueDate === 'overdue') {
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !IS_DONE(t.status))
    }
    return filtered
  }, [savedView, filterPriority, filterAssignee, filterDueDate, user])

  const priorityCounts = useMemo(() => {
    const counts = {}
    PRIORITIES.forEach(p => {
      counts[p] = p === 'all' ? tasks.length : tasks.filter(t => normalizePriority(t.priority) === p).length
    })
    return counts
  }, [tasks])

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => IS_DONE(t.status)).length,
    urgent: tasks.filter(t => normalizePriority(t.priority) === 'URGENT').length,
  }), [tasks])

  const toggleSelect = (taskId) => {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const clearSelection = () => { setSelectedTasks(new Set()); setBulkMode(false) }

  const handleBulkComplete = () => {
    selectedTasks.forEach(id => {
      const task = tasks.find(t => String(t.id) === String(id))
      if (task && !IS_DONE(task.status)) completeTaskMutation.mutate(id)
    })
    clearSelection()
  }

  const getGroupedTasks = (rawTasks) => {
    const list = filterTasks(rawTasks)
    if (!swimlane) return { '': list }
    const groups = {}
    list.forEach(t => {
      const key = (t.assignee?.username || t.assignedTo) || 'Unassigned'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    const order = Object.keys(groups).sort((a, b) => {
      if (a === 'Unassigned') return -1
      if (b === 'Unassigned') return 1
      return a.localeCompare(b)
    })
    return Object.fromEntries(order.map(k => [k, groups[k]]))
  }

  if (tasks.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
        <ImmersiveEmptyState
          icon={ListTodo}
          title="No crew tasks yet"
          description="Create a flat task for the crew to claim and execute. Tasks are shared across all members."
          action={
            <Button size="sm" variant="primary" className="gap-1.5 h-8 text-[12px]" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5" /> Create Task
            </Button>
          }
        />
        {renderCreateModal()}
      </motion.div>
    )
  }

  function renderCreateModal() {
    return (
      <>
        <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <ModalContent className="sm:max-w-lg !bg-[var(--bg-card)] !backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
            <div className="flex flex-col space-y-1 mb-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
                <ListTodo className="w-5 h-5" />
              </div>
              <Heading level={3} className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Crew Task</Heading>
              <Text variant="muted" className="text-[12px]">Define a clear, actionable objective for the squad.</Text>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Task Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Deploy v1.2 to production..." required className="h-9 text-[13px] rounded-md font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more context, links, or acceptance criteria..." className="min-h-[80px] text-[13px] rounded-md font-medium resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-9 text-[13px] rounded-md font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-[13px] rounded-md font-medium" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-5 border-t border-[var(--border-subtle)] mt-5">
                <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] font-medium" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" className="h-8 px-4 text-[12px] font-semibold shadow-sm" isLoading={createTaskMutation.isPending}>Create Task</Button>
              </div>
            </form>
          </ModalContent>
        </Modal>


      </>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
      {/* Header + analytics strip */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)]">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] mb-0">Crew Tasks Board</Heading>
            <Text variant="muted" className="text-[12px] mt-0.5">Flat execution board for squad members.</Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Total</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)] tabular-nums">{stats.total}</span>
            <span className="w-px h-3 bg-[var(--border-subtle)]" />
            <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
            <span className="text-[12px] font-semibold text-[var(--text-primary)] tabular-nums">{stats.completed}</span>
            <span className="w-px h-3 bg-[var(--border-subtle)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[12px] font-semibold text-[var(--text-primary)] tabular-nums">{stats.urgent}</span>
          </div>
          <Button size="sm" className="gap-1.5 h-8 px-3 text-[12px] font-semibold shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>
        </div>
      </div>

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

      {/* Toolbar: filters + view toggles */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
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
                    isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />}
                  {label}
                  <span className="text-[9px] opacity-70">{priorityCounts[p]}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border',
              showFilters ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]' : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
            )}
          >
            <Filter className="w-3 h-3" />
            Filters
            {(['today', 'week', 'overdue'].includes(filterDueDate) || filterAssignee !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            )}
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
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex-wrap">
              {assignees.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[var(--text-muted)]" />
                  <select
                    value={filterAssignee}
                    onChange={e => setFilterAssignee(e.target.value)}
                    className="text-[10px] font-medium bg-transparent border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-border)]"
                  >
                    <option value="all">All Assignees</option>
                    {assignees.filter(a => a !== 'all').map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              )}

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

              <div className="flex-1" />
              <button
                onClick={() => { setFilterAssignee('all'); setFilterDueDate('all') }}
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
          <BulkActionsToolbar count={selectedTasks.size} onClear={clearSelection} onComplete={handleBulkComplete} />
        )}
      </AnimatePresence>

      <KanbanBoard
        tasks={filterTasks(tasks)}
        mode="CREWS"
        onTaskClick={(task) => navigate(`/app/tasks/${task.id || task.taskId}`, { state: { task } })}
        responsive={true}
      />

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-8 right-8 w-11 h-11 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-30"
        style={{ display: tasks.length > 0 ? 'flex' : 'none' }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {renderCreateModal()}
    </motion.div>
  )
}
