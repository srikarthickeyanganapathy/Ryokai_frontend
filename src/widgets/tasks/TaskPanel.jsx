
import { Input } from '@/shared/ui/Input';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { ChecklistForm } from './ChecklistForm'
import { TaskComments, TaskTimeline, TaskDependencies, TaskEvidence } from './TaskPanelExtras'
import { 
  useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, 
  useUpdateTask, useArchiveTask, useDeleteTask, useReassignTask,
  useSubmitTask, useApproveTask, useRejectTask, useRecallTask, useClaimTask,
  useCompletePersonalTask, useCompleteCrewTask
} from '@/features/tasks/hooks/useTasks'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { Archive, CheckCircle2, Send, RotateCcw, UserPlus, XCircle } from 'lucide-react'
import { getKanbanColumnForTask } from '@/shared/lib/status'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRealtime } from '@/app/providers/RealTimeProvider'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'

export function TaskPanel({ task, isOpen, onClose, onUpdate, variant = 'default' }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  const { 
    canArchiveTask, canEditTask, canDeleteTask, canAssignTask, 
    canChecklistEdit, canDependencyEdit, canCommentTask, canAlter, canReview
  } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const isCreator = task?.creator === user?.username
  const isAssignee = task?.assignee === user?.username
  const canAlterCreator = canAlter(task?.creator)
  const canAlterAssignee = canAlter(task?.assignee)

  const hasArchivePerm = (isPersonal || canArchiveTask) && canAlterCreator
  const hasDeletePerm = (isPersonal || canDeleteTask || isCreator) && canAlterCreator
  const hasEditPerm = (isPersonal || canEditTask || isCreator || isAssignee) && canAlterCreator
  const hasAssignPerm = (isPersonal || canAssignTask || isCreator) && canAlterCreator && canAlterAssignee
  const hasChecklistPerm = (isPersonal || canChecklistEdit || isCreator || isAssignee) && canAlterCreator
  const hasDependencyPerm = (isPersonal || canDependencyEdit || isCreator) && canAlterCreator
  const hasCommentPerm = isPersonal || canCommentTask

  const addChecklistItem = useAddChecklistItem(task?.id)
  const toggleChecklistItem = useToggleChecklistItem(task?.id)
  const deleteChecklistItem = useDeleteChecklistItem(task?.id)
  const updateTask = useUpdateTask()
  const archiveTaskMutation = useArchiveTask()
  const deleteTaskMutation = useDeleteTask()
  const reassignTask = useReassignTask()
  const { data: users = [] } = useUsersList()
  const assignableUsers = React.useMemo(() => {
    if (!task) return []
    if (task.teamId) return users.filter(u => u.teamId === task.teamId)
    return users
  }, [users, task?.teamId])
  const [localEdits, setLocalEdits] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [syncedTaskId, setSyncedTaskId] = useState(task?.id)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const [isReassignOpen, setIsReassignOpen] = useState(false)

  const { subscribeToTask } = useRealtime()
  const queryClient = useQueryClient()

  // Real-time task subscription
  useEffect(() => {
    if (isOpen && task?.id) {
      return subscribeToTask(task.id, (updatedTask) => {
        // When someone else updates the task, refresh the cache to pull the latest
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      })
    }
  }, [isOpen, task?.id, subscribeToTask, queryClient])

  const DOMAINS = [
    { id: 'To Do', color: '#e8734a' },
    { id: 'In Review', color: '#d9a441' },
    { id: 'Needs Work', color: '#8b7ae8' },
    { id: 'Done', color: '#4fb8a0' }
  ];
  const domainId = task ? getKanbanColumnForTask(task) : null;
  const taskColor = DOMAINS.find(d => d.id === domainId)?.color || '#ffffff';

  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()
  const recallTaskMutation = useRecallTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()

  const handleRejectPrompt = async () => {
    const reason = await confirm({
      title: 'Send back for rework',
      description: 'Explain what needs to be changed before this task can be approved.',
      requireInput: true,
      inputPlaceholder: 'e.g. Missing acceptance criteria or tests...',
      confirmLabel: 'Send Back',
      danger: true,
    })
    if (reason) {
      rejectTaskMutation.mutate({ id: task.id, reason }, {
        onSuccess: () => toast.success('Task sent back for rework')
      })
    }
  }

  const renderStateMachineActions = (size = "sm") => {
    if (!task) return null
    const currentStatus = (task.currentStatus || task.status || '').toUpperCase()
    const isCrewTask = !!(task.crewId || task.crew)
    const isTaskPersonal = isPersonal || task.isPersonal

    if (isTaskPersonal) {
      if (currentStatus !== 'DONE' && currentStatus !== 'COMPLETED') {
        return (
          <Button 
            size={size} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            onClick={() => completePersonalTaskMutation.mutate(task.id)}
            isLoading={completePersonalTaskMutation.isPending}
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </Button>
        )
      }
      return null
    }

    if (isCrewTask) {
      return (
        <div className="flex items-center gap-2">
          {!task.assignee && currentStatus !== 'DONE' && (
            <Button
              size={size}
              variant="outline"
              className="gap-1.5 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              onClick={() => claimTaskMutation.mutate(task.id)}
              isLoading={claimTaskMutation.isPending}
            >
              <UserPlus className="w-4 h-4" />
              Claim Task
            </Button>
          )}
          {currentStatus !== 'DONE' && currentStatus !== 'COMPLETED' && (
            <Button
              size={size}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => completeCrewTaskMutation.mutate(task.id)}
              isLoading={completeCrewTaskMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Task
            </Button>
          )}
        </div>
      )
    }

    // Organization Task Lifecycle
    if (currentStatus === 'ASSIGNED' || currentStatus === 'REJECTED' || currentStatus === 'TO DO' || currentStatus === 'IN PROGRESS') {
      return (
        <Button
          size={size}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
          onClick={() => submitTaskMutation.mutate(task.id, {
            onSuccess: () => toast.success('Task submitted for review')
          })}
          isLoading={submitTaskMutation.isPending}
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </Button>
      )
    }

    if (currentStatus === 'SUBMITTED' || currentStatus === 'IN REVIEW') {
      return (
        <div className="flex items-center gap-2">
          {isAssignee && (
            <Button
              size={size}
              variant="outline"
              className="gap-1.5"
              onClick={() => recallTaskMutation.mutate(task.id, {
                onSuccess: () => toast.success('Task recalled to Assigned state')
              })}
              isLoading={recallTaskMutation.isPending}
            >
              <RotateCcw className="w-4 h-4" />
              Recall
            </Button>
          )}
          {canReview && !isAssignee && (
            <>
              <Button
                size={size}
                variant="outline"
                className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 border-amber-500/30 gap-1.5"
                onClick={handleRejectPrompt}
                isLoading={rejectTaskMutation.isPending}
              >
                <XCircle className="w-4 h-4" />
                Request Rework
              </Button>
              <Button
                size={size}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => approveTaskMutation.mutate(task.id, {
                  onSuccess: () => toast.success('Task approved!')
                })}
                isLoading={approveTaskMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Task
              </Button>
            </>
          )}
        </div>
      )
    }

    return null
  }

  // Reset local edit state during render when the task changes
  if (task?.id !== syncedTaskId) {
    setSyncedTaskId(task?.id)
    setLocalEdits({})
    setIsDirty(false)
  }

  // Sync contentEditable refs when the task changes (imperative DOM write,
  // genuinely belongs in an effect since it's synchronizing with the DOM).
  useEffect(() => {
    if (task) {
      if (titleRef.current) titleRef.current.textContent = task.title || ''
      if (descRef.current) descRef.current.textContent = task.description || ''
    }
  }, [task?.id])

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this task?')) {
      archiveTaskMutation.mutate(task.id, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to PERMANENTLY DELETE this task? This action cannot be undone.')) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          {variant !== 'nebula' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[var(--bg-overlay)] z-40"
            />
          )}

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "z-50 flex flex-col pointer-events-auto",
              variant === 'nebula'
                ? "absolute top-6 bottom-6 right-6 w-full max-w-[580px] rounded-3xl backdrop-blur-2xl bg-zinc-950/90 border-2 text-white overflow-hidden shadow-2xl"
                : "fixed top-2 bottom-2 right-2 w-full max-w-4xl bg-[var(--bg-elevated)]/95 backdrop-blur-3xl shadow-2xl border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden"
            )}
            style={variant === 'nebula' ? {
              '--bg-elevated': 'rgba(24, 24, 27, 0.95)',
              '--bg-subtle': 'rgba(255, 255, 255, 0.06)',
              '--bg-hover': 'rgba(255, 255, 255, 0.12)',
              '--text-primary': '#ffffff',
              '--text-secondary': 'rgba(255, 255, 255, 0.85)',
              '--text-muted': 'rgba(255, 255, 255, 0.5)',
              '--color-border-subtle': 'rgba(255, 255, 255, 0.12)',
              '--color-border-default': 'rgba(255, 255, 255, 0.25)',
              boxShadow: `0 8px 32px 0 rgba(0,0,0,0.5), 0 0 40px ${taskColor}40`,
              borderColor: `${taskColor}80`
            } : {}}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <Badge variant="outline" className="font-mono text-[10px] uppercase">{task.id}</Badge>
                {task.status === 'Done' && (
                  <Badge className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]">
                    Completed
                  </Badge>
                )}
                <div className="ml-2">
                  {renderStateMachineActions("xs")}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasArchivePerm && (
                  <IconButton variant="ghost" onClick={handleArchive} title="Archive Task">
                    <Archive className="w-4 h-4" />
                  </IconButton>
                )}
                {hasDeletePerm && (
                  <IconButton variant="ghost" className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]" onClick={handleDelete} title="Delete Task">
                    <Icons.trash2 className="w-4 h-4" />
                  </IconButton>
                )}
                <IconButton variant="ghost" title="Copy Link">
                  <Icons.settings className="w-4 h-4" />
                </IconButton>
                <IconButton variant="ghost" onClick={onClose}>
                  <Icons.x className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Content Body — 2-Column Inspector Split for Standard, Single-Column for Nebula */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className={cn(
                "p-6 max-w-5xl mx-auto",
                variant === 'nebula' ? "space-y-8" : "grid grid-cols-1 lg:grid-cols-12 gap-8"
              )}>
                
                {/* Main Specs & Execution Column */}
                <div className={cn("space-y-8", variant !== 'nebula' && "lg:col-span-7")}>
                  
                  {/* Title */}
                  <div>
                    <Heading 
                      level={2} 
                      ref={titleRef}
                      contentEditable={hasEditPerm} 
                      suppressContentEditableWarning
                      onBlur={() => {
                        const text = titleRef.current?.textContent || ''
                        if (text !== task.title) {
                          setLocalEdits(prev => ({ ...prev, title: text }))
                          setIsDirty(true)
                        }
                      }}
                      className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] outline-none hover:bg-[var(--bg-subtle)] p-2 -ml-2 rounded-xl transition-colors duration-[var(--duration-base)] cursor-text"
                    />
                  </div>

                  {/* Description */}
                  <section className="space-y-2">
                    <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Description</Text>
                    <div 
                      ref={descRef}
                      contentEditable={hasEditPerm}
                      suppressContentEditableWarning
                      onBlur={() => {
                        const text = descRef.current?.textContent || ''
                        if (text !== (task.description || '')) {
                          setLocalEdits(prev => ({ ...prev, description: text }))
                          setIsDirty(true)
                        }
                      }}
                      className="text-sm text-[var(--text-secondary)] leading-relaxed min-h-[90px] outline-none hover:bg-[var(--bg-subtle)] p-3 -mx-3 rounded-xl transition-colors duration-[var(--duration-base)] cursor-text whitespace-pre-wrap border border-transparent focus:border-[var(--accent-border)]"
                    />
                  </section>

                  {/* Checklist Section */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Checklist & Subtasks</Text>
                      {task.checklists?.length > 0 && (
                        <Text size="xs" variant="muted font-mono">
                          {task.checklists.filter(c => c.completed).length} / {task.checklists.length} done
                        </Text>
                      )}
                    </div>

                    <div className="space-y-3">
                      {task.checklists?.length > 0 && (
                        <div className="space-y-1 bg-[var(--bg-subtle)]/50 p-2 rounded-xl border border-[var(--color-border-subtle)]">
                          {task.checklists.map(item => (
                            <div key={item.id} className="flex items-center justify-between group py-1.5 px-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors duration-[var(--duration-base)]">
                              <div className="flex items-center gap-3">
                                <Input 
                                  type="checkbox" 
                                  checked={item.completed} 
                                  disabled={!hasChecklistPerm}
                                  onChange={() => toggleChecklistItem.mutate(item.id)}
                                  className="w-4 h-4 cursor-pointer rounded border-[var(--color-border-default)] text-[var(--accent)] focus:ring-[var(--accent)] bg-transparent"
                                />
                                <span className={cn(
                                  "text-sm transition-colors",
                                  item.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                                )}>
                                  {item.text}
                                </span>
                              </div>
                              {hasChecklistPerm && (
                                <IconButton 
                                  variant="ghost" 
                                  size="sm" 
                                  className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                                  onClick={() => deleteChecklistItem.mutate(item.id)}
                                >
                                  <Icons.x className="w-3 h-3" />
                                </IconButton>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {hasChecklistPerm && (
                        <ChecklistForm 
                          onSubmit={(data) => addChecklistItem.mutate(data.text)}
                          isLoading={addChecklistItem.isPending}
                        />
                      )}
                    </div>
                  </section>

                  {/* Evidence & Assets */}
                  <TaskEvidence taskId={task.id} hasEditPerm={canEditTask || isCreator} />

                  {/* Comments & Discussion */}
                  <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />

                </div>

                {/* Right Sidebar (Attributes & Meta Inspector) */}
                <div className={cn("space-y-6", variant !== 'nebula' && "lg:col-span-5 border-l border-[var(--color-border-subtle)] pl-6 lg:pl-8")}>
                  
                  {/* Quick Meta Inspector Card */}
                  <div className="space-y-4 bg-[var(--bg-subtle)]/40 p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                    <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold mb-2">Attributes</Text>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <Text size="xs" variant="muted">Status</Text>
                      <Badge variant="outline" className="font-medium uppercase tracking-wide">{task.status}</Badge>
                    </div>

                    {/* Priority */}
                    <div className="flex items-center justify-between">
                      <Text size="xs" variant="muted">Priority</Text>
                      <Badge variant="outline" className="uppercase font-mono text-[10px]">{task.priority}</Badge>
                    </div>

                    {/* Assignee */}
                    <div className="flex items-center justify-between">
                      <Text size="xs" variant="muted">Assignee</Text>
                      {hasAssignPerm ? (
                        <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                          <PopoverTrigger asChild>
                            <span className="font-medium text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-hover)] px-2 py-1 rounded-lg transition-colors">
                              <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold">
                                {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                              </div>
                              {task.assignedTo || 'Unassigned'}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-52 p-1">
                            <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold">Reassign Task</Text>
                            <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                              {assignableUsers.map(u => (
                                <Button
                                  key={u.id}
                                  variant="ghost"
                                  onClick={() => {
                                    reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, {
                                      onSuccess: () => setIsReassignOpen(false)
                                    })
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1 text-xs justify-start"
                                >
                                  <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] shrink-0 font-bold">
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="truncate">{u.username}</span>
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="font-medium text-xs flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px]">
                            {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                          </div>
                          {task.assignedTo || 'Unassigned'}
                        </span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center justify-between">
                      <Text size="xs" variant="muted">Due Date</Text>
                      <Text size="xs" className="font-medium">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                      </Text>
                    </div>
                  </div>

                  {/* Dependencies */}
                  <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />

                  {/* Activity History Timeline */}
                  <TaskTimeline taskId={task.id} />

                </div>

              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3">
              <Text size="xs" variant="muted">Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</Text>
              <div className="flex items-center gap-2">
                {renderStateMachineActions("sm")}
                <Button size="sm" disabled={!isDirty} onClick={() => {
                  updateTask.mutate({ id: task.id, payload: localEdits }, {
                    onSuccess: () => setIsDirty(false)
                  })
                  onUpdate?.(localEdits)
                }}>Save Changes</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      {confirmDialog}
    </AnimatePresence>
  )
}