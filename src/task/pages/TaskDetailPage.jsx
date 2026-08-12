import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, FileQuestion, Info, MessageSquare, Paperclip, Activity } from 'lucide-react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { Button, IconButton } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { PageShell } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { DropdownMenu } from '@/shared/ui/DropdownMenu'
import { DetailTabs } from '@/shared/ui/DetailTabs'
import { usePermissions } from '@/identity'
import { useAuth } from '@/identity'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { toast } from 'sonner'
import { SaveToggle } from '@/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { toBackendStatus } from '@/shared/lib/status'
import { resolveStatus } from '@/shared/lib/statusregistry'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { ChecklistForm } from '@/task/components/TaskPanel/ChecklistForm'
import { TaskComments, TaskDependencies, TaskEvidence } from '@/task/components/TaskPanel/TaskPanelExtras'
import ActivityTimeline from '@/task/components/Nebula/explorers/ActivityTimeline'
import { useTaskList } from '@/task/entities/hooks/useTasks'
import {
  useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useReorderChecklistItems,
  useUpdateTask, useArchiveTask, useDeleteTask, useReassignTask,
  useSubmitTask, useApproveTask, useRejectTask, useRecallTask, useClaimTask,
  useCompletePersonalTask, useCompleteCrewTask
} from '@/task/entities/hooks/useTasks'
import { useCrewMembers } from '@/crew'
import { useUsersList } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

const TABS = [
  { id: 'details', label: 'Details', icon: Info },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'evidence', label: 'Evidence', icon: Paperclip },
  { id: 'activity', label: 'Activity', icon: Activity },
]

/* ── Custom Premium Checklist ── */
function PremiumChecklist({ items, hasPerm, onToggle, onDelete, onAdd, onMoveUp, onMoveDown, addLoading }) {
  const done = (items || []).filter(c => c.completed).length
  const total = (items || []).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em]">Checklist</span>
        </div>
        {total > 0 && (
          <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">{done} / {total} completed</span>
        )}
      </div>

      {total > 0 && (
        <div className="h-[3px] bg-[var(--border-subtle)] rounded-[2px] mb-4 overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-[2px] transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}

      {total > 0 ? (
        <div className="rounded-xl bg-[var(--bg-subtle)] p-2 space-y-px">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <ChecklistItem
                  item={item}
                  index={index}
                  total={total}
                  hasPerm={hasPerm}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-8 text-center rounded-xl bg-[var(--bg-subtle)]/50">
          <span className="text-[11px] text-[var(--text-muted)] italic">No checklist items yet</span>
        </div>
      )}

      {hasPerm && (
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)]">
          <ChecklistForm onSubmit={(data) => onAdd(data.text)} isLoading={addLoading} />
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ item, index, total, hasPerm, onToggle, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div
      onClick={() => hasPerm && onToggle(item.id)}
      className={cn(
        "group flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer select-none",
        "hover:bg-[var(--bg-hover)]",
        item.completed && "opacity-40 hover:opacity-50"
      )}>
      {/* Custom checkbox */}
      <div className={cn(
        "w-[18px] h-[18px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 mt-px transition-all duration-150",
        item.completed
          ? "bg-[var(--accent)] border-[var(--accent)]"
          : "border-[var(--border-strong)] hover:border-[var(--accent-border)]"
      )}>
        {item.completed && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </div>

      <span className={cn(
        "flex-1 text-[13px] leading-snug font-medium",
        item.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
      )}>
        {item.text}
      </span>

      {hasPerm && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
          <IconButton variant="ghost" size="sm" className="p-0.5 h-5 w-5" onClick={(e) => { e.stopPropagation(); onMoveUp(index) }} disabled={index === 0} aria-label="Move up">
            <Icons.chevronUp className="w-3 h-3" />
          </IconButton>
          <IconButton variant="ghost" size="sm" className="p-0.5 h-5 w-5" onClick={(e) => { e.stopPropagation(); onMoveDown(index) }} disabled={index === total - 1} aria-label="Move down">
            <Icons.chevronDown className="w-3 h-3" />
          </IconButton>
          <IconButton variant="ghost" size="sm" className="p-0.5 h-5 w-5 text-[var(--text-muted)] hover:text-[var(--danger)]" onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} aria-label="Delete">
            <Icons.x className="w-3 h-3" />
          </IconButton>
        </div>
      )}
    </div>
  )
}

/* ── Section Label ── */
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-2 h-2 rounded-[2px] bg-[var(--accent)] shrink-0" />
    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em]">{children}</span>
  </div>
)

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()

  const {
    canArchiveTask, canEditTask, canDeleteTask, canAssignTask,
    canChecklistEdit, canDependencyEdit, canCommentTask, canAlter, canReview
  } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const routedTask = location.state?.task
  const { tasks, isLoading, isError, refetch } = useTaskList({})
  const fallbackTask = useMemo(
    () => (!routedTask && tasks ? tasks.find(t => t.id === taskId || t._id === taskId) : null),
    [tasks, taskId, routedTask]
  )
  const task = routedTask || fallbackTask

  const creatorUsername = typeof task?.creator === 'object' ? task?.creator?.username : task?.creator
  const assigneeUsername = typeof task?.assignee === 'object' ? task?.assignee?.username : (task?.assignee || task?.assignedTo)
  const isCreator = creatorUsername === user?.username || creatorUsername === user?.id
  const isAssignee = assigneeUsername === user?.username || assigneeUsername === user?.id || (typeof task?.assignee === 'object' && task?.assignee?.id === user?.id) || (typeof task?.assignedTo === 'object' && task?.assignedTo?.id === user?.id)
  const canAlterCreator = canAlter(creatorUsername)
  const canAlterAssignee = canAlter(assigneeUsername)

  const hue = hashHue(task?.id || task?.title || 'task') // Compact header avatar color

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
  const reassignTask = useReassignTask()
  const submitTaskMutation = useSubmitTask()
  const approveTaskMutation = useApproveTask()
  const rejectTaskMutation = useRejectTask()
  const recallTaskMutation = useRecallTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()

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
    if (task && descRef.current && document.activeElement !== descRef.current && descRef.current.textContent !== (task.description || ''))
      descRef.current.textContent = task.description || ''
  }, [task])

  const currentStatus = toBackendStatus(task?.currentStatus || task?.status)
  const st = resolveStatus(currentStatus)

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
      <div className="flex items-center gap-2">
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
      archiveTaskMutation.mutate(task.id, { onSuccess: () => navigate('/app/tasks') })
  }

  const handleDelete = async () => {
    if (await confirm({ title: 'Delete Task Permanently', description: 'This cannot be undone. All subtasks, evidence, and comments will be deleted.', confirmLabel: 'Delete', danger: true }))
      deleteTaskMutation.mutate(task.id, { onSuccess: () => navigate('/app/tasks') })
  }

  const handleMoveChecklistItem = (index, direction) => {
    if (!task?.checklists) return;
    const items = [...task.checklists];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index]; items[index] = items[targetIndex]; items[targetIndex] = temp;
    reorderChecklist.mutate(items.map(i => i.id));
  }

  // ── Loading ──
  if (!task && isLoading) {
    return (
      <PageShell maxWidth="full">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" /></div>
      </PageShell>
    )
  }

  // ── Error ──
  if (!task && isError) {
    return (
      <PageShell maxWidth="full">
        <PageState state="error" stateProps={{ message: 'Failed to load task. It may have been deleted or you may not have access.', onRetry: refetch }} />
      </PageShell>
    )
  }

  // ── Not found ──
  if (!task) {
    return (
      <PageShell maxWidth="full">
        <PageState state="empty" stateProps={{ icon: FileQuestion, title: 'Task not found', message: 'This task may have been deleted or moved.', actionLabel: 'Back to Tasks', onAction: () => navigate('/app/tasks') }} />
      </PageShell>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="shrink-0 bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3.5 flex-wrap">
            <button
              onClick={() => navigate('/app/tasks')}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
              title="Back to Tasks"
            >
              <Icons.chevronLeft className="w-4 h-4" />
            </button>

            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 border border-white/10"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 35) % 360} 68% 38%))` }}
            >
              {task.title.charAt(0).toUpperCase()}
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Heading level={3} className="font-semibold truncate mb-0 text-[15px]">
                {task.title}
              </Heading>
              <StatusBadge status={currentStatus} />
              {task.priority && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  {normalizePriority(task.priority)}
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-[10px] font-semibold text-[var(--text-muted)] border-[var(--border-subtle)] bg-[var(--bg-subtle)] rounded-lg px-2 py-0.5">
                #{task.id}
              </Badge>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {renderStateActions("sm")}
              <SaveToggle entityType={ENTITY_TYPES.TASK} entityId={task.id} />
              <DropdownMenu
                trigger={
                  <IconButton variant="ghost" size="sm"><Icons.moreHorizontal className="w-4 h-4" /></IconButton>
                }
                items={[
                  { label: 'Copy Link', icon: Icons.link, onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/app/tasks?openTaskId=${task.id}`); toast.success('Link copied') } },
                  ...(hasArchivePerm ? [{ label: 'Archive', icon: Icons.archive, onClick: handleArchive }] : []),
                  ...(hasDeletePerm ? [{ label: 'Delete', icon: Icons.trash2, onClick: handleDelete, danger: true }] : []),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
          {/* Tabs */}
          <div className="mt-5 mb-6">
            <DetailTabs 
              tabs={TABS} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
              counts={{ comments: task.commentsCount, evidence: task.evidenceCount }} 
              sticky={false}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
                  {/* ── Left ── */}
                  <div className="min-w-0 space-y-5">
                    {/* Title */}
                    {hasEditPerm && (
                      <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
                        <SectionLabel>Title</SectionLabel>
                        <input
                          ref={(el) => { titleRef.current = el }}
                          value={localEdits.title !== undefined ? localEdits.title : task.title}
                          onChange={(e) => { setLocalEdits(p => ({ ...p, title: e.target.value })); setIsDirty(true) }}
                          className="w-full text-[15px] font-semibold text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors"
                        />
                      </section>
                    )}
                    {/* Description */}
                    <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
                      <SectionLabel>Description</SectionLabel>
                      <div ref={descRef} contentEditable={hasEditPerm} suppressContentEditableWarning
                        onBlur={() => { const t = descRef.current?.textContent || ''; if (t !== (task.description || '')) { setLocalEdits(p => ({ ...p, description: t })); setIsDirty(true) } }}
                        className="text-[13px] text-[var(--text-primary)] leading-relaxed min-h-[72px] outline-none hover:bg-[var(--bg-subtle)] p-3 rounded-lg transition-colors cursor-text whitespace-pre-wrap">
                        {task?.description || (hasEditPerm ? 'Click to add a description…' : 'No description provided.')}
                      </div>
                    </section>

                    {/* Checklist — premium custom version */}
                    <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
                      <PremiumChecklist
                        items={task.checklists || []}
                        hasPerm={hasChecklistPerm}
                        onToggle={(id) => toggleChecklistItem.mutate(id)}
                        onDelete={(id) => deleteChecklistItem.mutate(id)}
                        onAdd={(text) => addChecklistItem.mutate(text)}
                        onMoveUp={(idx) => handleMoveChecklistItem(idx, 'up')}
                        onMoveDown={(idx) => handleMoveChecklistItem(idx, 'down')}
                        addLoading={addChecklistItem.isPending}
                      />
                    </section>

                    {/* Dependencies */}
                    <section className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6">
                      <SectionLabel>Dependencies</SectionLabel>
                      <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />
                    </section>
                  </div>

                  {/* ── Right sidebar ── */}
                  <aside className="hidden lg:flex flex-col gap-4 sticky top-0">
                    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3 block">Attributes</span>
                      <div className="space-y-0">
                        <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)]">
                          <span className="text-[11px] text-[var(--text-muted)]">Status</span>
                          <StatusBadge status={currentStatus} />
                        </div>
                        <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)]">
                          <span className="text-[11px] text-[var(--text-muted)]">Priority</span>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">{normalizePriority(task.priority)}</span>
                        </div>
                        {!isPersonal && (
                          <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)]">
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
                                <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[8px]">{(task?.assignedTo || 'U').charAt(0).toUpperCase()}</div>
                                {task.assignedTo || 'Unassigned'}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)]">
                          <span className="text-[11px] text-[var(--text-muted)]">Due</span>
                          {hasEditPerm ? (
                            <input type="date"
                              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Due date updated') })}
                              className="bg-transparent border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer w-[120px] transition-colors" />
                          ) : (
                            <span className="text-[11px] font-semibold text-[var(--text-primary)]">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-2.5 border-b border-[var(--border-subtle)]">
                          <span className="text-[11px] text-[var(--text-muted)]">Created</span>
                          <span className="text-[11px] font-semibold text-[var(--text-primary)]">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2.5">
                          <span className="text-[11px] text-[var(--text-muted)]">Task ID</span>
                          <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)]">#{task.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3 block">Quick Actions</span>
                      <div className="flex flex-col gap-2">{renderStateActions("sm")}</div>
                    </div>
                  </aside>
                </div>
              )}

              {activeTab === 'comments' && <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />}
              {activeTab === 'evidence' && <TaskEvidence taskId={task.id} hasEditPerm={isAssignee || (isPersonal && isCreator)} />}
              {activeTab === 'activity' && <ActivityTimeline taskId={task.id} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[11px] text-[var(--text-muted)]">
          Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
          {task.updatedAt && task.updatedAt !== task.createdAt && <> · Updated {new Date(task.updatedAt).toLocaleDateString()}</>}
        </span>
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2">{renderStateActions("sm")}</div>
          <Button size="sm" disabled={!isDirty || updateTask.isPending} isLoading={updateTask.isPending}
            onClick={() => { updateTask.mutate({ id: task.id, payload: localEdits }, { onSuccess: () => setIsDirty(false) }) }}
            className="rounded-lg font-semibold">Save Changes</Button>
        </div>
      </div>

      {confirmDialog}
    </div>
  )

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
}
