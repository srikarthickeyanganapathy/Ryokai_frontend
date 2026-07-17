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
import { usePermissions } from '@/context/usePermissions'
import { useWorkspace } from '@/context/WorkspaceContext'
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

  const handleStatusTransition = async (task, targetColumn) => {
    let targetStatus = toBackendStatus(targetColumn);
    const currentStatus = toBackendStatus(task.currentStatus);

    if (workspaceMode === 'PERSONAL') {
      targetStatus = targetColumn === 'Done' ? 'COMPLETED' : 'TODO'
      if (targetStatus === currentStatus) return;
      if (targetStatus === 'COMPLETED') {
        completePersonalTaskMutation.mutate(task.id)
      } else {
        updateTaskMutation.mutate({ id: task.id, payload: { status: targetStatus } })
      }
      return;
    }

    // FIX (SM-C01): crew tasks follow the no-review pipeline (ASSIGNED/TODO <-> COMPLETED).
    // Any crew member can complete a crew task. No submit/approve/reject transitions.
    if (task.crewId || task.crew) {
      if (targetColumn === 'Done') {
        if (currentStatus === 'ASSIGNED' || currentStatus === 'TODO') {
          completeCrewTaskMutation.mutate(task.id)
        } else {
          toast.error('Crew task must be in To Do to complete')
        }
      } else if (targetColumn === 'To Do') {
        if (currentStatus === 'COMPLETED') {
          toast.error('Completed crew tasks cannot be reopened')
        }
      }
      return;
    }

    if (targetStatus === currentStatus) return;

    // Block moving APPROVED tasks back or anywhere else
    if (currentStatus === 'APPROVED') {
      toast.error('Approved tasks are completed and cannot be moved.');
      return;
    }

    if (targetStatus === 'SUBMITTED') {
      if (currentStatus !== 'ASSIGNED' && currentStatus !== 'REJECTED') {
         toast.error('Can only submit tasks that are To Do or Needs Work');
         return;
      }
      submitMutation.mutate(task.id);
    } else if (targetStatus === 'APPROVED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only approve tasks that are In Review');
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        return;
      }
      if (task.assignedTo === user?.username) {
        toast.error('You cannot approve your own task');
        return;
      }
      approveMutation.mutate(task.id);
    } else if (targetStatus === 'REJECTED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only reject tasks that are In Review');
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        return;
      }
      if (task.assignedTo === user?.username) {
        toast.error('You cannot reject your own task');
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
      if (reason === false) return; // User cancelled
      rejectMutation.mutate({ id: task.id, reason: reason || 'Moved to Needs Work on Kanban' });
    } else if (targetStatus === 'ASSIGNED') {
      // FIX (SM-M03): if the task is SUBMITTED, this is a recall (assignee pulling back).
      if (currentStatus === 'SUBMITTED') {
        recallTaskMutation.mutate(task.id)
      } else {
        toast.error('Tasks cannot be moved back to To Do unless they are In Review (Recall)');
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
    tasks?.forEach(task => {
      const columnId = getKanbanColumnForTask(task)
      if (acc[columnId]) acc[columnId].push(task)
    })
    return acc
  }, [tasks, columns])

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
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    // Get current column of active task based on its status
    const activeColumn = getKanbanColumnForTask(active.data.current.task)

    // If dropping a task over a column
    if (isActiveTask && isOverColumn) {
      if (activeColumn !== overId) {
        handleStatusTransition(active.data.current.task, overId)
      }
    }

    // If dropping a task over another task (adopt the target task's column)
    if (isActiveTask && isOverTask) {
      const overColumn = getKanbanColumnForTask(over.data.current.task)
      if (activeColumn !== overColumn) {
        handleStatusTransition(active.data.current.task, overColumn)
      }
    }
  }

  const handleDragEnd = (event) => {
    setActiveTask(null)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] h-full w-[300px] shrink-0 border border-[var(--border-subtle)] p-3 gap-2.5">
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