import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { normalizePriority, PRIORITY_HEX } from '@/shared/lib/priority'

/* ============================================================
   components/TaskCard.jsx — board card from the approved demo:
   priority dot, due chip, hover quick-complete, click-avatar
   reassign popover (with current-assignee check), focus pulse.
   Assign routes to the page's real reassignTaskMutation.
   ============================================================ */

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

function dueInfo(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  const days = Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (days < 0) return { label: days === -1 ? 'Overdue' : `${Math.abs(days)}d overdue`, variant: 'danger' }
  if (days === 0) return { label: 'Today', variant: 'warning' }
  if (days === 1) return { label: 'Tomorrow', variant: 'warning' }
  if (days <= 7) return { label: `${days}d`, variant: 'warning' }
  return { label: new Date(dateInput).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), variant: 'outline' }
}

export function TaskCard({
  task,
  canAssignTask,
  canDrag,
  onDragStart,
  assigningTaskId,
  setAssigningTaskId,
  assignableMembers = [],
  onAssign,
  onUpdateStatus,
  onClick,
}) {
  const due = dueInfo(task.dueDate)
  const prio = normalizePriority(task.priority)
  const assignee = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo)
  const done = (task.currentStatus || task.status || '').toUpperCase() === 'DONE'
  const isAssigning = assigningTaskId === String(task.id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ y: -1 }}
      draggable={!!canDrag}
      onDragStart={onDragStart ? e => onDragStart(e, task) : undefined}
      onClick={onClick}
      className={`group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[11px] p-2.5 shadow-[var(--shadow-xs)] cursor-pointer hover:border-[var(--accent-border)] transition-colors ${isAssigning ? 'ring-2 ring-[var(--accent)]/30' : ''}`}
    >
      <p className={`text-[12.5px] font-semibold leading-snug mb-2 ${done ? 'line-through text-[var(--text-muted)]' : ''}`}>
        {task.title || 'Untitled task'}
      </p>

      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_HEX[prio] || '#9a9ba6' }} />
        {due && <Badge variant={due.variant} size="sm">{due.label}</Badge>}
        <span className="flex-1" />
        {!done && onUpdateStatus && (
          <button
            onClick={e => { e.stopPropagation(); onUpdateStatus(task) }}
            title="Mark complete"
            className="p-1 rounded-md text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--success)] hover:bg-[var(--success-soft)] transition-all cursor-pointer"
          >
            <Check className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
        {(assignee || canAssignTask) && (
          <Popover open={assigningTaskId === String(task.id)} onOpenChange={o => setAssigningTaskId(o ? String(task.id) : null)}>
            <PopoverTrigger asChild>
              {assignee ? (
                <button onClick={e => e.stopPropagation()} title={assignee} className="shrink-0 cursor-pointer">
                  <Avatar size="xs">
                    <AvatarFallback style={{ background: `linear-gradient(135deg, hsl(${hashHue(assignee)} 72% 52%), hsl(${(hashHue(assignee) + 35) % 360} 68% 38%))`, color: '#fff', fontSize: 8, fontWeight: 700 }}>
                      {assignee.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <button
                  onClick={e => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] flex items-center justify-center text-[13px] shrink-0 cursor-pointer"
                  title="Assign"
                >
                  +
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1.5" align="end">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">Assign to</div>
              {assignableMembers.map(m => {
                const name = m.username || m.name
                const on = name === assignee
                return (
                  <button
                    key={String(m.userId || m.id || name)}
                    onClick={() => { onAssign(task, m.userId || m.id, name); setAssigningTaskId(null) }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[12px] font-medium text-left hover:bg-[var(--bg-subtle)] cursor-pointer"
                  >
                    <Avatar size="xs">
                      <AvatarFallback style={{ background: `linear-gradient(135deg, hsl(${hashHue(name)} 72% 52%), hsl(${(hashHue(name) + 35) % 360} 68% 38%))`, color: '#fff', fontSize: 8, fontWeight: 700 }}>
                        {name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{name}</span>
                    {on && <Check className="w-3 h-3 ml-auto text-[var(--accent)] shrink-0" strokeWidth={3} />}
                  </button>
                )
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </motion.div>
  )
}

export default TaskCard
