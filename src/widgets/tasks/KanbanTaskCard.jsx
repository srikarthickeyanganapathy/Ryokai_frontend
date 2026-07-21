import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'

export function KanbanTaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Animation/Styling for dragging state
  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="w-full min-h-[100px] bg-[var(--bg-elevated)]/50 border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] opacity-50" 
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-[var(--inset-highlight-soft)] p-3 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md),var(--inset-highlight)] hover:-translate-y-[1px] transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out)] cursor-grab active:cursor-grabbing active:scale-[0.98] mb-2.5 touch-none"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-medium leading-snug line-clamp-2">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center flex-wrap gap-2 mt-3">
        <Badge size="xs" className={cn(PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)}>
          {normalizePriority(task.priority)}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-[var(--text-tertiary)] text-[11px] gap-1">
          {task.dueDate ? (
            <>
              <Icons.alert className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </>
          ) : (
            <span>-</span>
          )}
        </div>
        
        {/* Assignee Avatar */}
        {task.assignedTo && (
          <div 
            className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-medium"
            title={task.assignedTo}
          >
            {task.assignedTo.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}