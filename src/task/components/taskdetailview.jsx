import React, { useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { IconButton } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Progress } from '@/shared/ui/Progress'
import { cn } from '@/shared/lib/cn'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ChecklistForm } from './TaskPanel/ChecklistForm'
import { TaskDependencies } from './TaskPanel/TaskPanelExtras'
import {
  useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useReorderChecklistItems,
  useUpdateTask, useReassignTask,
} from '../entities/hooks/useTasks'
import { useCrewMembers } from '@/crew'
import { useUsersList, useAuth, usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { Icons } from '@/shared/ui/Icons'

const STATUS = {
  'Done': '#10B981', 'In Review': '#8B5CF6', 'In Progress': '#F59E0B', 'To Do': '#3B82F6',
}
const sc = (s) => STATUS[s] || 'var(--text-muted)'

/**
 * TaskDetailView — the editor document.
 * Pure content: title, meta, description, checklist, dependencies.
 * No tabs, no comments, no chrome — those live in the dock/inspector.
 */
export function TaskDetailView({ task }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  const { canEditTask, canAssignTask, canChecklistEdit, canDependencyEdit, canAlter } = usePermissions()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const [localEdits, setLocalEdits] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const creatorUsername = typeof task?.creator === 'object' ? task?.creator?.username : task?.creator
  const assigneeUsername = typeof task?.assignee === 'object' ? task?.assignee?.username : (task?.assignee || task?.assignedTo)
  const isCreator = creatorUsername === user?.username
  const isAssignee = assigneeUsername === user?.username
  const canAlterCreator = canAlter(creatorUsername)
  const hasEditPerm = (isPersonal || canEditTask || isCreator || isAssignee) && canAlterCreator
  const hasAssignPerm = (isPersonal || canAssignTask || isCreator) && canAlterCreator
  const hasChecklistPerm = (isPersonal || canChecklistEdit || isCreator || isAssignee) && canAlterCreator
  const hasDependencyPerm = (isPersonal || canDependencyEdit || isCreator) && canAlterCreator

  const addChecklistItem = useAddChecklistItem(task?.id)
  const toggleChecklistItem = useToggleChecklistItem(task?.id)
  const deleteChecklistItem = useDeleteChecklistItem(task?.id)
  const reorderChecklist = useReorderChecklistItems(task?.id)
  const updateTask = useUpdateTask()
  const reassignTask = useReassignTask()
  const { data: orgUsers = [] } = useUsersList()
  const { data: crewMembersData = [] } = useCrewMembers(task?.crewId || task?.crew?.id)

  const assignableUsers = useMemo(() => {
    if (!task) return []
    if (task.crewId || task.crew) return crewMembersData.map(m => m.user ? { id: m.user.id, username: m.user.username } : m)
    return orgUsers
  }, [orgUsers, crewMembersData, task])

  const currentStatus = task?.status || 'To Do'
  const accentColor = sc(currentStatus)
  const checklist = task?.checklists || []
  const checklistDone = checklist.filter(c => c.completed).length
  const checklistPct = checklist.length > 0 ? Math.round((checklistDone / checklist.length) * 100) : 0

  const handleMoveChecklistItem = (index, direction) => {
    if (!task?.checklists) return
    const items = [...task.checklists]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    [items[index], items[targetIndex]] = [items[targetIndex], items[index]]
    reorderChecklist.mutate(items.map(i => i.id))
  }

  if (!task) return null

  // Breadcrumbs
  const breadcrumbs = [
    workspaceMode === 'PERSONAL' ? 'Personal' : (task.teamName || 'Team'),
    task.projectName || task.sprint || 'Tasks',
    task.status || 'To Do',
  ].filter(Boolean)

  return (
    <>
      {confirmDialog}
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto w-full px-8 py-6 space-y-5">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="opacity-40">›</span>}
                <span>{bc}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <div className="flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full shrink-0 mt-1" style={{ backgroundColor: accentColor, minHeight: 28 }} />
            <Heading level={1} ref={titleRef} contentEditable={hasEditPerm} suppressContentEditableWarning
              onBlur={() => { const text = titleRef.current?.textContent || ''; if (text !== task.title) { setLocalEdits(p => ({ ...p, title: text })); setIsDirty(true) } }}
              className="text-2xl font-bold tracking-tight text-[var(--text-primary)] outline-none focus:bg-[var(--bg-subtle)] px-2 py-0.5 -mx-2 rounded-lg transition-colors cursor-text flex-1 leading-tight">
              {task.title}
            </Heading>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] -mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="font-medium text-[var(--text-primary)]">{currentStatus}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", task.priority === 'URGENT' && "bg-red-400", task.priority === 'HIGH' && "bg-amber-400", task.priority === 'MEDIUM' && "bg-blue-400", task.priority === 'LOW' && "bg-gray-400")} />
              <span className="text-[var(--text-muted)]">{task.priority}</span>
            </div>
            {!isPersonal && (
              <div className="flex items-center gap-1.5">
                {hasAssignPerm ? (
                  <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold">{(task.assignedTo || 'U').charAt(0).toUpperCase()}</div>
                        <span>{task.assignedTo || 'Unassigned'}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-48 p-1">
                      <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold">Reassign</Text>
                      <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
                        {assignableUsers.map(u => (
                          <button key={u.id} onClick={() => { reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, { onSuccess: () => { setIsReassignOpen(false); toast.success('Reassigned') } }); }} className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-[var(--bg-hover)] rounded transition-colors">
                            <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] shrink-0 font-bold">{u.username.charAt(0).toUpperCase()}</div>
                            <span className="truncate text-[var(--text-primary)]">{u.username}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px]">{(task.assignedTo || 'U').charAt(0).toUpperCase()}</div>
                    <span className="text-[var(--text-muted)]">{task.assignedTo || 'Unassigned'}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {hasEditPerm ? (
                <input type="date" value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => { updateTask.mutate({ id: task.id, payload: { dueDate: e.target.value || null } }, { onSuccess: () => toast.success('Updated') }) }} className="bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[12px] cursor-pointer border-none outline-none transition-colors" />
              ) : <span className="text-[var(--text-muted)]">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>}
            </div>
          </div>

          {/* Description */}
          <section>
            <div ref={descRef} contentEditable={hasEditPerm} suppressContentEditableWarning
              onBlur={() => { const text = descRef.current?.textContent || ''; if (text !== (task.description || '')) { setLocalEdits(p => ({ ...p, description: text })); setIsDirty(true) } }}
              className="text-[14px] text-[var(--text-primary)] leading-relaxed min-h-[40px] outline-none focus:bg-[var(--bg-subtle)] px-3 py-2 -mx-3 rounded-lg transition-colors cursor-text whitespace-pre-wrap">
              {task.description || (hasEditPerm ? 'Add a description…' : 'No description.')}
            </div>
          </section>

          {/* Checklist */}
          {checklist.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Checklist</Text>
                  <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">{checklistDone}/{checklist.length}</span>
                </div>
                <Progress value={checklistPct} className="h-1 w-24" />
              </div>
              <AnimatePresence>
                {checklist.map((item, idx) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="group flex items-center gap-2.5">
                    <Checkbox checked={item.completed} disabled={!hasChecklistPerm} onCheckedChange={() => toggleChecklistItem.mutate(item.id)} className="shrink-0" />
                    <span className={cn("flex-1 text-[13px]", item.completed && "line-through text-[var(--text-muted)] opacity-50")}>{item.text}</span>
                    {hasChecklistPerm && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleMoveChecklistItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20"><span className="text-[9px]">▲</span></button>
                        <button onClick={() => handleMoveChecklistItem(idx, 'down')} disabled={idx === checklist.length - 1} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-20"><span className="text-[9px]">▼</span></button>
                        <button onClick={() => deleteChecklistItem.mutate(item.id)} className="p-0.5 text-[var(--text-muted)] hover:text-[var(--danger)]"><Icons.x className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          )}
          {hasChecklistPerm && <ChecklistForm onSubmit={(data) => addChecklistItem.mutate(data.text)} isLoading={addChecklistItem.isPending} />}

          {/* Dependencies */}
          <section>
            <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />
          </section>
        </div>

        {/* Save bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="sticky bottom-4 float-right mr-4 flex items-center gap-2 z-10">
              <button onClick={() => { setLocalEdits({}); setIsDirty(false) }} className="px-3 py-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Discard</button>
              <button onClick={() => { updateTask.mutate({ id: task.id, payload: localEdits }, { onSuccess: () => { setIsDirty(false); toast.success('Saved') } }) }} className="px-3 py-1.5 text-[12px] font-medium bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity" disabled={updateTask.isPending}>
                {updateTask.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
