import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { useTaskList, useUpdateTask, useDeleteTask, useSubmitTask, useApproveTask, useReassignTask } from '@/features/tasks/hooks/useTasks'
import { TasksToolbar } from '@/widgets/tasks/TasksToolbar'
import { TasksTable } from '@/widgets/tasks/TasksTable'
import { KanbanBoard } from '@/widgets/tasks/KanbanBoard'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { toast } from 'sonner'
import { Icons } from '@/shared/ui/Icons'
import { normalizeStatus, toBackendStatus } from '@/shared/lib/status'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('view') || 'list'
  const { user } = useAuth()
  
  const setViewMode = (mode) => {
    setSearchParams(params => {
      params.set('view', mode)
      return params
    }, { replace: true })
  }

  const [activeView, setActiveView] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  
  // Task Panel State
  const [selectedTask, setSelectedTask] = useState(null)
  
  const { workspaceMode, activeOrganization } = useWorkspace()

  // Data Fetching — uses backend-compatible status filter
  const { data: tasks, isLoading } = useTaskList({ 
    search: globalFilter,
    status: activeView === 'completed' ? 'APPROVED' : undefined,
    scope: workspaceMode === 'PERSONAL' ? 'personal' : 'org'
  })
  
  // Mutations
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const reassignTaskMutation = useReassignTask()

  const handleQuickComplete = (task) => {
    const current = task.currentStatus?.toUpperCase()
    if (task.isPersonal) {
      updateTaskMutation.mutate({ id: task.id, payload: { status: 'COMPLETED' } })
    } else if (current === 'ASSIGNED' || current === 'REJECTED') {
      submitTaskMutation.mutate(task.id, {
        onSuccess: () => toast.success(`Task "${task.title}" submitted for review.`)
      })
    } else if (current === 'SUBMITTED') {
      approveTaskMutation.mutate(task.id, {
        onSuccess: () => toast.success(`Task "${task.title}" completed.`)
      })
    }
  }

  const handleQuickDelete = (task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => toast.success(`Task deleted.`)
    })
  }

  const handleTaskStatusChange = (task, newStatus) => {
    // Now handled by KanbanBoard's internal workflow mutation logic
    toast.success(`Task moved to ${newStatus}`)
  }

  const [assignInput, setAssignInput] = useState('')
  const [showAssignInput, setShowAssignInput] = useState(false)

  const handleBulkComplete = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    selectedIds.forEach(id => {
      const task = tasks?.find(t => t.id === id)
      if (!task) return
      const current = task.currentStatus?.toUpperCase()
      if (current === 'ASSIGNED' || current === 'REJECTED') {
        submitTaskMutation.mutate(task.id)
        approveTaskMutation.mutate(task.id)
      } else if (current === 'SUBMITTED') {
        approveTaskMutation.mutate(task.id)
      }
    })
    toast.success(`Processing ${selectedIds.length} task(s)...`)
    setRowSelection({})
  }

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    selectedIds.forEach(id => deleteTaskMutation.mutate(id))
    toast.success(`Deleted ${selectedIds.length} task(s)`)
    setRowSelection({})
  }

  const handleBulkAssign = () => {
    if (!assignInput.trim()) return
    const selectedIds = Object.keys(rowSelection).map(Number)
    selectedIds.forEach(id => {
      reassignTaskMutation.mutate({ taskId: id, newAssigneeId: assignInput.trim() })
    })
    toast.success(`Reassigned ${selectedIds.length} task(s) to ${assignInput}`)
    setAssignInput('')
    setShowAssignInput(false)
    setRowSelection({})
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      
      {/* Header */}
      <div className="mb-6">
        <Heading level={2} className="tracking-tight mb-1">My Tasks</Heading>
        <Text variant="muted">Stay focused. Finish what matters.</Text>
      </div>

      {/* Toolbar */}
      <TasksToolbar 
        activeView={activeView}
        onViewChange={setActiveView}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'list' && (
          <TasksTable 
            tasks={tasks}
            isLoading={isLoading}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            onTaskClick={setSelectedTask}
            onQuickComplete={handleQuickComplete}
            onQuickDelete={handleQuickDelete}
          />
        )}
        {viewMode === 'board' && (
          <KanbanBoard 
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={setSelectedTask}
            onTaskStatusChange={handleTaskStatusChange}
          />
        )}
        {viewMode === 'calendar' && (
          <CalendarView 
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={setSelectedTask}
          />
        )}
        
        {/* Floating Bulk Action Bar (Appears when rows are selected in List view) */}
        <AnimatePresence>
          {Object.keys(rowSelection).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-20"
            >
              <Text size="sm" className="font-medium mr-2">
                {Object.keys(rowSelection).length} selected
              </Text>
              <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
              <button onClick={handleBulkComplete} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
                Complete
              </button>
              <button onClick={() => { setShowAssignInput(true); setAssignInput('') }} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Assign
              </button>
              <button onClick={handleBulkDelete} className="text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                Delete
              </button>
              <button 
                onClick={() => setRowSelection({})}
                className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <Icons.x className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Task Workspace (Panel) */}
      <TaskPanel 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
      />

    </div>
  )
}
