import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useCreateTaskWithDependencies } from '../../entities/hooks/useTasks'
import { BottomSheet, BottomSheetContent } from '@/shared/ui/BottomSheet'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Checkbox } from '@/shared/ui/Checkbox'
import { TaskForm } from '../../features/manage-task/TaskForm'
import { BulkCreateTaskModal } from '../../features/manage-task/BulkCreateTaskModal'
import { Heading, Text } from '@/shared/ui/Typography'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

const SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'assigned', label: 'Mine' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Done' },
  { id: 'archived', label: 'Archived' },
]

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
const SORTS = [
  { id: 'dueDate', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'title', label: 'Title' },
  { id: 'updated', label: 'Recent' },
]

export function TasksToolbar({
  taskScope, onScopeChange, globalFilter, setGlobalFilter,
  priorityFilter = [], onPriorityFilterChange, sortBy = 'dueDate', onSortChange,
  projectFilter = 'ALL', onProjectFilterChange, teamFilter = 'ALL', onTeamFilterChange,
  projectsList = [], teamsList = [], toolbarExtras,
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const createMutation = useCreateTaskWithDependencies()
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'

  const activeFilterCount = (priorityFilter.length > 0 ? 1 : 0) + (projectFilter !== 'ALL' ? 1 : 0) + (teamFilter !== 'ALL' ? 1 : 0)
  const togglePriority = (p) => onPriorityFilterChange?.(priorityFilter.includes(p) ? priorityFilter.filter(x => x !== p) : [...priorityFilter, p])

  return (
    <>
      <div className="flex flex-col bg-[var(--bg-base)]/70 backdrop-blur-md">
        {/* Row 1: Search + Actions */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <Input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-9 h-8 bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--accent-border)] focus:border-[var(--accent)] rounded-xl text-[12px] shadow-[var(--shadow-xs)] transition-all w-full"
            />
            {globalFilter && (
              <button onClick={() => setGlobalFilter('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <Icons.x className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter button */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                "h-8 rounded-xl gap-1.5 text-[12px] font-medium text-[var(--text-secondary)]",
                activeFilterCount > 0 && "text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-soft)]"
              )}>
                <Icons.filter className="w-3.5 h-3.5" />
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-2xl space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Priority</span>
                <div className="mt-1 space-y-0.5">
                  {PRIORITIES.map(p => (
                    <label key={p} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer">
                      <Checkbox checked={priorityFilter.includes(p)} onCheckedChange={() => togglePriority(p)} />
                      <span className="text-[12px] font-medium text-[var(--text-primary)] capitalize">{p.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              {projectsList.length > 0 && (
                <div className="border-t border-[var(--border-subtle)] pt-2.5">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Project</span>
                  <select value={projectFilter} onChange={e => onProjectFilterChange?.(e.target.value)}
                    className="mt-1 w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                    <option value="ALL">All Projects</option>
                    {projectsList.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {teamsList.length > 0 && (
                <div className="border-t border-[var(--border-subtle)] pt-2.5">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">Team</span>
                  <select value={teamFilter} onChange={e => onTeamFilterChange?.(e.target.value)}
                    className="mt-1 w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                    <option value="ALL">All Teams</option>
                    {teamsList.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                  </select>
                </div>
              )}
              {activeFilterCount > 0 && (
                <button onClick={() => { onPriorityFilterChange?.([]); onProjectFilterChange?.('ALL'); onTeamFilterChange?.('ALL') }}
                  className="w-full text-left px-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">Clear filters</button>
              )}
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-[12px] font-medium text-[var(--text-secondary)]">
                <Icons.sliders className="w-3.5 h-3.5" />
                {SORTS.find(s => s.id === sortBy)?.label || 'Sort'}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-2xl">
              {SORTS.map(opt => (
                <button key={opt.id} onClick={() => { onSortChange?.(opt.id); setSortOpen(false) }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-colors",
                    sortBy === opt.id ? "text-[var(--accent)] bg-[var(--accent-soft)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}>
                  {opt.label}
                  {sortBy === opt.id && <Icons.check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {toolbarExtras}
            {!isPersonal && (
              <Button variant="outline" size="sm" className="h-8 rounded-xl gap-1.5 text-[12px] font-medium" onClick={() => setBulkOpen(true)}>
                <Icons.users className="w-3.5 h-3.5" /> Bulk
              </Button>
            )}
            <Button size="sm" className="h-8 rounded-xl gap-1.5 text-[12px] font-semibold shadow-[var(--shadow-xs)]" onClick={() => setCreateOpen(true)}>
              <Icons.plus className="w-3.5 h-3.5" /> New Task
            </Button>
          </div>
        </div>

        {/* Row 2: Scope pills */}
        <div className="flex items-center gap-1 px-3 pb-2.5 overflow-x-auto no-scrollbar">
          {SCOPES.map(scope => (
            <button key={scope.id} onClick={() => onScopeChange(scope.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-150",
                taskScope === scope.id
                  ? "bg-[var(--text-primary)] text-[var(--bg-base)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              )}>
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create bottom sheet */}
      <BottomSheet open={createOpen} onOpenChange={setCreateOpen}>
        <BottomSheetContent className="max-w-xl mx-auto">
          <Heading level={3} className="text-[15px] font-bold mb-4">New Task</Heading>
          
            <TaskForm onSubmit={(p) => createMutation.mutate(p, { onSuccess: () => setCreateOpen(false) })} isLoading={createMutation.isPending} />
        </BottomSheetContent>
      </BottomSheet>

      <BulkCreateTaskModal open={bulkOpen} onOpenChange={setBulkOpen} />
    </>
  )
}
