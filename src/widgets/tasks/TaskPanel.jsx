
import { Input } from '@/shared/ui/Input';

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Progress } from '@/shared/ui/Progress'
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
import { Archive, CheckCircle2, Send, RotateCcw, UserPlus, XCircle, Link2 } from 'lucide-react'
import { getKanbanColumnForTask } from '@/shared/lib/status'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRealtime } from '@/app/providers/RealTimeProvider'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'

/**
 * Docked Utility Panel Component for Left Dock Column (VS Code Style)
 */
function DockedUtilityPanel({
  title,
  icon: Icon,
  badge,
  onClose,
  children
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="flex-1 flex flex-col min-h-[220px] rounded-[18px] bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-2xl shadow-black/40 overflow-hidden"
    >
      {/* Compact Utility Header */}
      <div className="px-3.5 py-2 bg-[var(--bg-elevated)]/60 border-b border-[var(--color-border-subtle)] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)] font-mono">
            {title}
          </span>
          {badge && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--color-border-subtle)]">
              {badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
          title="Close Utility Window"
        >
          <Icons.x className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Utility Body Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 text-[var(--text-primary)]">
        {children}
      </div>
    </motion.div>
  )
}

export function TaskPanel({ task, isOpen, onClose, onUpdate, variant = 'default' }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  const { 
    canArchiveTask, canEditTask, canDeleteTask, canAssignTask, 
    canChecklistEdit, canDependencyEdit, canCommentTask, canAlter, canReview
  } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const creatorUsername = typeof task?.creator === 'object' ? task?.creator?.username : task?.creator
  const assigneeUsername = typeof task?.assignee === 'object' ? task?.assignee?.username : (task?.assignee || task?.assignedTo)

  const isCreator = creatorUsername === user?.username
  const isAssignee = assigneeUsername === user?.username
  const canAlterCreator = canAlter(creatorUsername)
  const canAlterAssignee = canAlter(assigneeUsername)

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

  // Independent Attached Utility States (Default: Only Inspector Opens First)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)

  const hasAnyUtilityOpen = isCommentsOpen || isEvidenceOpen || isActivityOpen

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
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      })
    }
  }, [isOpen, task?.id, subscribeToTask, queryClient])

  // Sync contentEditable refs when task changes or panel opens
  useEffect(() => {
    if (isOpen && task) {
      if (titleRef.current && titleRef.current.textContent !== task.title) {
        titleRef.current.textContent = task.title || ''
      }
      if (descRef.current && descRef.current.textContent !== (task.description || '')) {
        descRef.current.textContent = task.description || ''
      }
      setLocalEdits({})
      setIsDirty(false)
    }
  }, [isOpen, task?.id, task?.title, task?.description])

  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()
  const recallTaskMutation = useRecallTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()

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
          {currentStatus === 'ASSIGNED' && (
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
          {currentStatus === 'SUBMITTED' && canReview && (
            <Button 
              size={size}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => approveTaskMutation.mutate(task.id)}
              isLoading={approveTaskMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  const handleArchive = async () => {
    const isConfirmed = await confirm({
      title: 'Archive Task',
      description: 'Are you sure you want to archive this task? It can be unarchived later from settings.',
      confirmLabel: 'Archive',
      danger: true,
    })
    if (isConfirmed) {
      archiveTaskMutation.mutate(task.id, {
        onSuccess: () => onClose()
      })
    }
  }

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: 'Delete Task Permanently',
      description: 'This action cannot be undone. All subtasks, evidence, and comments will be permanently deleted.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (isConfirmed) {
      deleteTaskMutation.mutate(task.id, {
        onSuccess: () => onClose()
      })
    }
  }

  if (!isOpen || !task) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent Backdrop (No Blur, No Dark Mask — Nebula / Board is 100% visible) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-transparent z-30 pointer-events-auto"
          />

          {/* ====================================================================== */}
          {/* ATTACHED LEFT DOCK COLUMN (16px gap from Inspector, Floating) */}
          {/* ====================================================================== */}
          <AnimatePresence>
            {hasAnyUtilityOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                className="fixed top-4 bottom-4 right-[calc(52vw+32px)] w-[360px] md:w-[420px] max-w-[calc(48vw-48px)] z-40 flex flex-col gap-3.5 overflow-hidden pointer-events-auto"
              >
                <AnimatePresence mode="popLayout">
                  {isCommentsOpen && (
                    <DockedUtilityPanel
                      key="comments-dock"
                      title="Comments"
                      icon={Icons.messageSquare}
                      badge="Thread"
                      onClose={() => setIsCommentsOpen(false)}
                    >
                      <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />
                    </DockedUtilityPanel>
                  )}

                  {isEvidenceOpen && (
                    <DockedUtilityPanel
                      key="evidence-dock"
                      title="Evidence & Links"
                      icon={Icons.link}
                      badge="Media Preview"
                      onClose={() => setIsEvidenceOpen(false)}
                    >
                      <TaskEvidence taskId={task.id} hasEditPerm={isAssignee || (isPersonal && isCreator)} />
                    </DockedUtilityPanel>
                  )}

                  {isActivityOpen && (
                    <DockedUtilityPanel
                      key="activity-dock"
                      title="Activity Log"
                      icon={Icons.clock}
                      badge="Timeline"
                      onClose={() => setIsActivityOpen(false)}
                    >
                      <TaskTimeline taskId={task.id} />
                    </DockedUtilityPanel>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====================================================================== */}
          {/* RIGHT WORKSPACE: TASK INSPECTOR (Floating IDE Workspace, Radius 20px) */}
          {/* ====================================================================== */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-4 bottom-4 right-4 w-[52vw] max-w-[820px] min-w-[440px] z-40 bg-[var(--bg-elevated)] shadow-2xl shadow-black/50 border border-[var(--color-border-subtle)] rounded-[20px] overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Task Inspector Header & Active Utility Toggle Controls */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]/40 shrink-0">
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

              {/* Utility Panel Active Toggle Controls */}
              <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium",
                    isCommentsOpen ? "bg-[var(--accent)] text-white font-semibold shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  )}
                  title="Toggle Comments Utility Panel"
                >
                  <Icons.messageSquare className="w-3.5 h-3.5" />
                  <span>Comments</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEvidenceOpen(!isEvidenceOpen)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium",
                    isEvidenceOpen ? "bg-[var(--accent)] text-white font-semibold shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  )}
                  title="Toggle Evidence Utility Panel"
                >
                  <Icons.link className="w-3.5 h-3.5" />
                  <span>Evidence</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium",
                    isActivityOpen ? "bg-[var(--accent)] text-white font-semibold shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  )}
                  title="Toggle Activity Log Utility Panel"
                >
                  <Icons.clock className="w-3.5 h-3.5" />
                  <span>Activity Log</span>
                </button>
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
                <IconButton 
                  variant="ghost" 
                  title="Copy Task Link" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/app/tasks?task=${task.id}`)
                    toast.success('Task link copied to clipboard')
                  }}
                >
                  <Link2 className="w-4 h-4" />
                </IconButton>
                <IconButton variant="ghost" onClick={onClose}>
                  <Icons.x className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Task Inspector Scrollable Body (CONTAINS ONLY SPECS, ATTRIBUTES, CHECKLIST, DEPENDENCIES) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
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
                >
                  {task?.title || ''}
                </Heading>
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
                  className="text-sm text-[var(--text-primary)] leading-relaxed min-h-[90px] outline-none hover:bg-[var(--bg-subtle)] p-3 -mx-3 rounded-xl transition-colors duration-[var(--duration-base)] cursor-text whitespace-pre-wrap border border-transparent focus:border-[var(--accent-border)] placeholder:text-[var(--text-tertiary)]"
                >
                  {task?.description || (hasEditPerm ? '' : 'No description provided.')}
                </div>
              </section>

              {/* Attributes Card */}
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

                {/* Assignee — hidden in personal mode */}
                {!isPersonal && (
                  <div className="flex items-center justify-between">
                    <Text size="xs" variant="muted">Assignee</Text>
                    {hasAssignPerm ? (
                      <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                        <PopoverTrigger asChild>
                          <span className="font-medium text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-hover)] px-2 py-1 rounded-lg transition-colors text-[var(--text-primary)]">
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
                                <span className="truncate text-[var(--text-primary)]">{u.username}</span>
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="font-medium text-xs flex items-center gap-1.5 text-[var(--text-primary)]">
                        <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px]">
                          {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                        </div>
                        {task.assignedTo || 'Unassigned'}
                      </span>
                    )}
                  </div>
                )}

                {/* Due Date (Editable) */}
                <div className="flex items-center justify-between">
                  <Text size="xs" variant="muted">Due Date</Text>
                  {hasEditPerm ? (
                    <input
                      type="date"
                      value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const val = e.target.value
                        const newDate = val ? `${val}T23:59:59` : null
                        updateTask.mutate({ id: task.id, payload: { dueDate: newDate } }, {
                          onSuccess: () => toast.success('Due date updated')
                        })
                      }}
                      className="bg-transparent border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] rounded-md px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                    />
                  ) : (
                    <Text size="xs" className="font-medium text-[var(--text-primary)]">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                    </Text>
                  )}
                </div>
              </div>

              {/* Side-by-Side Grid: Checklist (Left) & Dependencies (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                
                {/* Checklist Card */}
                <div className="space-y-3 bg-[var(--bg-subtle)]/40 p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.checkSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Checklist</Text>
                    </div>
                    {task.checklists?.length > 0 && (
                      <Badge variant="outline" className="font-mono text-[10px] tabular-nums px-1.5 py-0">
                        {task.checklists.filter(c => c.completed).length}/{task.checklists.length}
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {task.checklists?.length > 0 && (() => {
                    const done = task.checklists.filter(c => c.completed).length
                    const total = task.checklists.length
                    const pct = Math.round((done / total) * 100)
                    return (
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1 flex-1" />
                        <Text size="xs" variant="muted" className="font-mono tabular-nums text-[10px] shrink-0">
                          {pct}%
                        </Text>
                      </div>
                    )
                  })()}

                  {/* Items */}
                  {task.checklists?.length > 0 ? (
                    <div className="space-y-0.5">
                      <AnimatePresence initial={false}>
                        {task.checklists.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="group"
                          >
                            <div className={cn(
                              "flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150",
                              "hover:bg-[var(--bg-elevated)]/60",
                              item.completed && "opacity-60"
                            )}>
                              <Checkbox
                                checked={item.completed}
                                disabled={!hasChecklistPerm}
                                onCheckedChange={() => toggleChecklistItem.mutate(item.id)}
                                className="shrink-0"
                              />
                              <span className={cn(
                                "flex-1 text-xs leading-snug select-text transition-all duration-200",
                                item.completed
                                  ? "line-through text-[var(--text-muted)]"
                                  : "text-[var(--text-primary)]"
                              )}>
                                {item.text}
                              </span>
                              {hasChecklistPerm && (
                                <button
                                  type="button"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--danger)]"
                                  onClick={() => deleteChecklistItem.mutate(item.id)}
                                  title="Remove item"
                                >
                                  <Icons.x className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <Text size="xs" variant="muted" className="text-[var(--text-tertiary)]">No items yet</Text>
                    </div>
                  )}
                  
                  {hasChecklistPerm && (
                    <div className="pt-1 border-t border-[var(--color-border-subtle)]/50">
                      <ChecklistForm 
                        onSubmit={(data) => addChecklistItem.mutate(data.text)}
                        isLoading={addChecklistItem.isPending}
                      />
                    </div>
                  )}
                </div>

                {/* Dependencies Card */}
                <div className="bg-[var(--bg-subtle)]/40 p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                  <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />
                </div>

              </div>

            </div>

            {/* Task Inspector Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between gap-3 shrink-0">
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