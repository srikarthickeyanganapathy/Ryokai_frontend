import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/ui/Input'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from './TaskForm'
import { BulkCreateTaskModal } from './BulkCreateTaskModal'
import { Heading } from '@/shared/ui/Typography'
import { Users } from 'lucide-react'

import { useWorkspace } from '@/context/WorkspaceContext'

const views = [
  { id: 'all', label: 'All' },
  { id: 'assigned', label: 'Assigned to Me' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
]

export function TasksToolbar({ activeView, onViewChange, globalFilter, setGlobalFilter, viewMode, setViewMode }) {
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false)
  const createTaskMutation = useCreateTask()
  const { workspaceMode } = useWorkspace()
  const isPersonalMode = workspaceMode === 'PERSONAL'

  const handleCreateTask = (payload) => {
    createTaskMutation.mutate(payload, {
      onSuccess: () => setIsQuickCreateOpen(false)
    })
  }

  return (
    <div className="flex flex-col space-y-3 mb-5">
      
      {/* 1. Views Tabs (Primary Hierarchy) */}
      <div className="flex items-center gap-5 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors whitespace-nowrap",
              activeView === view.id 
                ? "text-[var(--text-primary)]" 
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {view.label}
            {activeView === view.id && (
              <motion.div
                layoutId="active-view-tab"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)]"
                transition={{ duration: 0.15 }}
              />
            )}
          </button>
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
          
          {/* Quick Filters Placeholder */}
          <Button variant="outline" size="sm" className="hidden sm:flex text-[var(--text-secondary)]">
            <Icons.settings className="w-3.5 h-3.5 mr-1.5" />
            Filters
          </Button>
          
          {/* Sort Placeholder */}
          <Button variant="outline" size="sm" className="hidden md:flex text-[var(--text-secondary)]">
            <Icons.chevronDown className="w-3.5 h-3.5 mr-1.5" />
            Sort
          </Button>
        </div>

        {/* View Toggles & Quick Create Trigger - Tightened Gap */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Segmented Buttons for List/Board/Calendar */}
          <div className="hidden sm:flex items-center bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-0.5 border border-[var(--border-subtle)] mr-1">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors", viewMode === 'list' ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-xs)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={cn("px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors", viewMode === 'board' ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-xs)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              Board
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={cn("px-2.5 py-1 text-[12px] font-medium rounded-[var(--radius-sm)] transition-colors", viewMode === 'calendar' ? "bg-[var(--bg-elevated)] shadow-[var(--shadow-xs)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
            >
              Calendar
            </button>
          </div>

          {!isPersonalMode && (
            <Button 
              variant="outline"
              size="sm" 
              className="gap-1.5"
              onClick={() => setIsBulkCreateOpen(true)}
            >
              <Users className="w-3.5 h-3.5" />
              Bulk Create
            </Button>
          )}

          <Button 
            size="sm" 
            className="gap-1.5"
            onClick={() => setIsQuickCreateOpen(true)}
          >
            <Icons.tasks className="w-3.5 h-3.5" />
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

      <BulkCreateTaskModal open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen} />
    </div>
  )
}