import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { KanbanBoard } from '@/task'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { usePermissions } from '@/identity'
import { useDeleteTask } from '@/task'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'

/* ============================================================
   components/BoardTab.jsx — project task board.
   Delegates to the project's own KanbanBoard engine: the full
   workflow state machine (submit / approve / reject-with-reason /
   recall / claim / complete), permission-rendered drag
   (draggable only when the user is authorized: editor, assignee
   or creator), optimistic updates with rollback, column quick-add
   and collapse, and the reassign-rejected modal. Card click opens
   the page's TaskPanel; quick-complete routes through the page's
   status mapping; delete is permission-gated + confirmed.
   ============================================================ */

export function BoardTab({ projectTasks, onUpdateStatus, onTaskDrop, onTaskClick, onNewTask }) {
  const { workspaceMode } = useWorkspace()
  const { canDeleteTask } = usePermissions()
  const { confirm, dialog } = useConfirmDialog()
  const deleteMutation = useDeleteTask()

  // Crew tasks use the crew workflow; otherwise follow the active mode.
  const isCrew = (projectTasks || []).some(t => t.crewId || t.crew)
  const mode = isCrew ? 'CREWS' : workspaceMode === 'PERSONAL' ? 'PERSONAL' : 'ORG'

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
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Task Board</span>
        <span className="text-[11px] text-[var(--text-muted)] tabular-nums">({(projectTasks || []).length} {(projectTasks || []).length === 1 ? 'task' : 'tasks'})</span>
        <span className="flex-1" />
        <Button size="xs" variant="outline" className="gap-1.5" onClick={onNewTask}>
          <Plus className="w-3 h-3" /> New Task
        </Button>
      </div>

      {dialog}
      <KanbanBoard
        tasks={projectTasks}
        mode={mode}
        responsive
        onTaskClick={onTaskClick}
        onTaskStatusChange={onTaskDrop}
        onQuickComplete={onUpdateStatus}
        onQuickDelete={handleQuickDelete}
      />
    </div>
  )
}

export default BoardTab
