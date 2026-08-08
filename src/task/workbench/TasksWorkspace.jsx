import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Icons } from '@/shared/ui/Icons'
import { Button } from '@/shared/ui/Button'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { TasksTable } from '../components/TableView/TasksTable'

export function TasksWorkspace({
  tasks = [],
  isLoading,
  isError,
  error,
  onRetry,
  activeView,
  onTaskClick,
  onTaskStatusChange,
  onQuickComplete,
  onQuickDelete,
  rowSelection,
  setRowSelection,
  searchActive = false,
  filtersActive = false,
  onClearFilters,
  onCreateTask,
  selectedTask,
  globalFilter,
  setGlobalFilter,
  priorityFilter = [],
  onPriorityFilterChange,
  sortBy,
  onSortChange,
  projectFilter = 'ALL',
  onProjectFilterChange,
  teamFilter = 'ALL',
  onTeamFilterChange,
  projectsList = [],
  teamsList = [],
  showSidebarToggle = false,
  onSidebarToggle,
  isPanelOverlay = false,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const activeFilterCount = (priorityFilter?.length > 0 ? 1 : 0) + (projectFilter !== 'ALL' ? 1 : 0) + (teamFilter !== 'ALL' ? 1 : 0)

  /* ── Error state ── */
  if (isError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--danger-soft)] border border-[var(--danger)]/20 flex items-center justify-center">
          <Icons.alert className="w-7 h-7 text-[var(--danger)]" />
        </div>
        <div>
          <div className="text-[15px] font-bold text-[var(--text-primary)]">Unable to load tasks</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1.5 max-w-xs leading-relaxed">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </div>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="mt-1 gap-1.5 rounded-xl">
            <Icons.refresh className="w-3.5 h-3.5" />
            Try Again
          </Button>
        )}
      </div>
    )
  }

  /* ── Loading skeleton ── */
  if (isLoading) {
    return <LoadingSkeleton activeView={activeView} />
  }

  /* ── Build empty state element ── */
  let emptyState = null
  if (tasks.length === 0) {
    if (!searchActive && !filtersActive) {
      emptyState = (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center"
          >
            <Icons.checkSquare className="w-7 h-7 text-[var(--text-muted)] opacity-40" />
          </motion.div>
          <div>
            <div className="text-[15px] font-bold text-[var(--text-primary)]">No tasks yet</div>
            <div className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">Create your first task to get started</div>
          </div>
          {onCreateTask && (
            <Button size="sm" onClick={onCreateTask} className="mt-1 gap-1.5 rounded-xl shadow-[var(--shadow-sm)]">
              <Icons.plus className="w-3.5 h-3.5" />
              Create Task
            </Button>
          )}
        </div>
      )
    } else {
      emptyState = (
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Icons.search className="w-6 h-6 text-[var(--text-muted)] opacity-40" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-[var(--text-primary)]">No matching tasks</div>
            <div className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">Try adjusting your search or filters</div>
          </div>
          {onClearFilters && (
            <Button size="sm" variant="outline" onClick={onClearFilters} className="mt-1 gap-1.5 rounded-xl">
              <Icons.x className="w-3.5 h-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* ═══ Header Bar ═══ */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/60">
        {/* Sidebar toggle (drawer mode only) */}
        {showSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Open task navigation"
          >
            <Icons.menu className="w-4 h-4" />
          </button>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-8 py-1.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <Icons.x className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters popover */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-7 rounded-lg gap-1 text-[11px] font-medium text-[var(--text-secondary)]',
                activeFilterCount > 0 && 'text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-soft)]'
              )}
            >
              <Icons.filter className="w-3 h-3" />
              Filters
              {activeFilterCount > 0 && (
                <span className="min-w-[16px] h-[16px] rounded-full bg-[var(--accent)] text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg rounded-lg space-y-2.5">
            {/* Priority checkboxes */}
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Priority</span>
              <div className="mt-1 space-y-0.5">
                {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                  <label key={p} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priorityFilter.includes(p)}
                      onChange={() =>
                        onPriorityFilterChange(
                          priorityFilter.includes(p)
                            ? priorityFilter.filter(x => x !== p)
                            : [...priorityFilter, p]
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-[12px] font-medium text-[var(--text-primary)] capitalize">{p.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Project filter */}
            {projectsList?.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] pt-2.5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Project</span>
                <select
                  value={projectFilter}
                  onChange={e => onProjectFilterChange(e.target.value)}
                  className="mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="ALL">All Projects</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Team filter */}
            {teamsList?.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] pt-2.5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Team</span>
                <select
                  value={teamFilter}
                  onChange={e => onTeamFilterChange(e.target.value)}
                  className="mt-1 w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="ALL">All Teams</option>
                  {teamsList.map(t => (
                    <option key={t.id} value={String(t.id)}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  onPriorityFilterChange([])
                  onProjectFilterChange('ALL')
                  onTeamFilterChange('ALL')
                }}
                className="w-full text-left px-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Clear filters
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* Sort popover */}
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-7 rounded-lg gap-1 text-[11px] font-medium text-[var(--text-secondary)]',
                sortBy && sortBy !== 'newest' && 'text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-soft)]'
              )}
            >
              <Icons.chevronDown className="w-3 h-3" />
              Sort
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-40 p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg rounded-lg">
            {[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Priority ↑', value: 'priority_asc' },
              { label: 'Priority ↓', value: 'priority_desc' },
              { label: 'Due soonest', value: 'due_asc' },
              { label: 'Due latest', value: 'due_desc' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  onSortChange?.(opt.value)
                  setSortOpen(false)
                }}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors',
                  sortBy === opt.value
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create task button */}
        {onCreateTask && (
          <Button size="sm" onClick={onCreateTask} className="h-7 rounded-lg gap-1 text-[11px] font-medium">
            <Icons.plus className="w-3 h-3" />
            New Task
          </Button>
        )}

        {/* Task count */}
        <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* ═══ Content Area ═══ */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="h-full overflow-auto"
          >
            {tasks.length === 0 ? (
              emptyState
            ) : (
              <>
                {activeView === 'kanban' && (
                  <KanbanBoard
                    tasks={tasks}
                    isLoading={false}
                    emptyState={null}
                    onTaskClick={onTaskClick}
                    onTaskStatusChange={onTaskStatusChange}
                    onQuickComplete={onQuickComplete}
                    onQuickDelete={onQuickDelete}
                  />
                )}

                {activeView === 'list' && (
                  <div className="h-full flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-auto">
                      <TasksTable
                        tasks={tasks}
                        isLoading={false}
                        emptyState={null}
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        onTaskClick={onTaskClick}
                        onQuickComplete={onQuickComplete}
                        onQuickDelete={onQuickDelete}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LoadingSkeleton({ activeView }) {
  if (activeView === 'kanban') {
    return (
      <div className="flex gap-4 p-4 h-full overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col rounded-2xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)] w-[85vw] max-w-[320px] sm:w-[320px] shrink-0 p-3 gap-2.5 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--bg-hover)]" />
              <div className="h-4 w-20 bg-[var(--bg-hover)] rounded-md" />
            </div>
            <div className="h-20 bg-[var(--bg-hover)] rounded-xl" />
            <div className="h-24 bg-[var(--bg-hover)] rounded-xl" />
            <div className="h-16 bg-[var(--bg-hover)] rounded-xl" />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-2 animate-pulse">
      <div className="h-9 bg-[var(--bg-subtle)] rounded-xl" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-11 bg-[var(--bg-subtle)] rounded-xl" style={{ opacity: 1 - i * 0.06 }} />
      ))}
    </div>
  )
}
