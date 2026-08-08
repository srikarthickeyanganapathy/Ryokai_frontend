import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from '../features/manage-task/TaskForm'
import { TasksWorkbench } from '../workbench'
import {
  useTaskList,
  useUpdateTask,
  useDeleteTask,
  useSubmitTask,
  useApproveTask,
  useReassignTask,
  useCompletePersonalTask,
  useCompleteCrewTask,
  useRecallTask,
  useRejectTask,
} from '../entities/hooks/useTasks'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { PRIORITY_OPTIONS } from '@/shared/lib/priority'
import { useAuth, useUsersList, usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter'
import { useProjects } from '@/project'
import { useOrgTeams } from '@/organization'
import { useCreateTaskWithDependencies } from '../entities/hooks/useTasks'

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('view') || 'list'
  const { user } = useAuth()
  const { canReview, canEditTask, canDeleteTask, canAssignTask, canReviewTask } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const setViewMode = (mode) => {
    setSearchParams((p) => {
      const currentTaskId = p.get('openTaskId')
      p.set('view', mode)
      if (currentTaskId) p.set('openTaskId', currentTaskId)
      return p
    }, { replace: true })
  }

  const [taskScope, setTaskScope] = useState('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState([])
  const [projectFilter, setProjectFilter] = useState('ALL')
  const [teamFilter, setTeamFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('dueDate')
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)

  const { workspaceMode, activeOrganization } = useWorkspace()
  const { data: rawTasks = [], isLoading, isError, error, refetch } = useTaskList()
  const { data: allProjects = [] } = useProjects()
  const { data: orgTeams = [] } = useOrgTeams(activeOrganization?.id)
  const { data: allUsers } = useUsersList()

  const projectsList = useMemo(() => (allProjects || []).map((p) => ({ id: p.id, name: p.name })), [allProjects])
  const teamsList = useMemo(() => (orgTeams || []).map((t) => ({ id: t.id, name: t.name })), [orgTeams])

  /* ─── Task filtering & sorting (unchanged) ─── */
  const tasks = useMemo(() => {
    if (!rawTasks) return []
    let result = filterTasksByWorkspace(rawTasks, workspaceMode, activeOrganization)

    if (globalFilter) {
      const lower = globalFilter.toLowerCase()
      result = result.filter(
        (t) => t.title?.toLowerCase().includes(lower) || t.description?.toLowerCase().includes(lower)
      )
    }
    if (projectFilter !== 'ALL') {
      result = result.filter(
        (t) => String(t.projectId) === String(projectFilter) || String(t.projectName) === String(projectFilter)
      )
    }
    if (teamFilter !== 'ALL') {
      result = result.filter(
        (t) => String(t.teamId) === String(teamFilter) || String(t.team?.id) === String(teamFilter)
      )
    }
    if (taskScope === 'archived') {
      result = result.filter((t) => t.archived)
    } else {
      result = result.filter((t) => !t.archived)
      if (taskScope === 'assigned') result = result.filter((t) => t.assignedTo === user?.username)
      else if (taskScope === 'completed') result = result.filter((t) => t.status === 'Done')
      else if (taskScope === 'today') {
        const today = new Date().toDateString()
        result = result.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today)
      } else if (taskScope === 'upcoming') {
        const today = new Date()
        result = result.filter((t) => t.dueDate && new Date(t.dueDate) > today)
      }
    }
    if (priorityFilter.length > 0) {
      result = result.filter((t) => priorityFilter.includes(String(t.priority).toUpperCase()))
    }

    const priorityRank = Object.fromEntries(PRIORITY_OPTIONS.map((o, i) => [o.value, i]))
    return [...result].sort((a, b) => {
      if (sortBy === 'priority')
        return (
          (priorityRank[String(a.priority).toUpperCase()] ?? 99) -
          (priorityRank[String(b.priority).toUpperCase()] ?? 99)
        )
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
      if (sortBy === 'updated')
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [
    rawTasks,
    workspaceMode,
    activeOrganization,
    taskScope,
    globalFilter,
    priorityFilter,
    sortBy,
    user,
    projectFilter,
    teamFilter,
  ])

  /* ─── URL sync for selected task ─── */
  useEffect(() => {
    const id = searchParams.get('openTaskId')
    if (id && tasks.length > 0) {
      const t = tasks.find((t) => String(t.id) === String(id))
      if (t) {
        if (!selectedTask || selectedTask.id !== t.id) setSelectedTask(t)
      } else {
        setSelectedTask(null)
        setSearchParams(
          (p) => {
            p.delete('openTaskId')
            return p
          },
          { replace: true }
        )
      }
    } else if (!id && selectedTask) {
      setSelectedTask(null)
    }
  }, [searchParams, tasks, selectedTask, setSearchParams])

  /* ─── Mutations ─── */
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const reassignTaskMutation = useReassignTask()
  const completePersonal = useCompletePersonalTask()
  const completeCrew = useCompleteCrewTask()
  const recallTask = useRecallTask()
  const rejectTask = useRejectTask()
  const [reassignData, setReassignData] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const createTaskMutation = useCreateTaskWithDependencies()

  const isBulkPending =
    completePersonal.isPending ||
    completeCrew.isPending ||
    submitTaskMutation.isPending ||
    approveTaskMutation.isPending ||
    reassignTaskMutation.isPending ||
    rejectTask.isPending ||
    deleteTaskMutation.isPending

  const handleTaskSelect = (task) => {
    setSelectedTask(task)
    setSearchParams(
      (p) => {
        p.set('openTaskId', task.id)
        return p
      },
      { replace: true }
    )
  }

  const handleTaskClose = () => {
    setSelectedTask(null)
    setSearchParams(
      (p) => {
        p.delete('openTaskId')
        return p
      },
      { replace: true }
    )
  }

  const handleTaskStatusChange = (task, s) => toast.success(`→ ${s}`)

  const handleQuickComplete = (task) => {
    const current = task.currentStatus?.toUpperCase()
    if (task.isPersonal) {
      completePersonal.mutate(task.id)
    } else if (task.crewId || task.crew) {
      if (current === 'IN_PROGRESS') completeCrew.mutate(task.id)
      else if (current === 'COMPLETED') toast.info('Already completed')
      else toast.error('Crew task must be ASSIGNED to complete')
    } else if (current === 'IN_PROGRESS' || current === 'TODO') {
      submitTaskMutation.mutate(task.id, {
        onSuccess: () => toast.success(`"${task.title}" submitted`),
      })
    } else if (current === 'REJECTED') {
      toast.error('Rejected tasks must be reassigned first')
    }
  }

  const handleQuickDelete = (id) => deleteTaskMutation.mutate(id)

  /* ─── Bulk operations ─── */
  const selectedIndices = Object.keys(rowSelection).map(Number)
  const selectedTasks = selectedIndices.map((i) => tasks[i]).filter(Boolean)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)

  const handleBulkComplete = () => {
    let skipped = 0
    selectedTasks.forEach((task) => {
      const cur = task.currentStatus?.toUpperCase()
      if (task.isPersonal) completePersonal.mutate(task.id)
      else if (task.crewId || task.crew) {
        if (cur === 'IN_PROGRESS') completeCrew.mutate(task.id)
        else skipped++
      } else if (cur === 'IN_PROGRESS' || cur === 'REJECTED') submitTaskMutation.mutate(task.id)
      else if (cur === 'SUBMITTED') {
        if (!canReview || task.assignedTo === user?.username) {
          skipped++
          return
        }
        approveTaskMutation.mutate(task.id)
      }
    })
    if (skipped > 0) toast.error(`${skipped} task(s) skipped`)
    setRowSelection({})
  }

  const handleBulkSubmit = () => {
    let skipped = 0
    selectedTasks.forEach((task) => {
      const cur = task.currentStatus?.toUpperCase()
      if (
        !task.isPersonal &&
        !task.crewId &&
        !task.crew &&
        (cur === 'IN_PROGRESS' || cur === 'REJECTED')
      )
        submitTaskMutation.mutate(task.id)
      else skipped++
    })
    if (skipped > 0) toast.error(`${skipped} task(s) could not be submitted`)
    setRowSelection({})
  }

  const handleBulkAssign = (targetUser) => {
    if (!targetUser) return
    selectedTasks.forEach((task) =>
      reassignTaskMutation.mutate({ taskId: task.id, newAssigneeId: targetUser.id })
    )
    toast.success(`Reassigned to ${targetUser.username}`)
    setIsBulkAssignOpen(false)
    setRowSelection({})
  }

  const handleBulkDelete = () => {
    selectedTasks.forEach((t) => deleteTaskMutation.mutate(t.id))
    toast.success(`Deleted ${selectedTasks.length} task(s)`)
    setRowSelection({})
  }

  const handleBulkReject = async () => {
    const reason = await confirm({
      title: 'Send back for rework',
      description: 'What needs to change?',
      requireInput: true,
      inputPlaceholder: 'e.g. Missing criteria…',
      confirmLabel: 'Send back',
      danger: true,
    })
    if (reason === false) return
    let skipped = 0
    selectedTasks.forEach((task) => {
      if (task.currentStatus?.toUpperCase() === 'SUBMITTED')
        rejectTask.mutate({ id: task.id, reason: reason || 'Rework' })
      else skipped++
    })
    if (skipped > 0) toast.error(`${skipped} task(s) skipped`)
    setRowSelection({})
  }

  const handleReassignSubmit = (payload) => {
    if (!reassignData) return
    const u = allUsers?.find((x) => x.username === payload.assigneeUsername)
    if (u)
      reassignTaskMutation.mutate(
        { taskId: reassignData.id, newAssigneeId: u.id },
        {
          onSuccess: () => {
            setReassignData(null)
            setRowSelection({})
          },
        }
      )
  }

  const navigate = useNavigate()

  /* ─── Derived state ─── */
  const searchActive = globalFilter.length > 0
  const filtersActive =
    taskScope !== 'all' || priorityFilter.length > 0 || projectFilter !== 'ALL' || teamFilter !== 'ALL'

  const handleClearFilters = () => {
    setGlobalFilter('')
    setPriorityFilter([])
    setProjectFilter('ALL')
    setTeamFilter('ALL')
    setTaskScope('all')
  }

  const handleCreateTask = () => {
    setCreateOpen(true)
  }

  const effectiveView = viewMode

  return (
    <>
      {confirmDialog}

      <TasksWorkbench
        tasks={tasks}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        selectedTask={selectedTask}
        onTaskSelect={handleTaskSelect}
        onTaskClose={handleTaskClose}
        activeView={effectiveView}
        onViewChange={setViewMode}
        onTaskStatusChange={handleTaskStatusChange}
        onQuickComplete={handleQuickComplete}
        onQuickDelete={handleQuickDelete}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        user={user}
        searchActive={searchActive}
        filtersActive={filtersActive}
        onClearFilters={handleClearFilters}
        onCreateTask={handleCreateTask}
        taskScope={taskScope}
        onScopeChange={setTaskScope}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        teamFilter={teamFilter}
        onTeamFilterChange={setTeamFilter}
        projectsList={projectsList}
        teamsList={teamsList}
        workspaceFooter={
          <AnimatePresence>
            {Object.keys(rowSelection).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg backdrop-blur-xl"
              >
                <Text size="sm" className="text-[13px] font-medium">
                  {Object.keys(rowSelection).length} selected
                </Text>
                <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
                {(workspaceMode === 'PERSONAL' || canReviewTask) && (
                  <Button
                    variant="ghost"
                    onClick={handleBulkComplete}
                    disabled={isBulkPending}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  >
                    {workspaceMode === 'PERSONAL' ? 'Complete' : 'Approve'}
                  </Button>
                )}
                {workspaceMode !== 'PERSONAL' && (
                  <>
                    {(workspaceMode === 'PERSONAL' || canEditTask) && (
                      <Button
                        variant="ghost"
                        onClick={handleBulkSubmit}
                        disabled={isBulkPending}
                        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      >
                        Submit
                      </Button>
                    )}
                    {(workspaceMode === 'PERSONAL' || canAssignTask) && (
                      <Button
                        variant="ghost"
                        onClick={() => setIsBulkAssignOpen(true)}
                        disabled={isBulkPending}
                        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]"
                      >
                        Reassign
                      </Button>
                    )}
                    {(workspaceMode === 'PERSONAL' || canReviewTask) && (
                      <Button
                        variant="ghost"
                        onClick={handleBulkReject}
                        disabled={isBulkPending}
                        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--danger)]"
                      >
                        Reject
                      </Button>
                    )}
                  </>
                )}
                {(workspaceMode === 'PERSONAL' || canDeleteTask) && (
                  <Button
                    variant="ghost"
                    onClick={handleBulkDelete}
                    disabled={isBulkPending}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--danger)]"
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setRowSelection({})}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Icons.x className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        }
      />

      {/* ── Reassign modal ── */}
      <Modal open={!!reassignData} onOpenChange={(o) => !o && setReassignData(null)}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-lg">
          <Heading level={3} className="mb-4 text-[var(--text-primary)]">
            Reassign Task
          </Heading>
          {reassignData && (
            <TaskForm
              defaultValues={{
                title: reassignData.title,
                description: reassignData.description,
                priority: reassignData.priority,
                dueDate: reassignData.dueDate
                  ? new Date(reassignData.dueDate).toISOString().slice(0, 16)
                  : '',
                assigneeUsername: reassignData.assignedTo || '',
                tags: reassignData.tags || '',
                teamId: reassignData.teamId ? reassignData.teamId.toString() : '',
              }}
              onSubmit={handleReassignSubmit}
              isLoading={updateTaskMutation.isPending}
            />
          )}
        </ModalContent>
      </Modal>

      {/* ── Create task modal ── */}
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-lg p-0">
          <div className="px-6 pt-6 pb-4 border-b border-[var(--border-subtle)]">
            <Heading level={3} className="text-[15px] font-bold text-[var(--text-primary)]">New Task</Heading>
          </div>
          <div className="p-6">
            <TaskForm
              onSubmit={(p) =>
                createTaskMutation.mutate(p, {
                  onSuccess: () => setCreateOpen(false),
                })
              }
              isLoading={createTaskMutation.isPending}
            />
          </div>
        </ModalContent>
      </Modal>

      {/* ── Bulk assign modal ── */}
      <Modal open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
        <ModalContent className="sm:max-w-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <Heading level={4} className="mb-3 text-[var(--text-primary)]">
            Assign to
          </Heading>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {(allUsers || []).map((u) => (
              <button
                key={u.id}
                onClick={() => handleBulkAssign(u)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-[13px] text-[var(--text-primary)] text-left"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <span>{u.username}</span>
              </button>
            ))}
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
