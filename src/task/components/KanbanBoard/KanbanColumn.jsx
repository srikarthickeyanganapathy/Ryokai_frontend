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
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

/* ─── Column accent styles ─── */
const COLUMN_STYLES = {
  'To Do':       { accent: '#3B82F6', bg: 'rgba(59,130,246,0.025)', border: 'rgba(59,130,246,0.10)', dot: '#3B82F6' },
  'In Progress': { accent: '#F59E0B', bg: 'rgba(245,158,11,0.025)', border: 'rgba(245,158,11,0.10)', dot: '#F59E0B' },
  'In Review':   { accent: '#8B5CF6', bg: 'rgba(139,92,246,0.025)', border: 'rgba(139,92,246,0.10)', dot: '#8B5CF6' },
  'Done':        { accent: '#10B981', bg: 'rgba(16,185,129,0.025)', border: 'rgba(16,185,129,0.10)', dot: '#10B981' },
}

export function KanbanColumn({ column, tasks, onTaskClick, onQuickComplete, onQuickDelete }) {
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
  const style = COLUMN_STYLES[column.id] || {
    accent: 'var(--border-subtle)', bg: 'var(--bg-subtle)', border: 'var(--border-subtle)', dot: 'var(--text-muted)'
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) { setIsQuickAdding(false); return }
    const statusPayload = column.backendStatus?.[0]
    createTaskMutation.mutate(
      { title: newTaskTitle, orgId: activeOrganization?.id || null, ...(statusPayload && { status: statusPayload }) },
      { onSuccess: () => { setNewTaskTitle(''); setIsQuickAdding(false) } }
    )
  }

  const startQuickAdd = () => {
    setIsQuickAdding(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col rounded-lg border shadow-[var(--shadow-xs)] transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)] overflow-hidden",
        collapsed ? "w-[52px] min-w-[52px] flex-none" : "w-[85vw] max-w-[320px] sm:w-[320px] flex-shrink-0"
      )}
      style={{ backgroundColor: style.bg, borderColor: isOver ? style.accent : style.border }}
    >
      {/* Column header */}
      <div
        className={cn("p-3 flex items-center justify-between shrink-0", !collapsed && "border-b")}
        style={{ borderColor: style.border }}
      >
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mx-auto transition-colors"
            title={`Expand ${column.title}`}
          >
            <Icons.chevronRight className="w-4 h-4" />
            <span className="text-[11px] font-bold [writing-mode:vertical-rl] rotate-180 tracking-wide">{column.title}</span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums">{tasks.length}</span>
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: style.dot }} />
              <Heading level={4} className="text-[12px] font-bold text-[var(--text-primary)] truncate uppercase tracking-wide">
                {column.title}
              </Heading>
              <motion.span
                key={`count-${tasks.length}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--bg-card)] text-[11px] font-bold tabular-nums text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0"
              >
                {tasks.length}
              </motion.span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shrink-0"
              title="Collapse column"
            >
              <Icons.chevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Task list */}
          <div className="flex-1 px-2 pt-2 pb-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
              <div
                ref={setNodeRef}
                className={cn(
                  "flex-1 flex flex-col rounded-xl transition-colors duration-[var(--duration-base)]",
                  isOver && "bg-[var(--accent-soft)]/30 ring-1 ring-[var(--accent-border)]"
                )}
                style={{ minHeight: tasks.length === 0 ? '80px' : 'auto' }}
              >
                <AnimatePresence mode="popLayout">
                  {tasks.map(task => (
                    <KanbanTaskCard key={task.id} task={task} onClick={onTaskClick} onQuickComplete={onQuickComplete} onQuickDelete={onQuickDelete} />
                  ))}
                </AnimatePresence>

                {tasks.length === 0 && !isQuickAdding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center flex-1 gap-3 py-10 px-3 border-2 border-dashed rounded-xl text-center"
                    style={{ borderColor: style.border }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: style.bg }}
                    >
                      <Icons.inbox className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-[var(--text-secondary)]">No tasks</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Drop or add tasks here</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </SortableContext>

            {/* Quick-add */}
            <AnimatePresence mode="popLayout">
              {isQuickAdding ? (
                <motion.form
                  key="quick-add-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleQuickAdd}
                  className="flex flex-col gap-2 pt-2 pb-1"
                >
                  <input
                    ref={inputRef}
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--accent-glow)] transition-all"
                    onKeyDown={e => { if (e.key === 'Escape') { setIsQuickAdding(false); setNewTaskTitle('') } }}
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" size="xs" disabled={!newTaskTitle.trim() || createTaskMutation.isPending} className="gap-1.5 font-medium">
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
                  className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/60 transition-colors font-medium"
                >
                  <Icons.plus className="w-3.5 h-3.5" />
                  Add task
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  )
}
