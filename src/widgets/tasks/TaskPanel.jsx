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
import { useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useUpdateTask, useArchiveTask, useDeleteTask, useReassignTask } from '@/features/tasks/hooks/useTasks'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { Archive } from 'lucide-react'
import { getKanbanColumnForTask } from '@/shared/lib/status'
import { usePermissions } from '@/context/usePermissions'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function TaskPanel({ task, isOpen, onClose, onUpdate, variant = 'default' }) {
  const { workspaceMode } = useWorkspace()
  const isPersonal = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  const { 
    canArchiveTask, canEditTask, canDeleteTask, canAssignTask, 
    canChecklistEdit, canDependencyEdit, canCommentTask, canAlter 
  } = usePermissions()

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

  const DOMAINS = [
    { id: 'To Do', color: '#e8734a' },
    { id: 'In Review', color: '#d9a441' },
    { id: 'Needs Work', color: '#8b7ae8' },
    { id: 'Done', color: '#4fb8a0' }
  ];
  const domainId = task ? getKanbanColumnForTask(task) : null;
  const taskColor = DOMAINS.find(d => d.id === domainId)?.color || '#ffffff';

  // Reset local edit state during render when the task changes, rather than
  // in an effect — avoids an extra commit/cascading render for state that's
  // purely derived from `task.id` changing (see react.dev "Resetting state
  // when a prop changes").
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
                ? "absolute top-6 bottom-6 right-6 w-full max-w-[420px] rounded-2xl backdrop-blur-xl bg-black/40 border-2 text-white overflow-hidden"
                : "fixed inset-y-0 right-0 w-full max-w-2xl bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] border-l border-[var(--color-border-subtle)]"
            )}
            style={variant === 'nebula' ? {
              '--bg-elevated': 'transparent',
              '--bg-subtle': 'rgba(255, 255, 255, 0.05)',
              '--bg-hover': 'rgba(255, 255, 255, 0.1)',
              '--text-primary': '#ffffff',
              '--text-secondary': 'rgba(255, 255, 255, 0.85)',
              '--text-muted': 'rgba(255, 255, 255, 0.5)',
              '--color-border-subtle': 'rgba(255, 255, 255, 0.15)',
              '--color-border-default': 'rgba(255, 255, 255, 0.3)',
              boxShadow: `0 8px 32px 0 rgba(0,0,0,0.37), 0 0 40px ${taskColor}40`,
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
                  <Icons.settings className="w-4 h-4" /> {/* Placeholder for link/share */}
                </IconButton>
                <IconButton variant="ghost" onClick={onClose}>
                  <Icons.x className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-6 py-8 max-w-3xl mx-auto space-y-10">
                
                {/* Overview Section */}
                <section>
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
                    className="text-2xl font-semibold tracking-tight mb-6 outline-none hover:bg-[var(--bg-subtle)] p-2 -ml-2 rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)] cursor-text"
                  />
                  
                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="flex items-center justify-between group">
                      <span className="text-[var(--text-secondary)] flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />
                        Status
                      </span>
                      <span className="font-medium cursor-pointer hover:text-[var(--accent)] transition-colors">{task.status}</span>
                    </div>
                    
                    <div className="flex items-center justify-between group">
                      <span className="text-[var(--text-secondary)] flex items-center gap-2">
                        <Icons.alert className="w-4 h-4" />
                        Priority
                      </span>
                      <Badge variant="outline" className="cursor-pointer">{task.priority}</Badge>
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[var(--text-secondary)] flex items-center gap-2">
                        <Icons.user className="w-4 h-4" />
                        Assignee
                      </span>
                      {hasAssignPerm ? (
                        <Popover open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                          <PopoverTrigger asChild>
                            <span className="font-medium flex items-center gap-2 cursor-pointer hover:bg-[var(--bg-hover)] p-1 rounded transition-colors -m-1">
                              <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px]">
                                {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                              </div>
                              {task.assignedTo || 'Unassigned'}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-56 p-1">
                            <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold tracking-wide">Reassign Task</Text>
                            <div className="space-y-0.5">
                              {assignableUsers.map(u => (
                                <button
                                  key={u.id}
                                  onClick={() => {
                                    reassignTask.mutate({ taskId: task.id, newAssigneeId: u.id }, {
                                      onSuccess: () => setIsReassignOpen(false)
                                    })
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded hover:bg-[var(--bg-hover)] transition-colors text-left"
                                >
                                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] shrink-0">
                                    {u.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="truncate">{u.username}</span>
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="font-medium flex items-center gap-2 p-1 rounded -m-1">
                          <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px]">
                            {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                          </div>
                          {task.assignedTo || 'Unassigned'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[var(--text-secondary)] flex items-center gap-2">
                        <Icons.check className="w-4 h-4" />
                        Due Date
                      </span>
                      <span className="font-medium cursor-pointer hover:text-[var(--accent)] transition-colors">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                </section>

                <hr className="border-[var(--color-border-subtle)]" />

                {/* Description */}
                <section>
                  <Heading level={4} className="mb-4">Description</Heading>
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
                    className="text-[var(--text-secondary)] min-h-[100px] outline-none hover:bg-[var(--bg-subtle)] p-3 -mx-3 rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)] cursor-text whitespace-pre-wrap"
                  />
                </section>

                {/* Checklist */}
                <section>
                  <Heading level={4} className="mb-4">Checklist</Heading>
                  <div className="space-y-4">
                    {task.checklists?.length > 0 && (
                      <div className="space-y-1 mb-4">
                        {task.checklists.map(item => (
                          <div key={item.id} className="flex items-center justify-between group py-1.5 px-2 -mx-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-subtle)] transition-colors duration-[var(--duration-base)]">
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                checked={item.completed} 
                                disabled={!hasChecklistPerm}
                                onChange={() => toggleChecklistItem.mutate(item.id)}
                                className="w-4 h-4 cursor-pointer rounded border-[var(--color-border-default)] text-[var(--accent)] focus:ring-[var(--accent)] bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all duration-[var(--duration-base)]"
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
                
                <hr className="border-[var(--color-border-subtle)]" />

                <TaskDependencies task={task} hasDependencyPerm={hasDependencyPerm} />

                <hr className="border-[var(--color-border-subtle)]" />
                
                <TaskEvidence taskId={task.id} hasEditPerm={canEditTask || isCreator} />

                <hr className="border-[var(--color-border-subtle)]" />
                
                <TaskComments taskId={task.id} hasCommentPerm={hasCommentPerm} />
                
                <hr className="border-[var(--color-border-subtle)]" />
                
                <TaskTimeline taskId={task.id} />

              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between">
              <Text size="xs" variant="muted">Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</Text>
              <Button size="sm" disabled={!isDirty} onClick={() => {
                updateTask.mutate({ id: task.id, payload: localEdits }, {
                  onSuccess: () => setIsDirty(false)
                })
                onUpdate?.(localEdits)
              }}>Save Changes</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}