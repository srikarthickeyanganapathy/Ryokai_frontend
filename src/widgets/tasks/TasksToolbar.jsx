
import { Label } from '@/shared/ui/Typography/Label';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/ui/Input'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Checkbox } from '@/shared/ui/Checkbox'
import { TaskForm } from './TaskForm'
import { BulkCreateTaskModal } from './BulkCreateTaskModal'
import { Heading, Text } from '@/shared/ui/Typography'

import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { usePermissions } from '@/shared/hooks/usePermissions'

const views = [
  { id: 'all', label: 'All' },
  { id: 'assigned', label: 'Assigned to Me' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
]

const PRIORITY_OPTIONS = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
const SORT_OPTIONS = [
  { id: 'dueDate', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
  { id: 'title', label: 'Title (A–Z)' },
  { id: 'updated', label: 'Recently updated' },
]

export function TasksToolbar({
  activeView, onViewChange, globalFilter, setGlobalFilter, viewMode, setViewMode,
  priorityFilter = [], onPriorityFilterChange, sortBy = 'dueDate', onSortChange,
}) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const createTaskMutation = useCreateTask()
  const { workspaceMode } = useWorkspace()
  const isPersonalMode = workspaceMode === 'PERSONAL'
  const canCreate = true // Anyone can create personal/assigned tasks

  const handleCreateTask = (payload) => {
    createTaskMutation.mutate(payload, {
      onSuccess: () => setIsQuickCreateOpen(false)
    })
  }

  const togglePriority = (p) => {
    if (!onPriorityFilterChange) return
    onPriorityFilterChange(priorityFilter.includes(p) ? priorityFilter.filter(x => x !== p) : [...priorityFilter, p])
  }

  return (
    <div className="flex flex-col space-y-3 mb-5">
      
      {/* 1. Views Tabs (Primary Hierarchy) */}
      <div className="flex items-center gap-5 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar">
        {views.map(view => (
          <Button
            key={view.id}
            variant="ghost"
            onClick={() => onViewChange(view.id)}
            className={cn(
              "relative pb-2.5 px-1 text-[13px] font-medium transition-colors duration-[var(--duration-base)] whitespace-nowrap rounded-none hover:bg-transparent",
              activeView === view.id 
                ? "text-[var(--text-primary)]" 
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
            aria-current={activeView === view.id ? 'page' : undefined}
          >
            {view.label}
            {activeView === view.id && (
              <motion.div
                layoutId="active-view-tab"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </Button>
        ))}
      </div>

      {/* 2. Action Toolbar (Secondary Hierarchy) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 flex-1">
          {/* Global Search - Widened */}
          <div className="relative w-full sm:w-80">
            <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <Input 
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search tasks..." 
              className="pl-8" 
            />
          </div>
          
          {/* Filters */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("hidden sm:flex text-[var(--text-secondary)]", priorityFilter.length > 0 && "text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-soft)]")}>
                <Icons.filter className="w-3.5 h-3.5 mr-1.5" />
                Filters
                {priorityFilter.length > 0 && (
                  <span className="ml-1.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] flex items-center justify-center font-semibold">
                    {priorityFilter.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
              <Text size="xs" variant="muted" className="px-1.5 pb-1.5 uppercase tracking-wide font-semibold">Priority</Text>
              <div className="space-y-0.5">
                {PRIORITY_OPTIONS.map(p => (
                  <Label key={p} className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                    <Checkbox checked={priorityFilter.includes(p)} onCheckedChange={() => togglePriority(p)} />
                    <span className="text-[13px] text-[var(--text-primary)] capitalize">{p.toLowerCase()}</span>
                  </Label>
                ))}
              </div>
              {priorityFilter.length > 0 && (
                <Button
                  onClick={() => onPriorityFilterChange?.([])}
                  className="w-full text-left mt-1.5 px-1.5 pt-1.5 border-t border-[var(--border-subtle)] text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Clear filters
                </Button>
              )}
            </PopoverContent>
          </Popover>
          
          {/* Sort */}
          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex text-[var(--text-secondary)]">
                <Icons.sliders className="w-3.5 h-3.5 mr-1.5" />
                Sort
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 p-1.5">
              {SORT_OPTIONS.map(opt => (
                <Button
                  key={opt.id}
                  onClick={() => { onSortChange?.(opt.id); setSortOpen(false) }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-[var(--radius-sm)] text-[13px] transition-colors",
                    sortBy === opt.id ? "text-[var(--accent)] bg-[var(--accent-soft)] font-medium" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {opt.label}
                  {sortBy === opt.id && <Icons.check className="w-3.5 h-3.5" />}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* View Toggles & Quick Create Trigger - Tightened Gap */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Segmented Buttons for List/Board/Calendar */}
          <div className="hidden sm:flex items-center bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-0.5 border border-[var(--border-subtle)] mr-1">
            {['list', 'board', 'nebula'].map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "relative px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-base)] capitalize hover:bg-transparent",
                  viewMode === mode ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                aria-label={`View as ${mode}`}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="view-mode-pill"
                    className="absolute inset-0 bg-[var(--bg-elevated)] shadow-[var(--shadow-xs),var(--inset-highlight-soft)] rounded-[var(--radius-sm)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{mode}</span>
              </Button>
            ))}
          </div>

          {!isPersonalMode && canCreate && (
            <Button 
              variant="outline"
              size="sm" 
              className="gap-1.5"
              onClick={() => setIsBulkCreateOpen(true)}
            >
              <Icons.users className="w-3.5 h-3.5" />
              Bulk Create
            </Button>
          )}

          {canCreate && (
            <Button 
              size="sm" 
              className="gap-1.5"
              onClick={() => setIsQuickCreateOpen(true)}
            >
              <Icons.tasks className="w-3.5 h-3.5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Quick Create Modal */}
      <Modal open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create New Task</Heading>
          <TaskForm 
            onSubmit={handleCreateTask} 
            isLoading={createTaskMutation.isPending} 
          />
        </ModalContent>
      </Modal>

      <BulkCreateTaskModal open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen} />
    </div>
  )
}