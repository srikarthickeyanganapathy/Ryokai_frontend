import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { Button, IconButton } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Progress } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { ChecklistForm } from './ChecklistForm'
import { TaskComments, TaskDependencies, TaskEvidence } from './TaskPanelExtras'
import { TaskPullLinks } from '@/github/features/components/TaskPullLinks'
import { taskTabsFor } from '@/task'
import ActivityTimeline from '../Nebula/explorers/ActivityTimeline'
import {
  useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useReorderChecklistItems,
  useUpdateTask, useArchiveTask, useDeleteTask, useReassignTask,
  useSubmitTask, useApproveTask, useRejectTask, useRecallTask, useClaimTask,
  useCompletePersonalTask, useCompleteCrewTask
} from '../../entities/hooks/useTasks'
import { useCrewMembers } from '@/crew'
import { useUsersList } from '@/identity'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { DropdownMenu } from '@/shared/ui/DropdownMenu'
import { usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useAuth } from '@/identity'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'
import { SaveToggle } from '@/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { toBackendStatus } from '@/shared/lib/status'
import { resolveStatus } from '@/shared/lib/statusRegistry'
import { StatusBadge } from '@/shared/ui/StatusBadge'

/* Status colors handled by StatusBadge component via statusRegistry */

export function TaskPanel({ task, isOpen, onClose, onUpdate, variant = 'default', isDocked = false }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const TABS = taskTabsFor(workspaceMode)
  const { user } = useAuth()
  const {
    canArchiveTask, canEditTask, canDeleteTask, canAssignTask,
    canChecklistEdit, canDependencyEdit, canCommentTask, canAlter, canReview
  } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const creatorUsername = typeof task?.creator === 'object' ? task?.creator?.username : task?.creator
  const assigneeUsername = typeof task?.assignee === 'object' ? task?.assignee?.username : (task?.assignee || task?.assignedTo)
  const isCreator = creatorUsername === user?.username || creatorUsername === user?.id
  const isAssignee = assigneeUsername === user?.username || assigneeUsername === user?.id || (typeof task?.assignee === 'object' && task?.assignee?.id === user?.id) || (typeof task?.assignedTo === 'object' && task?.assignedTo?.id === user?.id)
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
  const reorderChecklist = useReorderChecklistItems(task?.id)

  const handleMoveChecklistItem = (index, direction) => {
    if (!task?.checklists) return;
    const items = [...task.checklists];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index]; items[index] = items[targetIndex]; items[targetIndex] = temp;
    reorderChecklist.mutate(items.map(i => i.id));
  }

  const updateTask = useUpdateTask()
  const archiveTaskMutation = useArchiveTask()
  const deleteTaskMutation = useDeleteTask()
  const reassignTask = useReassignTask()
  const { data: orgUsers = [] } = useUsersList()
  const { data: crewMembersData = [] } = useCrewMembers(task?.crewId || task?.crew?.id)

  const assignableUsers = React.useMemo(() => {
    if (!task) return []
    if (task.crewId || task.crew) return crewMembersData.map(m => m.user ? { id: m.user.id, username: m.user.username } : m)
    if (task.teamId) return orgUsers.filter(u => u.teamId === task.teamId)
    return orgUsers
  }, [orgUsers, crewMembersData, task])

  const [activeTab, setActiveTab] = useState('details')
  const [localEdits, setLocalEdits] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [syncedTaskId, setSyncedTaskId] = useState(task?.id)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const [isReassignOpen, setIsReassignOpen] = useState(false)

  if (task?.id !== syncedTaskId) {
    setSyncedTaskId(task?.id)
    setLocalEdits({})
    setIsDirty(false)
  }

  useEffect(() => {
    if (isOpen && task) {
      if (titleRef.current && document.activeElement !== titleRef.current && titleRef.current.textContent !== task.title)
        titleRef.current.textContent = task.title || ''
      if (descRef.current && document.activeElement !== descRef.current && descRef.current.textContent !== (task.description || ''))
        descRef.current.textContent = task.description || ''
    }
  }, [isOpen, task])

  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()
  const recallTaskMutation = useRecallTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()

  const currentStatus = toBackendStatus(task?.currentStatus || task?.status)
  const st = resolveStatus(currentStatus)

  /* --- State machine action buttons --- */
  const renderStateActions = (size = "sm") => {
    if (!task) return null
    const isCrewTask = !!(task.crewId || task.crew)
    const isTaskPersonal = isPersonal || task.isPersonal
    const isUnclaimed = !task.assignedTo && !task.assignee

    if (isTaskPersonal) {
      if (currentStatus !== 'DONE' && currentStatus !== 'COMPLETED' && currentStatus !== 'APPROVED') {
        return (
          <Button size={size} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
            onClick={() => completePersonalTaskMutation.mutate(task.id)}
            isLoading={completePersonalTaskMutation.isPending}>
            <Icons.checkCircle2 className="w-4 h-4" /> Complete
          </Button>
        )
      }
      return null
    }

    if (isCrewTask) {
      return (
        <div className="flex items-center gap-2">
          {isUnclaimed && currentStatus !== 'COMPLETED' && currentStatus !== 'DONE' && (
            <Button size={size} variant="outline" className="gap-1.5 rounded-lg font-medium"
              onClick={() => claimTaskMutation.mutate(task.id)} isLoading={claimTaskMutation.isPending}>
              <Icons.userPlus className="w-4 h-4" /> Claim
            </Button>
          )}
          {!isUnclaimed && (currentStatus === 'IN_PROGRESS' || currentStatus === 'TODO') && (
            <Button size={size} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
              onClick={() => completeCrewTaskMutation.mutate(task.id)} isLoading={completeCrewTaskMutation.isPending}>
              <Icons.checkCircle2 className="w-4 h-4" /> Complete
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {isCrewTask && isUnclaimed && currentStatus !== 'COMPLETED' && currentStatus !== 'APPROVED' && currentStatus !== 'DONE' && (
          <Button size={size} variant="outline" className="gap-1.5 rounded-lg font-medium"
            onClick={() => claimTaskMutation.mutate(task.id)} isLoading={claimTaskMutation.isPending}>
            <Icons.userPlus className="w-4 h-4" /> Claim
          </Button>
        )}

        {(currentStatus === 'TODO' || currentStatus === 'IN_PROGRESS') && (isAssignee || isCreator || canEditTask) && !isUnclaimed && (
          <Button size={size} className="gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg"
            onClick={() => submitTaskMutation.mutate(task.id)} isLoading={submitTaskMutation.isPending}>
            <Icons.send className="w-4 h-4" /> Submit for Review
          </Button>
        )}

        {currentStatus === 'REJECTED' && (
          hasAssignPerm ? (
            <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
              <PopoverTrigger asChild>
                <Button size={size} className="gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-lg">
                  <Icons.userPlus className="w-4 h-4" /> Reassign
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-lg">
                <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-bold tracking-wider text-[10px]">Reassign to</Text>
                <div className="space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar">
                  {assignableUsers.map(u => (
                    <button key={u.id}
                      onClick={() => reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, { onSuccess: () => setIsReassignOpen(false) })}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[12px] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-[var(--text-primary)] font-medium">{u.username}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Badge variant="outline" className="border-red-500/30 text-[var(--danger)] bg-[var(--danger-soft)] px-2.5 py-1 text-[11px] font-semibold rounded-lg">
              Rejected (requires reassignment)
            </Badge>
          )
        )}

        {currentStatus === 'SUBMITTED' && (isAssignee || isCreator || canEditTask) && (
          <Button size={size} variant="outline" className="gap-1.5 rounded-lg font-medium"
            onClick={() => recallTaskMutation.mutate(task.id)} isLoading={recallTaskMutation.isPending}>
            <Icons.rotateCcw className="w-4 h-4" /> Recall
          </Button>
        )}

        {currentStatus === 'SUBMITTED' && (canReview || isCreator) && !isAssignee && (
          <>
            <Button size={size} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
              onClick={() => approveTaskMutation.mutate(task.id)} isLoading={approveTaskMutation.isPending}>
              <Icons.checkCircle2 className="w-4 h-4" /> Approve
            </Button>
            <Button size={size} className="gap-1.5 bg-[var(--danger)] hover:opacity-90 text-white font-semibold rounded-lg"
              onClick={async () => {
                const reason = await confirm({ title: 'Reject task', description: 'Provide a reason for rejection.', requireInput: true, inputPlaceholder: 'Rejection reason:', danger: true });
                if (reason && typeof reason === 'string' && reason.trim() !== '') rejectTaskMutation.mutate({ id: task.id, reason });
              }}
              isLoading={rejectTaskMutation.isPending}>
              <Icons.xCircle className="w-4 h-4" /> Reject
            </Button>
          </>
        )}
      </div>
    )
  }

  const handleArchive = async () => {
    if (await confirm({ title: 'Archive Task', description: 'Are you sure? It can be unarchived later.', confirmLabel: 'Archive', danger: true }))
      archiveTaskMutation.mutate(task.id, { onSuccess: () => onClose() })
  }

  const handleDelete = async () => {
    if (await confirm({ title: 'Delete Task Permanently', description: 'This cannot be undone. All subtasks, evidence, and comments will be deleted.', confirmLabel: 'Delete', danger: true }))
      deleteTaskMutation.mutate(task.id, { onSuccess: () => onClose() })
  }

  if (!isOpen || !task) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {!isDocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose} className="fixed inset-0 bg-transparent z-30 pointer-events-auto" />
          )}

          <motion.div
            initial={isDocked ? false : { x: '100%', opacity: 0, scale: 0.95 }}
            animate={isDocked ? { x: 0 } : { x: 0, opacity: 1, scale: 1 }}
            exit={isDocked ? false : { x: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "flex flex-col pointer-events-auto overflow-hidden",
              isDocked
                ? "w-full h-full bg-[var(--bg-base)]/90 backdrop-blur-2xl border-l border-[var(--border-subtle)]"
                : "fixed top-0 right-0 bottom-0 md:top-4 md:bottom-4 md:right-4 w-full md:w-[440px] z-40 bg-[var(--bg-base)] shadow-2xl shadow-black/10 border border-[var(--border-subtle)] md:rounded-3xl"
            )}
          >
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <IconButton variant="ghost" size="sm" onClick={onClose} title="Back" aria-label="Go back">
                  <Icons.chevronLeft className="w-4 h-4" />
                </IconButton>
                <Badge variant="outline" className="font-mono text-[10px] font-semibold text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-subtle)] rounded-lg px-2 py-0.5">
                  #{task.id}
                </Badge>
              </div>

              <div className="flex items-center gap-0.5">
                <SaveToggle entityType={ENTITY_TYPES.TASK} entityId={task.id} className="mr-1" />
                <DropdownMenu
                  trigger={
                    <IconButton variant="ghost" size="sm" title="More actions" aria-label="More actions">
                      <Icons.moreHorizontal className="w-4 h-4" />
                    </IconButton>
                  }
                  items={[
                    { label: 'Copy Link', icon: Icons.link, onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/app/tasks?openTaskId=${task.id}`); toast.success('Link copied') } },
                    ...(hasArchivePerm ? [{ label: 'Archive', icon: Icons.archive, onClick: handleArchive }] : []),
                    ...(hasDeletePerm ? [{ label: 'Delete', icon: Icons.trash2, onClick: handleDelete, danger: true }] : []),
                  ]}
                />
                <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close task panel">
                  <Icons.x className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* --- Title & Identity --- */}
            <div className="px-6 pt-5 pb-4 shrink-0">
              <h1 ref={titleRef} contentEditable={hasEditPerm} suppressContentEditableWarning
                onBlur={() => { const t = titleRef.current?.textContent || ''; if (t !== task.title) { setLocalEdits(p => ({ ...p, title: t })); setIsDirty(true) } }}
                className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-tight outline-none hover:bg-[var(--bg-subtle)] px-2 py-1 -ml-2 rounded-lg transition-colors cursor-text mb-3">
                {task?.title || ''}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={currentStatus} variant="pill" />
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]">
                  {normalizePriority(task.priority)} Priority
                </span>
                {renderStateActions("xs")}
              </div>
            </div>

            {/* --- Tabs --- */}
            <div className="px-5 shrink-0 border-b border-[var(--border-subtle)] flex gap-1 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative py-2.5 px-3 text-[12px] font-semibold whitespace-nowrap transition-colors rounded-t-lg",
                    activeTab === tab.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}>
                  {tab.label}
                  {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  {activeTab === tab.id && (
                    <motion.div layoutId="task-panel-tab-bar" className="absolute left-1 right-1 bottom-0 h-[2px] bg-[var(--accent)] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>

            {/* --- Tab Content --- */}
            {activeTab === 'details' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6">
                  {/* Left column */}
                  <div className="space-y-6 min-w-0">
                    {/* Description */}
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.chevronLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em]">Description</span>
                      </div>
                      <div ref={descRef} contentEditable={hasEditPerm} suppressContentEditableWarning
                        onBlur={() => { const t = descRef.current?.textContent || ''; if (t !== (task.description || '')) { setLocalEdits(p => ({ ...p, description: t })); setIsDirty(true) } }}
                        className="text-[13px] text-[var(--text-primary)] leading-relaxed min-h-[80px] outline-none hover:bg-[var(--bg-subtle)] p-3 -mx-3 rounded-lg transition-colors cursor-text whitespace-pre-wrap border border-transparent focus:border-[var(--accent-border)]">
                        {task?.description || (hasEditPerm ? '' : 'No description provided.')}
                      </div>
                    </section>

                    {/* Checklist */}
                    <section className="pt-5 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icons.checkSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em]">Checklist</span>
                        </div>
                        {task.checklists?.length > 0 && (
                          <Badge variant="outline" className="font-mono text-[10px] tabular-nums font-semibold border-[var(--border-subtle)]">
                            {task.checklists.filter(c => c.completed).length}/{task.checklists.length}
                          </Badge>
                        )}
                      </div>

                      {task.checklists?.length > 0 && (() => {
                        const done = task.checklists.filter(c => c.completed).length
                        const pct = Math.round((done / task.checklists.length) * 100)
                        return (
                          <div className="flex items-center gap-2 mb-3">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono tabular-nums shrink-0">{pct}%</span>
                          </div>
                        )
                      })()}

                      {task.checklists?.length > 0 ? (
                        <div className="space-y-0.5">
                          <AnimatePresence initial={false}>
                            {task.checklists.map((item, index) => (
                              <motion.div key={item.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group">
                                <div className={cn("flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]", item.completed && "opacity-50")}>
                                  <Checkbox checked={item.completed} disabled={!hasChecklistPerm}
                                    onCheckedChange={() => toggleChecklistItem.mutate(item.id)} className="shrink-0" />
                                  <span className={cn("flex-1 text-[12px] leading-snug", item.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)] font-medium")}>
                                    {item.text}
                                  </span>
                                  {hasChecklistPerm && (
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <IconButton variant="ghost" size="sm" className="p-0.5" onClick={() => handleMoveChecklistItem(index, 'up')} disabled={index === 0} aria-label="Move checklist item up"><Icons.chevronUp className="w-3 h-3" /></IconButton>
                                      <IconButton variant="ghost" size="sm" className="p-0.5" onClick={() => handleMoveChecklistItem(index, 'down')} disabled={index === task.checklists.length - 1} aria-label="Move checklist item down"><Icons.chevronDown className="w-3 h-3" /></IconButton>
                                      <IconButton variant="ghost" size="sm" className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)]" title="Delete checklist item" aria-label="Delete checklist item" onClick={() => deleteChecklistItem.mutate(item.id)}><Icons.x className="w-3 h-3" /></IconButton>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="py-6 text-center rounded-lg bg-[var(--bg-subtle)]/50">
                          <span className="text-[11px] text-[var(--text-muted)]">No checklist items yet</span>
                        </div>
                      )}

                      {hasChecklistPerm && (
                        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)]">
                          <ChecklistForm onSubmit={(data) => addChecklistItem.mutate(data.text)} isLoading={addChecklistItem.isPending} />
                        </div>
                      )}
                    </section>

                    {/* Dependencies */}
                    <section className="pt-5 border-t border-[var(--border-subtle)]">
                      <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />
                    </section>
                  </div>

                  {/* Right column: Attributes */}
                  <div className="space-y-4 shrink-0">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.05em] block mb-1">Attributes</span>

                    <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--text-muted)]">Status</span>
                        <StatusBadge status={currentStatus} />
                      </div>

                      {/* Priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--text-muted)]">Priority</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">{normalizePriority(task.priority)}</span>
                      </div>

                      {/* Assignee */}
                      {!isPersonal && (
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[var(--text-muted)]">Assignee</span>
                          {hasAssignPerm ? (
                            <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                              <PopoverTrigger asChild>
                                <button className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors cursor-pointer">
                                  <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[8px] font-bold">
                                    {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  {task.assignedTo || 'Unassigned'}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-52 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] rounded-lg">
                                <span className="block px-2 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Reassign to</span>
                                <div className="space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar">
                                  {assignableUsers.map(u => (
                                    <button key={u.id}
                                      onClick={() => reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, { onSuccess: () => setIsReassignOpen(false) })}
                                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[12px] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left">
                                      <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                        {u.username.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="truncate text-[var(--text-primary)] font-medium">{u.username}</span>
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-primary)]">
                              <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[8px]">{((task?.assignedTo || 'U')).charAt(0).toUpperCase()}</div>
                              {task.assignedTo || 'Unassigned'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Due Date */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--text-muted)]">Due</span>
                        {hasEditPerm ? (
                          <input type="date"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Due date updated') })}
                            className="bg-transparent border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer w-[130px] transition-colors" />
                        ) : (
                          <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <TaskEvidence taskId={task.id} hasEditPerm={isAssignee || (isPersonal && isCreator)} />
              </div>
            )}

            {activeTab === 'prs' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <TaskPullLinks taskId={task.id} projectId={task.projectId} crewId={task.crewId} hasEditPerm={hasEditPerm} />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <ActivityTimeline taskId={task.id} />
              </div>
            )}

            {/* --- Footer --- */}
            <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap shrink-0">
              <span className="text-[11px] text-[var(--text-muted)]">
                Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '--'}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {renderStateActions("sm")}
                <Button size="sm" disabled={!isDirty || updateTask.isPending} isLoading={updateTask.isPending}
                  onClick={() => { updateTask.mutate({ id: task.id, payload: localEdits }, { onSuccess: () => setIsDirty(false) }); onUpdate?.(localEdits) }}
                  className="rounded-lg font-semibold">
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
          {confirmDialog}
        </>
      )}
    </AnimatePresence>
  )
}

