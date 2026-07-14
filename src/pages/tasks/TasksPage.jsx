import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { useTaskList, useUpdateTask, useDeleteTask, useSubmitTask, useApproveTask, useReassignTask, useCompletePersonalTask } from '@/features/tasks/hooks/useTasks'
import { TasksToolbar } from '@/widgets/tasks/TasksToolbar'
import { TasksTable } from '@/widgets/tasks/TasksTable'
import { KanbanBoard } from '@/widgets/tasks/KanbanBoard'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import NebulaView from '@/features/tasks/components/NebulaView'
import { toast } from 'sonner'
import { Icons } from '@/shared/ui/Icons'
import { normalizeStatus, toBackendStatus } from '@/shared/lib/status'
import { PRIORITY_OPTIONS } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { usePermissions } from '@/context/usePermissions'

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('view') || 'list'
  const { user } = useAuth()
  const { canReview } = usePermissions()

  const setViewMode = (mode) => {
    setSearchParams(params => {
      params.set('view', mode)
      return params
    }, { replace: true })
  }

  const [activeView, setActiveView] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState([])
  const [sortBy, setSortBy] = useState('dueDate')
  const [rowSelection, setRowSelection] = useState({})

  // Task Panel State
  const [selectedTask, setSelectedTask] = useState(null)

  const { workspaceMode, activeOrganization } = useWorkspace()

  // Data Fetching
  const { data: rawTasks, isLoading } = useTaskList({
    scope: workspaceMode === 'PERSONAL' ? 'personal' : 'org'
  })

  const tasks = useMemo(() => {
    if (!rawTasks) return []
    let result = rawTasks

    if (globalFilter) {
      const lowerSearch = globalFilter.toLowerCase()
      result = result.filter(t => t.title?.toLowerCase().includes(lowerSearch) || t.description?.toLowerCase().includes(lowerSearch))
    }

    if (activeView === 'archived') {
      result = result.filter(t => t.archived)
    } else {
      result = result.filter(t => !t.archived)

      if (activeView === 'assigned') {
        result = result.filter(t => t.assignedTo === user?.username)
      } else if (activeView === 'completed') {
        result = result.filter(t => t.status === 'Done')
      } else if (activeView === 'today') {
        const today = new Date().toDateString()
        result = result.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today)
      } else if (activeView === 'upcoming') {
        const today = new Date()
        result = result.filter(t => t.dueDate && new Date(t.dueDate) > today)
      }
    }

    if (priorityFilter.length > 0) {
      result = result.filter(t => priorityFilter.includes(String(t.priority).toUpperCase()))
    }

    const priorityRank = Object.fromEntries(PRIORITY_OPTIONS.map((o, i) => [o.value, i]))
    result = [...result].sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityRank[String(a.priority).toUpperCase()] ?? 99) - (priorityRank[String(b.priority).toUpperCase()] ?? 99)
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      }
      // dueDate default — tasks without a due date sink to the bottom
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

    return result
  }, [rawTasks, activeView, globalFilter, priorityFilter, sortBy, user])

  const { data: allUsers } = useUsersList()

  // Mutations
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const reassignTaskMutation = useReassignTask()

  const completePersonalTaskMutation = useCompletePersonalTask()

  const handleQuickComplete = (task) => {
    const current = task.currentStatus?.toUpperCase()
    if (task.isPersonal) {
      completePersonalTaskMutation.mutate(task.id)
    } else if (current === 'ASSIGNED' || current === 'REJECTED') {
      submitTaskMutation.mutate(task.id, {
        onSuccess: () => toast.success(`Task "${task.title}" submitted for review.`)
      })
    } else if (current === 'SUBMITTED') {
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        return;
      }
      if (task.assignedTo === user?.username) {
        toast.error('You cannot approve your own task');
        return;
      }
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

  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)
  const handleBulkComplete = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    let skipped = 0;
    selectedIds.forEach(id => {
      const task = tasks?.find(t => t.id === id)
      if (!task) return
      const current = task.currentStatus?.toUpperCase()
      if (task.isPersonal) {
        completePersonalTaskMutation.mutate(task.id)
      } else if (current === 'ASSIGNED' || current === 'REJECTED') {
        submitTaskMutation.mutate(task.id)
      } else if (current === 'SUBMITTED') {
        if (!canReview || task.assignedTo === user?.username) {
          skipped++
          return
        }
        approveTaskMutation.mutate(task.id)
      }
    })
    if (skipped > 0) {
      toast.error(`${skipped} task(s) skipped due to review permissions`);
    } else {
      toast.success(`Processing ${selectedIds.length} task(s)...`)
    }
    setRowSelection({})
  }

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).map(Number)
    selectedIds.forEach(id => deleteTaskMutation.mutate(id))
    toast.success(`Deleted ${selectedIds.length} task(s)`)
    setRowSelection({})
  }

  const handleBulkAssign = (targetUser) => {
    if (!targetUser) return
    const selectedIds = Object.keys(rowSelection).map(Number)

    // Instead of mapping row index directly as ID, we need to map the selected row indices to task IDs.
    // Tanstack Table uses row indices by default as the selection keys.
    // So rowSelection looks like: { "0": true, "2": true }
    // We get the actual tasks by their index in the tasks array.
    const actualTaskIds = selectedIds.map(idx => tasks[idx]?.id).filter(Boolean)

    actualTaskIds.forEach(id => {
      reassignTaskMutation.mutate({ taskId: id, newAssigneeId: targetUser.id })
    })
    toast.success(`Reassigned ${actualTaskIds.length} task(s) to ${targetUser.username}`)
    setIsBulkAssignOpen(false)
    setRowSelection({})
  }

  if (viewMode === 'nebula') {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950">
        <button
          onClick={() => setViewMode('list')}
          className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 rounded-lg text-white font-medium shadow-lg cursor-pointer"
        >
          <Icons.chevronLeft className="w-4 h-4" />
          Exit Nebula
        </button>
        <NebulaView
          tasks={tasks}
          onTaskSelect={setSelectedTask}
        />

        <div className="absolute inset-0 pointer-events-none z-50">
          <TaskPanel
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            variant="nebula"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">

      {/* Header */}
      <div className="mb-4">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-0.5">My Tasks</Heading>
        <Text variant="muted" className="text-[13px]">Stay focused. Finish what matters.</Text>
      </div>

      {/* Toolbar */}
      <TasksToolbar
        activeView={activeView}
        onViewChange={setActiveView}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
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
              className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel shadow-[var(--shadow-lg),var(--inset-highlight)] rounded-[var(--radius-pill)] px-5 py-2.5 flex items-center gap-4 z-20"
            >
              <Text size="sm" className="text-[13px] font-medium mr-2">
                {Object.keys(rowSelection).length} selected
              </Text>
              <div className="h-4 w-px bg-[var(--border-default)]" />
              <button onClick={handleBulkComplete} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Complete
              </button>
              <Popover open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
                <PopoverTrigger asChild>
                  <button className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Assign
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="top" className="w-56 p-1 mb-2">
                  <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold tracking-wide">Assign To</Text>
                  <div className="space-y-0.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {allUsers?.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleBulkAssign(u)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded hover:bg-[var(--bg-hover)] transition-colors text-left"
                      >
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] shrink-0">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{u.username}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <button onClick={handleBulkDelete} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors">
                Delete
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
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