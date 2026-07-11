import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { ChecklistForm } from './ChecklistForm'
import { useAddChecklistItem, useToggleChecklistItem, useDeleteChecklistItem, useUpdateTask, useArchiveTask } from '@/features/tasks/hooks/useTasks'
import { Archive } from 'lucide-react'

export function TaskPanel({ task, isOpen, onClose, onUpdate }) {
  const addChecklistItem = useAddChecklistItem(task?.id)
  const toggleChecklistItem = useToggleChecklistItem(task?.id)
  const deleteChecklistItem = useDeleteChecklistItem(task?.id)
  const updateTask = useUpdateTask()
  const archiveTaskMutation = useArchiveTask()
  const [localEdits, setLocalEdits] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [syncedTaskId, setSyncedTaskId] = useState(task?.id)
  const titleRef = useRef(null)
  const descRef = useRef(null)

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

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--bg-overlay)] z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] border-l border-[var(--color-border-subtle)] z-50 flex flex-col"
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
                <IconButton variant="ghost" onClick={handleArchive} title="Archive Task">
                  <Archive className="w-4 h-4" />
                </IconButton>
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
                    contentEditable 
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
                      <span className="font-medium flex items-center gap-2 cursor-pointer hover:text-[var(--accent)] transition-colors">
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px]">
                          {(task?.assignedTo || 'U').charAt(0).toUpperCase()}
                        </div>
                        {task.assignedTo || 'Unassigned'}
                      </span>
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
                    contentEditable
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
                            <IconButton 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all duration-[var(--duration-base)]"
                              onClick={() => deleteChecklistItem.mutate(item.id)}
                            >
                              <Icons.x className="w-3 h-3" />
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <ChecklistForm 
                      onSubmit={(data) => addChecklistItem.mutate(data.text)}
                      isLoading={addChecklistItem.isPending}
                    />
                  </div>
                </section>
                
                <section>
                  <Heading level={4} className="mb-4">Activity</Heading>
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
                    Activity history will appear here.
                  </div>
                </section>

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