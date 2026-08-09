import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Icons } from '@/shared/ui/Icons'
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/identity'

const SCOPES = [
  { id: 'all',        label: 'All' },
  { id: 'assigned',   label: 'Mine' },
  { id: 'today',      label: 'Today' },
  { id: 'upcoming',   label: 'Upcoming' },
  { id: 'completed',  label: 'Done' },
  { id: 'archived',   label: 'Archived' },
]

const VIEWS = [
  { id: 'kanban',  label: 'Kanban',  iconKey: 'layout' },
  { id: 'list',    label: 'List',    iconKey: 'listTodo' },
]

const Icon = ({ name, className }) => {
  const Comp = Icons[name]
  return Comp ? <Comp className={className} /> : null
}

export function TasksSidebar({
  tasks = [],
  activeView,
  onViewChange,
  taskScope = 'all',
  onScopeChange,
  selectedTaskId,
  onTaskSelect,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}) {
  const { user } = useAuth()

  /* ── Stats + scope counts ── */
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setHours(23, 59, 59, 999)

    const overdue  = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done' && !t.archived)
    const today    = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === todayStr)
    const active   = tasks.filter(t => t.status !== 'Done' && !t.archived)
    const myTasks  = active.filter(t => t.assignedTo === user?.username)
    const assigned = tasks.filter(t => t.assignedTo === user?.username)
    const completed = tasks.filter(t => t.status === 'Done' && !t.archived)
    const archived = tasks.filter(t => t.archived)
    const upcoming = active.filter(
      t => t.dueDate && new Date(t.dueDate) > tomorrow && new Date(t.dueDate).toDateString() !== todayStr
    )

    return {
      overdue,
      today,
      active,
      myTasks,
      assigned,
      completed,
      archived,
      upcoming,
      total: tasks.length,
    }
  }, [tasks, user])

  const scopeCounts = useMemo(() => ({
    all:       stats.total,
    assigned:  stats.assigned.length,
    today:     stats.today.length,
    upcoming:  stats.upcoming.length,
    completed: stats.completed.length,
    archived:  stats.archived.length,
  }), [stats])

  /* ────────────────────────────────────────────
      Collapsed: icon rail
     ──────────────────────────────────────────── */
  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-1.5 h-full bg-[var(--bg-card)] border-r border-[var(--border-subtle)]">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-sm flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all mb-1.5"
        >
          <Icons.chevronRight className="w-4 h-4" />
        </button>

        {VIEWS.map(v => {
          const isActive = activeView === v.id
          return (
            <motion.button
              key={v.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange(v.id)}
              title={v.label}
              className={cn(
                'relative w-9 h-9 rounded-sm flex items-center justify-center transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
              )}
            >
              <Icon name={v.iconKey} className="w-4 h-4" />
            </motion.button>
          )
        })}

        <div className="flex-1" />

        {stats.overdue.length > 0 && (
          <div
            className="w-7 h-7 rounded-sm bg-[var(--danger-soft)] border border-[var(--danger)]/20 flex items-center justify-center"
            title={`${stats.overdue.length} overdue`}
          >
            <span className="text-[9px] font-bold text-[var(--danger)] tabular-nums">
              {stats.overdue.length}
            </span>
          </div>
        )}

        {stats.today.length > 0 && (
          <div
            className="w-7 h-7 rounded-sm bg-[var(--warning-soft)] border border-amber-500/20 flex items-center justify-center"
            title={`${stats.today.length} due today`}
          >
            <span className="text-[9px] font-bold text-[var(--warning)] tabular-nums">
              {stats.today.length}
            </span>
          </div>
        )}

        {stats.myTasks.length > 0 && (
          <div
            className="w-7 h-7 rounded-sm bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center"
            title={`${stats.myTasks.length} my tasks`}
          >
            <span className="text-[9px] font-bold text-[var(--text-muted)] tabular-nums">
              {stats.myTasks.length}
            </span>
          </div>
        )}
      </div>
    )
  }

  /* ────────────────────────────────────────────
      Expanded: premium command sidebar
     ──────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] border-r border-[var(--border-subtle)]">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-1 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] font-bold text-[var(--text-primary)] tracking-[0.08em] uppercase select-none">
            Tasks
          </span>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <Icons.chevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scope Navigation ── */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex flex-col gap-0.5 bg-[var(--bg-subtle)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
          {SCOPES.map(s => {
            const isActive = taskScope === s.id
            return (
              <Button
                key={s.id}
                variant="ghost"
                onClick={() => { onScopeChange?.(s.id); onNavigate?.() }}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 text-[11px] font-medium rounded-sm transition-all h-auto',
                  isActive
                    ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                )}
              >
                <span className="flex items-center justify-between w-full">
                  {s.label}
                  {scopeCounts[s.id] > 0 && (
                    <span className="tabular-nums text-[10px] text-[var(--text-muted)]">
                      {scopeCounts[s.id]}
                    </span>
                  )}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[var(--border-subtle)] mx-4 shrink-0" />

      {/* ── Views ── */}
      <div className="px-3 py-3 shrink-0">
        <span className="block px-2.5 mb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Views
        </span>
        <div className="space-y-0.5">
          {VIEWS.map(v => {
            const isActive = activeView === v.id
            return (
              <motion.button
                key={v.id}
                whileHover={{ x: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onViewChange(v.id); onNavigate?.() }}
                className={cn(
                  'w-full flex items-center gap-3 px-2.5 py-1.5 rounded-sm text-left text-[13px] transition-all duration-150',
                  isActive
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
                )}
              >
                <Icon name={v.iconKey} className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                <span>{v.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Quick Stats ── */}
      <div className="px-3 pb-3 shrink-0 mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {stats.overdue.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-semibold bg-[var(--danger-soft)] text-[var(--danger)]">
              {stats.overdue.length} overdue
            </span>
          )}
          {stats.today.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-semibold bg-[var(--warning-soft)] text-[var(--warning)]">
              {stats.today.length} today
            </span>
          )}
          {stats.active.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)]">
              {stats.active.length} active
            </span>
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-1.5">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">
            {stats.myTasks.length} My Tasks
          </span>
        </div>
      </div>
    </div>
  )
}
