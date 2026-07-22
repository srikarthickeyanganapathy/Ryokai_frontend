import React, { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanTaskCard } from './KanbanTaskCard'
import { normalizeStatus, getKanbanColumnForTask, KANBAN_COLUMNS, toBackendStatus } from '@/shared/lib/status'
import { useSubmitTask, useApproveTask, useRejectTask, useReassignTask, useUpdateTask, useCompletePersonalTask, useCompleteCrewTask, useRecallTask } from '@/features/tasks/hooks/useTasks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'

export function KanbanBoard({ tasks, isLoading, onTaskClick, onTaskStatusChange }) {
  const [activeTask, setActiveTask] = useState(null)
  const { user } = useAuth()
  const { canReview } = usePermissions()
  const { workspaceMode } = useWorkspace()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const columns = workspaceMode === 'PERSONAL' 
    ? KANBAN_COLUMNS.filter(c => c.id === 'To Do' || c.id === 'Done')
    : KANBAN_COLUMNS
  
  const submitMutation = useSubmitTask();
  const approveMutation = useApproveTask();
  const rejectMutation = useRejectTask();
  const reassignMutation = useReassignTask();
  const updateTaskMutation = useUpdateTask();

  const completePersonalTaskMutation = useCompletePersonalTask();
  // FIX (SM-C01): crew tasks use the complete-crew endpoint (ASSIGNED -> COMPLETED)
  const completeCrewTaskMutation = useCompleteCrewTask();
  // FIX (SM-M03): assignee can recall a SUBMITTED task back to ASSIGNED
  const recallTaskMutation = useRecallTask();

  // Optimistic local state for drag & drop transitions
  const [localTaskMap, setLocalTaskMap] = useState({})

  // Keep local map in sync with incoming tasks, preserving any ongoing optimistic updates
  const effectiveTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.map(t => {
      const override = localTaskMap[t.id]
      return override ? { ...t, ...override } : t
    })
  }, [tasks, localTaskMap])

  const rollbackTask = (taskId) => {
    setLocalTaskMap(prev => {
      const copy = { ...prev }
      delete copy[taskId]
      return copy
    })
  }

  const handleStatusTransition = async (task, targetColumn) => {
    let targetStatus = toBackendStatus(targetColumn);
    const currentStatus = toBackendStatus(task.currentStatus);

    // Optimistically update local task state immediately on drop
    const optimisticStatus = targetStatus === 'COMPLETED' ? 'Done' : targetColumn
    setLocalTaskMap(prev => ({
      ...prev,
      [task.id]: { currentStatus: optimisticStatus, status: optimisticStatus }
    }))

    const onError = (error) => {
      toast.error(error?.response?.data?.message || 'Action failed — reverting task position')
      rollbackTask(task.id)
    }

    if (workspaceMode === 'PERSONAL') {
      targetStatus = targetColumn === 'Done' ? 'COMPLETED' : 'TODO'
      if (targetStatus === currentStatus) {
        rollbackTask(task.id)
        return;
      }
      if (targetStatus === 'COMPLETED') {
        completePersonalTaskMutation.mutate(task.id, { onError })
      } else {
        updateTaskMutation.mutate({ id: task.id, payload: { status: targetStatus } }, { onError })
      }
      return;
    }

    // FIX (SM-C01): crew tasks follow the no-review pipeline (ASSIGNED/TODO <-> COMPLETED).
    if (task.crewId || task.crew) {
      if (targetColumn === 'Done') {
        if (currentStatus === 'ASSIGNED' || currentStatus === 'TODO') {
          completeCrewTaskMutation.mutate(task.id, { onError })
        } else {
          toast.error('Crew task must be in To Do to complete')
          rollbackTask(task.id)
        }
      } else if (targetColumn === 'To Do') {
        if (currentStatus === 'COMPLETED') {
          toast.error('Completed crew tasks cannot be reopened')
          rollbackTask(task.id)
        }
      }
      return;
    }

    if (targetStatus === currentStatus) {
      rollbackTask(task.id)
      return;
    }

    // Block moving APPROVED tasks back or anywhere else
    if (currentStatus === 'APPROVED') {
      toast.error('Approved tasks are completed and cannot be moved.');
      rollbackTask(task.id)
      return;
    }

    if (targetStatus === 'SUBMITTED') {
      const isAllowedSubmit = ['ASSIGNED', 'TODO', 'TO_DO', 'IN_PROGRESS', 'REJECTED', 'NEEDS_WORK'].includes(currentStatus);
      if (!isAllowedSubmit) {
         toast.error('Can only submit tasks that are To Do or Needs Work');
         rollbackTask(task.id)
         return;
      }
      const isRejected = currentStatus === 'REJECTED' || currentStatus === 'NEEDS_WORK';
      if (isRejected && !task.assignedTo && !task.assignee) {
        if (!user?.id) {
          toast.error('Cannot determine your user ID for reassignment.');
          rollbackTask(task.id)
          return;
        }
        toast.info('Claiming rejected task before resubmitting…');
        reassignMutation.mutate(
          { taskId: task.id, newAssigneeId: user.id },
          {
            onSuccess: () => {
              submitMutation.mutate(task.id, { onError });
            },
            onError: (error) => {
              toast.error(error.response?.data?.message || 'Failed to claim task.');
              rollbackTask(task.id)
            }
          }
        );
        return;
      }
      submitMutation.mutate(task.id, { onError });
    } else if (targetStatus === 'APPROVED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only approve tasks that are In Review');
        rollbackTask(task.id)
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        rollbackTask(task.id)
        return;
      }
      const taskAssignee = typeof task.assignedTo === 'object' ? task.assignedTo?.username : (task.assignedTo || task.assignee);
      if (taskAssignee && taskAssignee === user?.username) {
        toast.error('You cannot approve your own task');
        rollbackTask(task.id)
        return;
      }
      approveMutation.mutate(task.id, { onError });
    } else if (targetStatus === 'REJECTED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only reject tasks that are In Review');
        rollbackTask(task.id)
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        rollbackTask(task.id)
        return;
      }
      const taskAssignee = typeof task.assignedTo === 'object' ? task.assignedTo?.username : (task.assignedTo || task.assignee);
      if (taskAssignee && taskAssignee === user?.username) {
        toast.error('You cannot reject your own task');
        rollbackTask(task.id)
        return;
      }
      const reason = await confirm({
        title: 'Send back for rework',
        description: 'Let them know what needs to change before it can be approved.',
        requireInput: true,
        inputPlaceholder: 'e.g. Missing acceptance criteria for edge cases…',
        confirmLabel: 'Send back',
        danger: true,
      });
      if (reason === false) {
        rollbackTask(task.id)
        return; // User cancelled
      }
      rejectMutation.mutate({ id: task.id, reason: reason || 'Moved to Needs Work on Kanban' }, { onError });
    } else if (targetStatus === 'ASSIGNED') {
      if (currentStatus === 'SUBMITTED') {
        recallTaskMutation.mutate(task.id, { onError })
      } else {
        toast.error('Tasks cannot be moved back to To Do unless they are In Review (Recall)');
        rollbackTask(task.id)
      }
    } else {
      if (onTaskStatusChange) {
        onTaskStatusChange(task, targetColumn);
      }
    }
  };

  // Memoize tasks by column id for performance — normalize backend status to column IDs
  const tasksByColumn = useMemo(() => {
    const acc = {}
    columns.forEach(col => acc[col.id] = [])
    effectiveTasks?.forEach(task => {
      const columnId = getKanbanColumnForTask(task)
      if (acc[columnId]) acc[columnId].push(task)
    })
    return acc
  }, [effectiveTasks, columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag threshold so clicks still work
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    setActiveTask(active.data.current?.task)
  }

  const handleDragOver = (event) => {
    // We intentionally do nothing on drag over for API mutations.
    // Real API transitions should only happen on drop (dragEnd), 
    // otherwise hovering over a column will trigger unintended business logic
    // like task approvals or completions before the user commits to the drop.
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active?.data?.current?.type === 'Task'
    const isOverTask = over?.data?.current?.type === 'Task'
    const isOverColumn = over?.data?.current?.type === 'Column'

    // Get current column of active task based on its status
    const activeColumn = getKanbanColumnForTask(active.data.current.task)

    // Dropped a task over a column
    if (isActiveTask && isOverColumn) {
      if (activeColumn !== overId) {
        handleStatusTransition(active.data.current.task, overId)
      }
    }

    // Dropped a task over another task (adopt target's column)
    if (isActiveTask && isOverTask) {
      const overColumn = getKanbanColumnForTask(over.data.current.task)
      if (activeColumn !== overColumn) {
        handleStatusTransition(active.data.current.task, overColumn)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] h-full w-[85vw] max-w-[320px] sm:w-[320px] shrink-0 border border-[var(--border-subtle)] p-3 gap-2.5">
            <div className="h-5 w-28 bg-[var(--bg-elevated)] animate-pulse rounded-[var(--radius-xs)]" />
            <div className="h-20 bg-[var(--bg-elevated)] animate-pulse rounded-[var(--radius-md)]" />
            <div className="h-28 bg-[var(--bg-elevated)] animate-pulse rounded-[var(--radius-md)]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 pb-4 items-start">
      {confirmDialog}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.map(column => (
          <KanbanColumn 
            key={column.id} 
            column={column} 
            tasks={tasksByColumn[column.id] || []} 
            onTaskClick={onTaskClick}
          />
        ))}

        {/* Drag Overlay for smooth beautiful animations */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-1 scale-[1.02] shadow-[var(--shadow-lg)] opacity-95 cursor-grabbing">
              <KanbanTaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}