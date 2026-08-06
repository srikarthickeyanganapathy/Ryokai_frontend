import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Progress } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { SaveToggle } from '@/library/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { TaskPanelTabs } from './TaskPanelTabs'
import { ChecklistForm } from './ChecklistForm'
import { TaskComments, TaskDependencies, TaskEvidence } from './TaskPanelExtras'
import ActivityTimeline from '../Nebula/explorers/ActivityTimeline'
import {
  useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useReorderChecklistItems,
  useUpdateTask, useArchiveTask, useDeleteTask, useReassignTask,
  useSubmitTask, useApproveTask, useRejectTask, useRecallTask, useClaimTask,
  useCompletePersonalTask, useCompleteCrewTask, useComments
} from '../../entities/hooks/useTasks'
import { useCrewMembers } from '@/crew'
import { useUsersList, useAuth, usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { Archive, CheckCircle2, Send, RotateCcw, UserPlus, XCircle, Link2, X } from '@/shared/ui/Icons'

/* ─── Status color system ─── */
const STATUS_COLORS = {
  'Done':        { accent: '#10B981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.15)' },
  'In Review':   { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.06)',  border: 'rgba(139,92,246,0.15)' },
  'In Progress': { accent: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.15)' },
  'To Do':       { accent: '#3B82F6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.15)' },
}
const DEFAULT_STATUS = { accent: 'var(--border-subtle)', bg: 'transparent', border: 'var(--border-subtle)' }

/**
 * TaskPanel — Integrated Side Panel (VS Code-style)
 * Slides in as a flex child, pushing content to the left.
 * Tabbed: Details | Comments | Evidence | Activity
 */
export function TaskPanel({ task, isOpen, onClose, onUpdate }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  const { canArchiveTask, canEditTask, canDeleteTask, canAssignTask, canChecklistEdit, canDependencyEdit, canCommentTask, canAlter, canReview } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const [activeTab, setActiveTab] = useState('details')
  const [localEdits, setLocalEdits] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [syncedTaskId, setSyncedTaskId] = useState(task?.id)
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const { data: comments = [] } = useComments(task?.id)

  if (task?.id !== syncedTaskId) {
    setSyncedTaskId(task?.id)
    setLocalEdits({})
    setIsDirty(false)
  }

  const creatorUsername = typeof task?.creator === 'object' ? task?.creator?.username : task?.creator
  const assigneeUsername = typeof task?.assignee === 'object' ? task?.assignee?.username : (task?.assignee || task?.assignedTo)
  const isCreator = creatorUsername === user?.username || creatorUsername === user?.id
  const isAssignee = assigneeUsername === user?.username || assigneeUsername === user?.id
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
  const updateTask = useUpdateTask()
  const archiveTaskMutation = useArchiveTask()
  const deleteTaskMutation = useDeleteTask()

  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()
  const recallTaskMutation = useRecallTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()
  const reassignTask = useReassignTask()
  const { data: orgUsers = [] } = useUsersList()
  const { data: crewMembersData = [] } = useCrewMembers(task?.crewId || task?.crew?.id)

  const assignableUsers = useMemo(() => {
    if (!task) return []
    if (task.crewId || task.crew) return crewMembersData.map(m => m.user ? { id: m.user.id, username: m.user.username } : m)
    if (task.teamId) return orgUsers.filter(u => u.teamId === task.teamId)
    return orgUsers
  }, [orgUsers, crewMembersData, task])

  const currentStatus = task?.status || 'To Do'
  const statusColors = STATUS_COLORS[currentStatus] || DEFAULT_STATUS

  const handleMoveChecklistItem = (index, direction) => {
    if (!task?.checklists) return
    const items = [...task.checklists]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const temp = items[index]; items[index] = items[targetIndex]; items[targetIndex] = temp
    reorderChecklist.mutate(items.map(i => i.id))
  }

  const handleArchive = async () => {
    if (await confirm({ title: 'Archive Task', description: 'This task can be unarchived later.', confirmLabel: 'Archive', danger: true })) {
      archiveTaskMutation.mutate(task.id, { onSuccess: onClose })
    }
  }

  const handleDelete = async () => {
    if (await confirm({ title: 'Delete Task Permanently', description: 'This cannot be undone.', confirmLabel: 'Delete', danger: true })) {
      deleteTaskMutation.mutate(task.id, { onSuccess: onClose })
    }
  }

  if (!isOpen || !task) return null

  const checklist = task?.checklists || []
  const checklistDone = checklist.filter(c => c.completed).length
  const checklistPct = checklist.length > 0 ? Math.round((checklistDone / checklist.length) * 100) : 0

  return (
    <>
      {confirmDialog}
      <motion.aside
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 480, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col overflow-hidden"
      >
        {/* Status accent bar */}
        <div className="h-1 shrink-0" style={{ backgroundColor: statusColors.accent }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: statusColors.border, backgroundColor: statusColors.bg }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Badge variant="outline" className="font-mono text-[10px] uppercase shrink-0">{task.id}</Badge>
            <Badge className={cn(
              "font-medium text-[10px] shrink-0",
              currentStatus === 'Done' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              currentStatus === 'In Review' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
              currentStatus === 'In Progress' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              currentStatus === 'To Do' && "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
              {currentStatus}
            </Badge>
            <SaveToggle entityType={ENTITY_TYPES.TASK} entityId={task.id} />
          </div>
          <div className="flex items-center gap-1">
            {hasArchivePerm && <IconButton variant="ghost" size="sm" onClick={handleArchive} title="Archive"><Archive className="w-3.5 h-3.5" /></IconButton>}
            {hasDeletePerm && <IconButton variant="ghost" size="sm" className="text-[var(--danger)] hover:bg-[var(--danger-soft)]" onClick={handleDelete} title="Delete"><Icons.trash2 className="w-3.5 h-3.5" /></IconButton>}
            <IconButton variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/app/tasks?task=${task.id}`); toast.success('Link copied') }} title="Copy link"><Link2 className="w-3.5 h-3.5" /></IconButton>
            <IconButton variant="ghost" size="sm" onClick={onClose}><X className="w-3.5 h-3.5" /></IconButton>
          </div>
        </div>

        {/* Tabs */}
        <TaskPanelTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          counts={{ comments: comments.length }}
        />

        {/* Tab content — scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }} className="p-5 space-y-5">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: statusColors.accent }} />
                    <Heading level={2} ref={titleRef} contentEditable={hasEditPerm} suppressContentEditableWarning
                      onBlur={() => { const text = titleRef.current?.textContent || ''; if (text !== task.title) { setLocalEdits(prev => ({ ...prev, title: text })); setIsDirty(true) } }}
                      className="text-lg font-semibold tracking-tight text-[var(--text-primary)] outline-none hover:bg-[var(--bg-subtle)] px-2 py-0.5 -mx-2 rounded-lg transition-colors cursor-text">
                      {task?.title || ''}
                    </Heading>
                  </div>
                </div>

                {/* Description */}
                <section className="space-y-1.5">
                  <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Description</Text>
                  <div ref={descRef} contentEditable={hasEditPerm} suppressContentEditableWarning
                    onBlur={() => { const text = descRef.current?.textContent || ''; if (text !== (task.description || '')) { setLocalEdits(prev => ({ ...prev, description: text })); setIsDirty(true) } }}
                    className="text-[13px] text-[var(--text-primary)] leading-relaxed min-h-[60px] outline-none hover:bg-[var(--bg-subtle)] p-2.5 -mx-2.5 rounded-xl transition-colors cursor-text whitespace-pre-wrap border border-transparent focus:border-[var(--accent-border)]">
                    {task?.description || (hasEditPerm ? '' : 'No description.')}
                  </div>
                </section>

                {/* Attributes */}
                <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: statusColors.border, backgroundColor: statusColors.bg }}>
                  <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Attributes</Text>
                  <div className="flex items-center justify-between"><Text size="xs" variant="muted">Status</Text><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.accent }} /><Badge variant="outline" className="font-medium uppercase tracking-wide text-[11px]">{currentStatus}</Badge></div></div>
                  <div className="flex items-center justify-between"><Text size="xs" variant="muted">Priority</Text><div className="flex items-center gap-1.5"><div className={cn("w-2 h-2 rounded-full", task.priority === 'URGENT' && "bg-red-400", task.priority === 'HIGH' && "bg-amber-400", task.priority === 'MEDIUM' && "bg-blue-400", task.priority === 'LOW' && "bg-gray-400")} /><Badge variant="outline" className="uppercase font-mono text-[10px]">{task.priority}</Badge></div></div>
                  {!isPersonal && (
                    <div className="flex items-center justify-between"><Text size="xs" variant="muted">Assignee</Text>
                      {hasAssignPerm ? (
                        <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                          <PopoverTrigger asChild><span className="font-medium text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-hover)] px-2 py-1 rounded-lg transition-colors text-[var(--text-primary)]"><div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold">{(task?.assignedTo || 'U').charAt(0).toUpperCase()}</div>{task.assignedTo || 'Unassigned'}</span></PopoverTrigger>
                          <PopoverContent align="end" className="w-52 p-1"><Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold">Reassign</Text><div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">{assignableUsers.map(u => (<Button key={u.id} variant="ghost" onClick={() => { reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, { onSuccess: () => setIsReassignOpen(false) }) }} className="w-full flex items-center gap-2 px-2 py-1 text-xs justify-start"><div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] shrink-0 font-bold">{u.username.charAt(0).toUpperCase()}</div><span className="truncate">{u.username}</span></Button>))}</div></PopoverContent>
                        </Popover>
                      ) : <span className="font-medium text-xs flex items-center gap-1.5"><div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px]">{(task?.assignedTo || 'U').charAt(0).toUpperCase()}</div>{task.assignedTo || 'Unassigned'}</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between"><Text size="xs" variant="muted">Due Date</Text>
                    {hasEditPerm ? <input type="date" value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => { updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Due date updated') }) }} className="bg-transparent border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] rounded-md px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer" /> : <Text size="xs" className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</Text>}
                  </div>
                </div>

                {/* Checklist + Dependencies */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Checklist */}
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: statusColors.border, backgroundColor: statusColors.bg }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Icons.checkSquare className="w-3.5 h-3.5" style={{ color: statusColors.accent }} /><Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Checklist</Text></div>
                      {checklist.length > 0 && <Badge variant="outline" className="font-mono text-[10px] tabular-nums">{checklistDone}/{checklist.length}</Badge>}
                    </div>
                    {checklist.length > 0 && <Progress value={checklistPct} className="h-1" />}
                    {checklist.map((item, idx) => (
                      <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)]/60 transition-colors">
                        <Checkbox checked={item.completed} disabled={!hasChecklistPerm} onCheckedChange={() => toggleChecklistItem.mutate(item.id)} className="shrink-0" />
                        <span className={cn("flex-1 text-xs leading-snug", item.completed && "line-through text-[var(--text-muted)] opacity-60")}>{item.text}</span>
                        {hasChecklistPerm && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col">
                              <button onClick={() => handleMoveChecklistItem(idx, 'up')} disabled={idx === 0} className="p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30"><Icons.chevronUp className="w-3 h-3" /></button>
                              <button onClick={() => handleMoveChecklistItem(idx, 'down')} disabled={idx === checklist.length - 1} className="p-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30"><Icons.chevronDown className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => deleteChecklistItem.mutate(item.id)} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)]"><Icons.x className="w-3 h-3" /></button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {hasChecklistPerm && <ChecklistForm onSubmit={(data) => addChecklistItem.mutate(data.text)} isLoading={addChecklistItem.isPending} />}
                  </div>

                  {/* Dependencies */}
                  <div className="rounded-xl border p-4" style={{ borderColor: statusColors.border, backgroundColor: statusColors.bg }}>
                    <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div key="comments" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }} className="p-5">
                <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />
              </motion.div>
            )}

            {activeTab === 'evidence' && (
              <motion.div key="evidence" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }} className="p-5">
                <TaskEvidence taskId={task.id} hasEditPerm={isAssignee || (isPersonal && isCreator)} />
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }} className="p-5">
                <ActivityTimeline taskId={task.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Text size="xs" variant="muted">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</Text>
            <Button size="xs" disabled={!isDirty || updateTask.isPending} isLoading={updateTask.isPending} onClick={() => { updateTask.mutate({ id: task.id, payload: localEdits }, { onSuccess: () => setIsDirty(false) }); onUpdate?.(localEdits) }}>Save</Button>
          </div>
          <div className="flex items-center gap-1.5">
            {renderStateMachineActions(task, { isPersonal, isCrew: !!(task?.crewId || task?.crew), isAssignee, isCreator, canEditTask, canReview, hasAssignPerm, assignableUsers, submitTaskMutation, approveTaskMutation, rejectTaskMutation, recallTaskMutation, claimTaskMutation, completePersonalTaskMutation, completeCrewTaskMutation, reassignTask, confirm })}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* ─── State machine actions (extracted for reuse) ─── */
function renderStateMachineActions(task, ctx) {
  if (!task) return null
  const currentStatus = task.status || 'To Do'
  const isCrewTask = !!(task.crewId || task.crew)
  const isUnclaimed = !task.assignedTo && !task.assignee

  if (ctx.isPersonal) {
    if (currentStatus !== 'Done' && currentStatus !== 'COMPLETED') {
      return <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => ctx.completePersonalTaskMutation.mutate(task.id)} isLoading={ctx.completePersonalTaskMutation.isPending}><CheckCircle2 className="w-3.5 h-3.5" />Complete</Button>
    }
    return null
  }

  if (isCrewTask) {
    return (
      <div className="flex items-center gap-1.5">
        {isUnclaimed && currentStatus !== 'COMPLETED' && (
          <Button size="xs" variant="outline" className="gap-1 border-orange-500/50 text-orange-500 hover:bg-orange-500/10" onClick={() => ctx.claimTaskMutation.mutate(task.id)} isLoading={ctx.claimTaskMutation.isPending}><UserPlus className="w-3.5 h-3.5" />Claim</Button>
        )}
        {!isUnclaimed && (currentStatus === 'In Progress' || currentStatus === 'To Do') && (
          <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => ctx.completeCrewTaskMutation.mutate(task.id)} isLoading={ctx.completeCrewTaskMutation.isPending}><CheckCircle2 className="w-3.5 h-3.5" />Complete</Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {(currentStatus === 'To Do' || currentStatus === 'In Progress') && (ctx.isAssignee || ctx.isCreator || ctx.canEditTask) && !isUnclaimed && (
        <Button size="xs" className="bg-[var(--accent)] hover:opacity-90 text-white gap-1" onClick={() => ctx.submitTaskMutation.mutate(task.id)} isLoading={ctx.submitTaskMutation.isPending}><Send className="w-3.5 h-3.5" />Submit</Button>
      )}
      {currentStatus === 'SUBMITTED' && (ctx.isAssignee || ctx.isCreator || ctx.canEditTask) && (
        <Button size="xs" variant="outline" className="gap-1" onClick={() => ctx.recallTaskMutation.mutate(task.id)} isLoading={ctx.recallTaskMutation.isPending}><RotateCcw className="w-3.5 h-3.5" />Recall</Button>
      )}
      {currentStatus === 'SUBMITTED' && (ctx.canReview || ctx.isCreator) && !ctx.isAssignee && (
        <>
          <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => ctx.approveTaskMutation.mutate(task.id)} isLoading={ctx.approveTaskMutation.isPending}><CheckCircle2 className="w-3.5 h-3.5" />Approve</Button>
          <Button size="xs" className="bg-[var(--danger)] hover:opacity-90 text-white gap-1" onClick={async () => { const reason = await ctx.confirm({ title: 'Reject task', requireInput: true, inputPlaceholder: 'Reason:', danger: true }); if (reason && typeof reason === 'string') ctx.rejectTaskMutation.mutate({ id: task.id, reason }) }} isLoading={ctx.rejectTaskMutation.isPending}><XCircle className="w-3.5 h-3.5" />Reject</Button>
        </>
      )}
    </div>
  )
}
