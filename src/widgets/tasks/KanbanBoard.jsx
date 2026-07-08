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
import { useSubmitTask, useApproveTask, useRejectTask, useReassignTask, useUpdateTask } from '@/features/tasks/hooks/useTasks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { toast } from 'sonner'

export function KanbanBoard({ tasks, isLoading, onTaskClick, onTaskStatusChange }) {
  const [activeTask, setActiveTask] = useState(null)
  const { user } = useAuth()
  const { workspaceMode } = useWorkspace()

  const columns = workspaceMode === 'PERSONAL' 
    ? KANBAN_COLUMNS.filter(c => c.id === 'To Do' || c.id === 'Done')
    : KANBAN_COLUMNS
  
  const submitMutation = useSubmitTask();
  const approveMutation = useApproveTask();
  const rejectMutation = useRejectTask();
  const reassignMutation = useReassignTask();
  const updateTaskMutation = useUpdateTask();

  const handleStatusTransition = (task, targetColumn) => {
    let targetStatus = toBackendStatus(targetColumn);
    const currentStatus = toBackendStatus(task.currentStatus);

    if (workspaceMode === 'PERSONAL') {
      targetStatus = targetColumn === 'Done' ? 'COMPLETED' : 'TODO'
      if (targetStatus === currentStatus) return;
      updateTaskMutation.mutate({ id: task.id, payload: { status: targetStatus } })
      return;
    }

    if (targetStatus === currentStatus) return;

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
      approveMutation.mutate(task.id);
    } else if (targetStatus === 'REJECTED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only reject tasks that are In Review');
        return;
      }
      rejectMutation.mutate({ id: task.id, reason: 'Moved to Needs Work on Kanban' });
    } else if (targetStatus === 'ASSIGNED') {
      // Reassign back to self: backend expects assigneeId (Long), the UserResponseDTO id
      reassignMutation.mutate({ taskId: task.id, newAssigneeId: user?.id });
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
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-[var(--bg-subtle)] rounded-xl h-full w-[320px] shrink-0 border border-[var(--color-border-subtle)] p-3 gap-3">
            <div className="h-6 w-32 bg-[var(--bg-elevated)] animate-pulse rounded" />
            <div className="h-24 bg-[var(--bg-elevated)] animate-pulse rounded-xl" />
            <div className="h-32 bg-[var(--bg-elevated)] animate-pulse rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start">
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
            <div className="rotate-2 scale-105 shadow-2xl opacity-90 cursor-grabbing">
              <KanbanTaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
