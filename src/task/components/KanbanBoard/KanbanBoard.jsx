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
import { useSubmitTask, useApproveTask, useRejectTask, useReassignTask, useUpdateTask, useCompletePersonalTask, useCompleteCrewTask, useRecallTask } from '../../entities/hooks/useTasks'
import { useAuth, usePermissions, useUsersList } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Skeleton'

export function KanbanBoard({ tasks, isLoading, onTaskClick, onTaskStatusChange }) {
  const [activeTask, setActiveTask] = useState(null)
  const [reassignModalTask, setReassignModalTask] = useState(null)
  const { user } = useAuth()
  const { data: allUsers = [] } = useUsersList()
  const { canReview, canAssignTask, canReassignTask, isSuperAdmin } = usePermissions()
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
        if (currentStatus === 'IN_PROGRESS' || currentStatus === 'TODO') {
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

    // Block moving APPROVED or COMPLETED tasks
    if (currentStatus === 'APPROVED' || currentStatus === 'COMPLETED' || currentStatus === 'DONE') {
      toast.error('Approved or completed tasks are final and cannot be moved.');
      rollbackTask(task.id);
      return;
    }

    // Handling REJECTED tasks: must be reassigned by the assignor or manager
    if (currentStatus === 'REJECTED' || currentStatus === 'NEEDS_WORK') {
      const creatorUsername = typeof task.creator === 'object' ? task.creator?.username : task.creator;
      const creatorId = typeof task.creator === 'object' ? task.creator?.id : null;
      const isAssignor = creatorUsername === user?.username || (creatorId && creatorId === user?.id) || task.createdBy === user?.id;
      const canReassign = isAssignor || canReassignTask || canAssignTask || isSuperAdmin;

      if (!canReassign) {
        toast.error('Only the assignor or an authorized manager can reassign a rejected task.');
        rollbackTask(task.id);
        return;
      }

      // Prompt the assignor/manager to explicitly select who to reassign the task to
      setReassignModalTask(task);
      return;
    }

    if (targetStatus === 'SUBMITTED') {
      const isAllowedSubmit = ['IN_PROGRESS', 'TODO', 'TO_DO'].includes(currentStatus);
      if (!isAllowedSubmit) {
         toast.error('Tasks can only be submitted for review from To Do or In Progress');
         rollbackTask(task.id);
         return;
      }
      const assigneeUsername = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo);
      const isAssignee = assigneeUsername === user?.username || assigneeUsername === user?.id || (typeof task.assignee === 'object' && task.assignee?.id === user?.id);
      
      if (!isAssignee && !isSuperAdmin) {
         toast.error('Only the assignee can submit a task for review');
         rollbackTask(task.id);
         return;
      }
      submitMutation.mutate(task.id, { onError });
    } else if (targetStatus === 'APPROVED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only approve tasks that are In Review');
        rollbackTask(task.id);
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        rollbackTask(task.id);
        return;
      }
      const taskAssignee = typeof task.assignedTo === 'object' ? task.assignedTo?.username : (task.assignedTo || task.assignee);
      if (taskAssignee && taskAssignee === user?.username) {
        toast.error('You cannot approve your own task');
        rollbackTask(task.id);
        return;
      }
      approveMutation.mutate(task.id, { onError });
    } else if (targetStatus === 'REJECTED') {
      if (currentStatus !== 'SUBMITTED') {
        toast.error('Can only reject tasks that are In Review');
        rollbackTask(task.id);
        return;
      }
      if (!canReview) {
        toast.error('You do not have permission to review tasks');
        rollbackTask(task.id);
        return;
      }
      const taskAssignee = typeof task.assignedTo === 'object' ? task.assignedTo?.username : (task.assignedTo || task.assignee);
      if (taskAssignee && taskAssignee === user?.username) {
        toast.error('You cannot reject your own task');
        rollbackTask(task.id);
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
        rollbackTask(task.id);
        return; // User cancelled
      }
      rejectMutation.mutate({ id: task.id, reason: reason || 'Moved to Needs Work on Kanban' }, { onError });
    } else if (targetStatus === 'IN_PROGRESS' || targetColumn === 'Assigned' || targetColumn === 'In Progress') {
      if (currentStatus === 'SUBMITTED') {
        recallTaskMutation.mutate(task.id, { onError });
      } else {
        toast.error('Only tasks in review can be recalled back to In Progress');
        rollbackTask(task.id);
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
      <div className="flex gap-4 pb-4 overflow-x-auto custom-scrollbar">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] h-full w-[85vw] max-w-[320px] sm:w-[320px] shrink-0 border border-[var(--border-subtle)] p-3 gap-2.5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 pb-4 items-start overflow-x-auto custom-scrollbar">
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

      {/* Member Selection Modal for Reassigning Rejected Tasks */}
      {reassignModalTask && (
        <Modal open={!!reassignModalTask} onOpenChange={(open) => {
          if (!open) {
            rollbackTask(reassignModalTask.id);
            setReassignModalTask(null);
          }
        }}>
          <ModalContent className="max-w-md p-6 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]">
            <ModalHeader className="gap-1 mb-3">
              <ModalTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Reassign Rejected Task
              </ModalTitle>
              <ModalDescription className="text-xs text-[var(--text-muted)]">
                Select a team member to reassign <span className="font-semibold text-[var(--text-primary)]">"{reassignModalTask.title}"</span>. The task will return to active status for the chosen assignee.
              </ModalDescription>
            </ModalHeader>

            {reassignModalTask.rejectionReason && (
              <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <span className="font-semibold">Rejection Reason:</span> {reassignModalTask.rejectionReason}
              </div>
            )}

            <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar my-2 pr-1">
              {allUsers.map((u) => {
                const currentAssigneeId = typeof reassignModalTask.assignee === 'object' ? reassignModalTask.assignee?.id : reassignModalTask.assigneeId;
                const isCurrentAssignee = currentAssigneeId === u.id || reassignModalTask.assignedTo === u.username;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      reassignMutation.mutate(
                        { taskId: reassignModalTask.id, newAssigneeId: u.id },
                        {
                          onSuccess: () => {
                            toast.success(`Task reassigned to ${u.username} and returned to active status.`);
                            setReassignModalTask(null);
                          },
                          onError: (err) => {
                            toast.error(err.response?.data?.message || 'Failed to reassign task.');
                            rollbackTask(reassignModalTask.id);
                            setReassignModalTask(null);
                          }
                        }
                      );
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isCurrentAssignee
                        ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]/20 text-[var(--text-primary)] font-medium'
                        : 'border-[var(--color-border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {u.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold">{u.username}</div>
                        {u.email && <div className="text-[10px] text-[var(--text-muted)] truncate">{u.email}</div>}
                      </div>
                    </div>
                    {isCurrentAssignee && (
                      <Badge variant="outline" className="text-[10px] border-[var(--accent-border)] text-[var(--accent)] shrink-0">
                        Current
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            <ModalFooter className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  rollbackTask(reassignModalTask.id);
                  setReassignModalTask(null);
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}
