import { Button } from '@/shared/ui/Button';

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { useTaskList, useUpdateTask, useDeleteTask, useSubmitTask, useApproveTask, useReassignTask, useCompletePersonalTask, useCompleteCrewTask, useRecallTask, useRejectTask } from '@/features/tasks/hooks/useTasks'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from '@/widgets/tasks/TaskForm'
import { TasksToolbar } from '@/widgets/tasks/TasksToolbar'
import { TasksTable } from '@/widgets/tasks/TasksTable'
import { KanbanBoard } from '@/widgets/tasks/KanbanBoard'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import NebulaView from '@/features/tasks/components/NebulaView'
import { toast } from 'sonner'
import { Icons } from '@/shared/ui/Icons'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { normalizeStatus, toBackendStatus } from '@/shared/lib/status'
import { PRIORITY_OPTIONS } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { usePermissions } from '@/shared/hooks/usePermissions'

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('view') || 'list'
  const { user } = useAuth()
  const { canReview } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

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

  // Open task from URL if specified (e.g. from Saved items)
  useEffect(() => {
    const openTaskId = searchParams.get('openTaskId')
    if (openTaskId && tasks && tasks.length > 0) {
      const targetTask = tasks.find(t => String(t.id) === String(openTaskId))
      if (targetTask && (!selectedTask || selectedTask.id !== targetTask.id)) {
        setSelectedTask(targetTask)
      }
    }
  }, [searchParams, tasks, selectedTask])

  const { data: allUsers } = useUsersList()

  // Mutations
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const reassignTaskMutation = useReassignTask()

  const completePersonalTaskMutation = useCompletePersonalTask()
  // FIX (SM-C01): crew tasks follow ASSIGNED -> COMPLETED (no review pipeline).
  const completeCrewTaskMutation = useCompleteCrewTask()
  // FIX (SM-M03): assignee can recall a SUBMITTED task back to ASSIGNED.
  const recallTaskMutation = useRecallTask()
  const rejectTaskMutation = useRejectTask()
  const [reassignTaskData, setReassignTaskData] = useState(null)

  const handleQuickComplete = (task) => {
    const current = task.currentStatus?.toUpperCase()
    if (task.isPersonal) {
      completePersonalTaskMutation.mutate(task.id)
    } else if (task.crewId || task.crew) {
      // FIX (SM-C01): crew tasks use the dedicated complete-crew endpoint.
      // Any crew member can complete a crew task (flat structure, no review).
      if (current === 'ASSIGNED') {
        completeCrewTaskMutation.mutate(task.id)
      } else if (current === 'COMPLETED') {
        toast.info('Task is already completed')
      } else {
        toast.error('Crew task must be in ASSIGNED status to complete')
      }
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
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const selectedTasks = selectedIndices.map(idx => tasks[idx]).filter(Boolean)
    let skipped = 0;

    selectedTasks.forEach(task => {
      const current = task.currentStatus?.toUpperCase()
      if (task.isPersonal) {
        completePersonalTaskMutation.mutate(task.id)
      } else if (task.crewId || task.crew) {
        // FIX (SM-C01): crew tasks use the complete-crew endpoint
        if (current === 'ASSIGNED') {
          completeCrewTaskMutation.mutate(task.id)
        } else {
          skipped++
        }
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
      toast.error(`${skipped} task(s) skipped due to review permissions or status`);
    } else {
      toast.success(`Processing ${selectedTasks.length} task(s)...`)
    }
    setRowSelection({})
  }

  const handleBulkDelete = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const actualTaskIds = selectedIndices.map(idx => tasks[idx]?.id).filter(Boolean)
    actualTaskIds.forEach(id => deleteTaskMutation.mutate(id))
    toast.success(`Deleted ${actualTaskIds.length} task(s)`)
    setRowSelection({})
  }

  const handleBulkSubmit = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const selectedTasks = selectedIndices.map(idx => tasks[idx]).filter(Boolean)
    let skipped = 0

    selectedTasks.forEach(task => {
      const current = task.currentStatus?.toUpperCase()
      if (!task.isPersonal && !task.crewId && !task.crew && (current === 'ASSIGNED' || current === 'REJECTED')) {
        submitTaskMutation.mutate(task.id)
      } else {
        skipped++
      }
    })

    if (skipped > 0) {
      toast.error(`${skipped} task(s) could not be submitted (must be org tasks in ASSIGNED/REJECTED status)`)
    } else {
      toast.success(`Submitting ${selectedTasks.length} task(s) for review...`)
    }
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

  const handleOpenReassignModal = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const selectedTasks = selectedIndices.map(idx => tasks[idx]).filter(Boolean)
    if (selectedTasks.length === 0) return
    setReassignTaskData(selectedTasks[0])
  }

  const handleReassignSubmit = (payload) => {
    if (!reassignTaskData) return
    const targetUser = allUsers?.find(u => u.username === payload.assigneeUsername)
    if (targetUser) {
      reassignTaskMutation.mutate({ taskId: reassignTaskData.id, newAssigneeId: targetUser.id }, {
        onSuccess: () => {
          setReassignTaskData(null)
          setRowSelection({})
        }
      })
    }
  }

  const handleBulkReject = async () => {
    const reason = await confirm({
      title: 'Send back for rework',
      description: 'Let them know what needs to change before it can be approved.',
      requireInput: true,
      inputPlaceholder: 'e.g. Missing acceptance criteria for edge cases…',
      confirmLabel: 'Send back',
      danger: true,
    });
    if (reason === false) return; // User cancelled
    
    const selectedIndices = Object.keys(rowSelection).map(Number)
    const selectedTasks = selectedIndices.map(idx => tasks[idx]).filter(Boolean)
    let skipped = 0

    selectedTasks.forEach(task => {
      const current = task.currentStatus?.toUpperCase()
      if (current === 'SUBMITTED') {
        rejectTaskMutation.mutate({ id: task.id, reason: reason || 'Rework requested' })
      } else {
        skipped++
      }
    })

    if (skipped > 0) {
      toast.error(`${skipped} task(s) skipped (only SUBMITTED tasks can be rejected)`)
    } else {
      toast.success(`Rejecting ${selectedTasks.length} task(s)...`)
    }
    setRowSelection({})
  }

  if (viewMode === 'nebula') {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950">
        <Button
          onClick={() => setViewMode('list')}
          className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 rounded-lg text-white font-medium shadow-lg cursor-pointer"
        >
          <Icons.chevronLeft className="w-4 h-4" />
          Exit Nebula
        </Button>
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative" role="region" aria-label="Tasks">

      {/* Header */}
      <div className="mb-4">
        <Heading level={1} className="tracking-tight text-[20px] font-semibold mb-0.5">My Tasks</Heading>
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
              <Button onClick={handleBulkComplete} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                {workspaceMode === 'PERSONAL' ? 'Complete' : 'Approve'}
              </Button>
              {workspaceMode !== 'PERSONAL' && (
                <>
                  <Button onClick={handleBulkSubmit} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                    Submit
                  </Button>
                  <Button onClick={handleOpenReassignModal} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                    Reassign
                  </Button>
                  <Button onClick={handleBulkReject} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors">
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={handleBulkDelete} className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors">
                Delete
              </Button>
              <Button
                onClick={() => setRowSelection({})}
                className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <Icons.x className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Task Workspace (Panel) */}
      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null)
          if (searchParams.has('openTaskId')) {
            setSearchParams(params => {
              params.delete('openTaskId')
              return params
            }, { replace: true })
          }
        }}
      />

      <Modal open={!!reassignTaskData} onOpenChange={(open) => !open && setReassignTaskData(null)}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] p-6">
          <Heading level={3} className="mb-4 text-[var(--text-primary)]">Reassign Task</Heading>
          {reassignTaskData && (
            <TaskForm 
              defaultValues={{
                title: reassignTaskData.title,
                description: reassignTaskData.description,
                priority: reassignTaskData.priority,
                dueDate: reassignTaskData.dueDate ? new Date(reassignTaskData.dueDate).toISOString().slice(0, 16) : '',
                assigneeUsername: reassignTaskData.assignedTo || '',
                tags: reassignTaskData.tags || '',
                teamId: reassignTaskData.teamId ? reassignTaskData.teamId.toString() : ''
              }}
              onSubmit={handleReassignSubmit} 
              isLoading={updateTaskMutation.isPending} 
            />
          )}
        </ModalContent>
      </Modal>

      {confirmDialog}

    </div>
  )
}