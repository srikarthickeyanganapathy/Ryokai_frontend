import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'

const priorityColors = {
  URGENT: 'bg-red-500/10 text-red-600 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  NORMAL: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
  NONE: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]',
}

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
        className="w-full min-h-[100px] bg-[var(--bg-elevated)]/50 border-2 border-dashed border-[var(--color-border-default)] rounded-xl opacity-50" 
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
      className="group bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] hover:border-[var(--color-border-default)] transition-all cursor-grab active:cursor-grabbing mb-3 touch-none"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium leading-snug line-clamp-2">
          {task.title}
        </h4>
      </div>

      <div className="flex items-center flex-wrap gap-2 mt-3">
        <Badge variant="outline" className={cn("text-[10px]", priorityColors[task.priority])}>
          {normalizePriority(task.priority)}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center text-[var(--text-secondary)] text-xs gap-1">
          {task.dueDate ? (
            <>
              <Icons.alert className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </>
          ) : (
            <span className="text-[var(--text-muted)]">-</span>
          )}
        </div>
        
        {/* Assignee Avatar */}
        {task.assignedTo && (
          <div 
            className="w-6 h-6 rounded-full bg-[var(--accent-cyan)] text-white flex items-center justify-center text-[10px] font-medium shadow-sm"
            title={task.assignedTo}
          >
            {task.assignedTo.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
