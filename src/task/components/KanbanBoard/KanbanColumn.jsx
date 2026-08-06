import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { KanbanTaskCard } from './KanbanTaskCard'
import { Icons } from '@/shared/ui/Icons'
import { Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { useCreateTask } from '../../entities/hooks/useTasks'
import { cn } from '@/shared/lib/cn'
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

/* ─── Column accent colors — Linear-style subtle differentiation ─── */
const COLUMN_STYLES = {
  'To Do':        { accent: '#3B82F6', bg: 'rgba(59,130,246,0.04)',  border: 'rgba(59,130,246,0.12)',  dot: '#3B82F6' },
  'In Progress':  { accent: '#F59E0B', bg: 'rgba(245,158,11,0.04)', border: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
  'In Review':    { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.04)', border: 'rgba(139,92,246,0.12)', dot: '#8B5CF6' },
  'Done':         { accent: '#10B981', bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.12)', dot: '#10B981' },
}

export function KanbanColumn({ column, tasks, onTaskClick }) {
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef(null)
  const createTaskMutation = useCreateTask()
  const { activeOrganization } = useWorkspace()

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column }
  })

  const taskIds = tasks.map(t => t.id)
  const style = COLUMN_STYLES[column.id] || { accent: 'var(--border-subtle)', bg: 'rgba(255,255,255,0.02)', border: 'var(--border-subtle)', dot: 'var(--text-muted)' }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) { setIsQuickAdding(false); return }
    createTaskMutation.mutate({ title: newTaskTitle, orgId: activeOrganization?.id || null }, {
      onSuccess: () => { setNewTaskTitle(''); setIsQuickAdding(false) }
    })
  }

  const startQuickAdd = () => {
    setIsQuickAdding(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className={cn(
      "flex flex-col rounded-[var(--radius-xl)] border transition-[width,min-width,flex] duration-[var(--duration-slow)] ease-[var(--ease-out)] overflow-hidden",
      collapsed ? "w-[52px] min-w-[52px] flex-none" : "flex-1 min-w-[280px]"
    )}
    style={{ backgroundColor: style.bg, borderColor: isOver ? style.accent : style.border }}
    >
      {/* Column Header with gradient accent */}
      <div className={cn("p-3.5 flex items-center justify-between sticky top-0 z-10", !collapsed && "border-b")}
        style={{ borderColor: style.border }}
      >
        {collapsed ? (
          <Button
            variant="ghost"
            onClick={() => setCollapsed(false)}
            className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mx-auto"
            title={`Expand ${column.title}`}
          >
            <Icons.chevronRight className="w-4 h-4" />
            <span className="text-xs font-medium [writing-mode:vertical-rl] rotate-180">{column.title}</span>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{tasks.length}</span>
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Colored dot indicator */}
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.dot }} />
              <Heading level={4} className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                {column.title}
              </Heading>
              <motion.span
                key={`count-${tasks.length}`}
                initial={false}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center text-[11px] font-semibold tabular-nums text-[var(--text-muted)] shrink-0"
              >
                {tasks.length}
              </motion.span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setCollapsed(true)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] shrink-0"
              title="Collapse column"
            >
              <Icons.chevronLeft className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>

      {collapsed ? null : (
      <>
      {/* Task List */}
      <div className="flex-1 px-2.5 pt-2 pb-2 flex flex-col gap-2 min-h-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={cn(
              "flex-1 flex flex-col rounded-lg transition-colors",
              isOver && "bg-[var(--accent-soft)]/20"
            )}
            style={{ minHeight: tasks.length === 0 ? '80px' : 'auto' }}
          >
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <KanbanTaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </AnimatePresence>

            {/* Empty column state */}
            {tasks.length === 0 && !isQuickAdding && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 gap-2 py-8 px-4 border-2 border-dashed rounded-lg text-center"
                style={{ borderColor: style.border }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                </motion.div>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Drop tasks here</p>
              </motion.div>
            )}
          </div>
        </SortableContext>

        {/* Quick-add inline form */}
        <AnimatePresence mode="popLayout">
          {isQuickAdding ? (
            <motion.form
              key="quick-add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleQuickAdd}
              className="flex flex-col gap-2 pt-1"
            >
              <input
                ref={inputRef}
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--accent-glow)]"
                onKeyDown={e => { if (e.key === 'Escape') { setIsQuickAdding(false); setNewTaskTitle('') } }}
              />
              <div className="flex items-center gap-1.5">
                <Button type="submit" size="xs" disabled={!newTaskTitle.trim() || createTaskMutation.isPending} className="gap-1">
                  <Icons.plus className="w-3 h-3" /> Add
                </Button>
                <Button type="button" variant="ghost" size="xs" onClick={() => { setIsQuickAdding(false); setNewTaskTitle('') }}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              key="quick-add-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={startQuickAdd}
              className="flex items-center gap-1.5 w-full px-2 py-2 rounded-lg text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/60 transition-colors font-medium"
            >
              <Icons.plus className="w-3.5 h-3.5" />
              Add task
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      </>
      )}
    </div>
  )
}
