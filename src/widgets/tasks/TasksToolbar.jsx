import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/ui/Input'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from './TaskForm'
import { Heading } from '@/shared/ui/Typography'

const views = [
  { id: 'all', label: 'All' },
  { id: 'assigned', label: 'Assigned to Me' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

export function TasksToolbar({ activeView, onViewChange, globalFilter, setGlobalFilter, viewMode, setViewMode }) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const createTaskMutation = useCreateTask()

  const handleCreateTask = (payload) => {
    createTaskMutation.mutate(payload, {
      onSuccess: () => setIsQuickCreateOpen(false)
    })
  }

  return (
    <div className="flex flex-col space-y-4 mb-6">
      
      {/* 1. Views Tabs (Primary Hierarchy) */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border-subtle)] pb-px overflow-x-auto no-scrollbar">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeView === view.id 
                ? "text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {view.label}
            {activeView === view.id && (
              <motion.div
                layoutId="active-view-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* 2. Action Toolbar (Secondary Hierarchy) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 flex-1">
          {/* Global Search - Widened */}
          <div className="relative w-full sm:w-80">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input 
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search tasks..." 
              className="pl-9 h-9 bg-[var(--bg-elevated)] border-transparent focus:border-[var(--color-border-default)]" 
            />
          </div>
          
          {/* Quick Filters Placeholder */}
          <Button variant="outline" size="sm" className="hidden sm:flex h-9 text-[var(--text-secondary)]">
            <Icons.settings className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          {/* Sort Placeholder */}
          <Button variant="outline" size="sm" className="hidden md:flex h-9 text-[var(--text-secondary)]">
            <Icons.chevronDown className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>

        {/* View Toggles & Quick Create Trigger - Tightened Gap */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Segmented Buttons for List/Board/Calendar */}
          <div className="hidden sm:flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--color-border-subtle)] mr-2">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-colors", viewMode === 'list' ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-colors", viewMode === 'board' ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              Board
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-colors", viewMode === 'calendar' ? "bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              Calendar
            </button>
          </div>

          <Button 
            size="sm" 
            className="h-9 gap-2 shadow-sm"
            onClick={() => setIsQuickCreateOpen(true)}
          >
            <Icons.tasks className="w-4 h-4" />
            New Task
          </Button>
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
    </div>
  )
}
