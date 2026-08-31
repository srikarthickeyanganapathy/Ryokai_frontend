import React from 'react'
import { KanbanBoard } from './KanbanBoard/KanbanBoard'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { usePermissions } from '@/identity'
import { useDeleteTask } from '../entities/hooks/useTasks'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'

/* ============================================================
   components/TaskBoardSection.jsx -- org-wide kanban.
   Delegates to the project's own KanbanBoard engine: mode-aware
   columns (PERSONAL / CREWS / ORG), the full workflow state
   machine (submit / approve / reject-with-reason / recall /
   claim / complete), permission-rendered drag (card is only
   draggable when the user is authorized), optimistic updates
   with rollback, column quick-add and collapse, and the
   reassign-rejected modal. Quick complete routes through the
   page's status mapping; delete is permission-gated + confirmed.
   ============================================================ */

export function TaskBoardSection({ tasks, onStatusChange, onOpen, canEdit, isLoading, emptyState }) {
  const { workspaceMode } = useWorkspace()
  const { canDeleteTask } = usePermissions()
  const { confirm, dialog } = useConfirmDialog()
  const deleteMutation = useDeleteTask()

  const handleQuickDelete = async (taskId) => {
    if (!canDeleteTask) {
      toast.error('You do not have permission to delete tasks')
      return
    }
    const ok = await confirm({
      title: 'Delete this task?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (ok === false) return
    deleteMutation.mutate(taskId)
  }

  return (
    <>
      {dialog}
      <KanbanBoard
        tasks={tasks}
        mode={workspaceMode}
        responsive
        isLoading={isLoading}
        emptyState={emptyState}
        onTaskClick={onOpen}
        onTaskStatusChange={onStatusChange}
        onQuickComplete={(task) => onStatusChange(task, 'DONE')}
        onQuickDelete={handleQuickDelete}
      />
    </>
  )
}

export default TaskBoardSection
