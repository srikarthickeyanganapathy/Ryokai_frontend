import React from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'
import { useAuth, usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

/* ─── Priority accent bar colors (left border + glow) ─── */
const PRIORITY_ACCENTS = {
  URGENT:  { bar: '#EF4444', glow: 'rgba(239,68,68,0.12)',  bg: 'rgba(239,68,68,0.03)' },
  HIGH:    { bar: '#F59E0B', glow: 'rgba(245,158,11,0.12)', bg: 'rgba(245,158,11,0.03)' },
  MEDIUM:  { bar: '#3B82F6', glow: 'rgba(59,130,246,0.10)', bg: 'rgba(59,130,246,0.02)' },
  LOW:     { bar: '#6B7280', glow: 'rgba(107,114,128,0.08)', bg: 'transparent' },
}
const DEFAULT_ACCENT = { bar: 'var(--border-subtle)', glow: 'transparent', bg: 'transparent' }

function getDueInfo(dueDate) {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Overdue', color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-soft)]' }
  if (diffDays === 0) return { label: 'Today', color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-soft)]' }
  if (diffDays <= 2) return { label: 'Soon', color: 'text-amber-400', bg: 'bg-amber-500/10' }
  return null
}

export function KanbanTaskCard({ task, onClick }) {
  const { user } = useAuth()
  const { canEditTask, isSuperAdmin } = usePermissions()
  const { workspaceMode } = useWorkspace()

  const assigneeUsername = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo);
  const creatorUsername = typeof task.creator === 'object' ? task.creator?.username : task.creator;
  const isAssignee = assigneeUsername === user?.username || assigneeUsername === user?.id || (typeof task.assignee === 'object' && task.assignee?.id === user?.id);
  const isCreator = creatorUsername === user?.username || (typeof task.creator === 'object' && task.creator?.id === user?.id) || task.createdBy === user?.id;
  const isAuthorized = workspaceMode === 'PERSONAL' || isSuperAdmin || canEditTask || isAssignee || isCreator;

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task }, disabled: !isAuthorized })

  const style = { transform: CSS.Transform.toString(transform), transition }

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="w-full min-h-[100px] bg-[var(--bg-elevated)]/50 border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] opacity-50" />
    )
  }

  const accent = PRIORITY_ACCENTS[task.priority] || DEFAULT_ACCENT
  const isDone = task.status === 'Done' || task.status === 'COMPLETED' || task.status === 'APPROVED'
  const dueInfo = getDueInfo(task.dueDate)
  const initials = (typeof task.assignedTo === 'object' ? task.assignedTo?.username : task.assignedTo || '')
    .slice(0, 2).toUpperCase() || '?'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={isDragging ? undefined : { y: -2, scale: 1.01 }}
      whileTap={isDragging ? undefined : { scale: 0.98 }}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className={cn(
        "group relative bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-3.5 mb-2.5 touch-none",
        "border border-[var(--border-subtle)] hover:border-[var(--border-strong)]",
        "shadow-[var(--inset-highlight-soft)] hover:shadow-[var(--shadow-md),var(--inset-highlight)]",
        "transition-shadow duration-200",
        isAuthorized ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDone && "opacity-75"
      )}
    >
      {/* Priority accent bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
        style={{ backgroundColor: accent.bar }}
      />

      {/* Title */}
      <h4 className={cn(
        "text-[13px] font-medium leading-snug line-clamp-2 mb-2 pr-1",
        isDone && "line-through text-[var(--text-secondary)]"
      )}>
        {task.title}
      </h4>

      {/* Tags & Priority row */}
      <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
        <Badge size="xs" className={cn(PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM, "font-medium")}>
          {normalizePriority(task.priority)}
        </Badge>
        {task.projectName && (
          <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-md font-medium truncate max-w-[100px]">
            {task.projectName}
          </span>
        )}
      </div>

      {/* Footer: Due date + Assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.dueDate ? (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
              dueInfo ? `${dueInfo.color} ${dueInfo.bg}` : "text-[var(--text-muted)] bg-[var(--bg-subtle)]"
            )}>
              <Icons.calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              {dueInfo && <span className="font-semibold">· {dueInfo.label}</span>}
            </span>
          ) : (
            <span className="text-[10px] text-[var(--text-muted)]">—</span>
          )}
        </div>
        
        {task.assignedTo && (
          <div
            className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-[var(--bg-elevated)] shadow-sm"
            title={typeof task.assignedTo === 'object' ? task.assignedTo.username : task.assignedTo}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[var(--radius-md)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `0 4px 16px ${accent.glow}` }}
      />
    </motion.div>
  )
}
