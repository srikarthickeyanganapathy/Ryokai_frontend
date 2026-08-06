import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTaskList, useUpdateTask, useDeleteTask, useSubmitTask, useApproveTask, useReassignTask, useCompletePersonalTask, useCompleteCrewTask, useRejectTask, useComments } from '../entities/hooks/useTasks'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from '../features/manage-task/TaskForm'
import { TasksTable } from '../components/TableView/TasksTable'
import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard'
import { TaskDetailView } from '../components/TaskDetailView'
import { TaskIDE } from '../components/TaskIDE'
import { TaskComments, TaskEvidence } from '../components/TaskPanel/TaskPanelExtras'
import ActivityTimeline from '../components/Nebula/explorers/ActivityTimeline'
import NebulaView from '../components/Nebula/components/NebulaView'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { PRIORITY_OPTIONS } from '@/shared/lib/priority'
import { useAuth, useUsersList, usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter'
import { Text } from '@/shared/ui/Typography'

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('view') || 'list'
  const { user } = useAuth()
  const { canReviewTask } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const setViewMode = (mode) => setSearchParams(p => { p.set('view', mode); return p }, { replace: true })

  const [selectedTask, setSelectedTask] = useState(null)
  const { workspaceMode, activeOrganization } = useWorkspace()
  const { data: rawTasks = [], isLoading, refetch } = useTaskList()
  const { data: allUsers } = useUsersList()

  // ─── Filter ───
  const tasks = useMemo(() => {
    if (!rawTasks) return []
    return filterTasksByWorkspace(rawTasks, workspaceMode, activeOrganization)
  }, [rawTasks, workspaceMode, activeOrganization])

  // URL sync
  useEffect(() => {
    const id = searchParams.get('openTaskId')
    if (id && tasks.length > 0) {
      const t = tasks.find(t => String(t.id) === String(id))
      if (t && (!selectedTask || selectedTask.id !== t.id)) setSelectedTask(t)
    }
  }, [searchParams, tasks, selectedTask])

  // ─── Mutations ───
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const submitTask = useSubmitTask()
  const approveTask = useApproveTask()
  const reassignTask = useReassignTask()
  const completePersonal = useCompletePersonalTask()
  const completeCrew = useCompleteCrewTask()
  const rejectTask = useRejectTask()
  const [reassignData, setReassignData] = useState(null)

  const handleTaskSelect = (task) => { setSelectedTask(task); setSearchParams(p => { p.set('openTaskId', task.id); return p }, { replace: true }) }
  const handleTaskClose = () => { setSelectedTask(null); setSearchParams(p => { p.delete('openTaskId'); return p }, { replace: true }) }
  const handleTaskStatusChange = (task, s) => toast.success(`→ ${s}`)
  const handleQuickComplete = (task) => {
    const st = task.currentStatus?.toUpperCase()
    if (task.isPersonal) completePersonal.mutate(task.id)
    else if (task.crewId || task.crew) { if (st === 'IN_PROGRESS') completeCrew.mutate(task.id) }
    else if (st === 'IN_PROGRESS' || st === 'TODO') submitTask.mutate(task.id, { onSuccess: () => toast.success(`"${task.title}" submitted`) })
  }

  const handleReassignSubmit = (p) => {
    if (!reassignData) return
    const u = allUsers?.find(x => x.username === p.assigneeUsername)
    if (u) reassignTask.mutate({ taskId: reassignData.id, newAssigneeId: u.id }, { onSuccess: () => { setReassignData(null); toast.success('Reassigned') } })
  }

  // ─── Dock renderer ───
  const renderDock = (task, tabId) => {
    if (tabId === 'comments') return <div className="p-3"><TaskComments taskId={task.id} hasCommentPerm={workspaceMode === 'PERSONAL' || canReviewTask} /></div>
    if (tabId === 'evidence') return <div className="p-4"><TaskEvidence taskId={task.id} hasEditPerm={task.assignedTo === user?.username} /></div>
    if (tabId === 'activity') return <div className="p-4"><ActivityTimeline taskId={task.id} /></div>
    return null
  }

  // ─── Nebula full screen ───
  if (viewMode === 'nebula') {
    return <div className="fixed inset-0 z-[100] bg-zinc-950"><NebulaView tasks={rawTasks} onTaskSelect={(t) => { if (!t) setViewMode('list') }} /></div>
  }

  return (
    <>
      {confirmDialog}
      <TaskIDE
        tasks={tasks}
        selectedTask={selectedTask}
        onTaskSelect={handleTaskSelect}
        onTaskClose={handleTaskClose}
        user={user}
        workspaceMode={workspaceMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        renderEditor={(task) => <TaskDetailView task={task} />}
        renderBoard={() => <KanbanBoard tasks={tasks} isLoading={isLoading} onTaskClick={handleTaskSelect} onTaskStatusChange={handleTaskStatusChange} />}
        renderDock={renderDock}
        storageKey="tasks-ide"
      />

      {/* Reassign modal */}
      <Modal open={!!reassignData} onOpenChange={(o) => !o && setReassignData(null)}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] p-6">
          <Text size="sm" className="font-semibold mb-4">Reassign Task</Text>
          {reassignData && (
            <TaskForm defaultValues={{
              title: reassignData.title, description: reassignData.description,
              priority: reassignData.priority, dueDate: reassignData.dueDate ? new Date(reassignData.dueDate).toISOString().slice(0, 16) : '',
              assigneeUsername: reassignData.assignedTo || '', tags: reassignData.tags || '',
              teamId: reassignData.teamId ? reassignData.teamId.toString() : ''
            }} onSubmit={handleReassignSubmit} isLoading={updateTask.isPending} />
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
