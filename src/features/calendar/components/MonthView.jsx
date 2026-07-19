import React, { useMemo, useState } from 'react'
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isToday, parseISO
} from 'date-fns'
import { 
  DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors 
} from '@dnd-kit/core'
import { useUpdateTask } from '@/features/tasks/hooks/useTasks'
import { useUpdateEvent } from '@/features/calendar/hooks/useCalendar'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/shared/lib/cn'
import { Plus } from 'lucide-react'

// --- Drag & Drop Sub-components ---

function CalendarDayCell({ day, isCurrentMonth, children, onAddClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] p-2 border-b border-r border-[var(--color-border-subtle)] bg-[var(--bg-default)] transition-colors group relative",
        !isCurrentMonth && "bg-[var(--bg-subtle)]/50 opacity-50",
        isOver && "bg-[var(--bg-elevated)] ring-2 ring-inset ring-[var(--accent)]/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
          isToday(day) ? "bg-[var(--accent)] text-[var(--bg-base)]" : "text-[var(--text-secondary)]"
        )}>
          {format(day, 'd')}
        </span>
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddClick(day)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] rounded transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  )
}

function CalendarTaskChip({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined

  // Color mapping based on priority
  const priorityColors = {
    LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
    NORMAL: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20',
    HIGH: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20',
    URGENT: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20'
  }

  const typeColors = {
    MILESTONE: 'bg-purple-500/10 text-purple-400 border-purple-500/20 ring-1 ring-purple-500/30'
  }

  const colorClass = task.type === 'MILESTONE' ? typeColors.MILESTONE : (priorityColors[task.priority] || priorityColors.NORMAL)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Prevent drag click from firing
        if (!isDragging) {
          onClick(task)
        }
      }}
      className={cn(
        "px-2 py-1 text-xs rounded border truncate cursor-grab active:cursor-grabbing transition-colors",
        colorClass,
        task.status === 'Done' && "opacity-50 line-through"
      )}
    >
      {task.type === 'MILESTONE' && '🎯 '}
      {task.title}
    </div>
  )
}

function CalendarEventChip({ event, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event-${event.id}`,
    data: { ...event, __type: 'event' },
  })
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) onClick(event) }}
      className="px-2 py-1 text-xs rounded border truncate cursor-grab active:cursor-grabbing bg-[var(--info-soft,rgba(59,130,246,0.1))] text-blue-400 border-blue-500/20 flex items-center gap-1.5"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
      {event.title}
    </div>
  )
}

// --- Main MonthView Component ---

export function MonthView({ tasks = [], events = [], currentDate, isLoading, onTaskClick, onEventClick, onAddClick }) {
  const updateTaskMutation = useUpdateTask()
  const updateEventMutation = useUpdateEvent()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before dragging starts (allows clicking)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      }
    })
  )

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const newDateStr = over.id
    const dragged = active.data.current

    if (dragged?.__type === 'event') {
      const eventId = dragged.id
      const original = events.find(e => e.id === eventId)
      if (!original) return
      const durationMs = new Date(original.endTime) - new Date(original.startTime)
      const newStart = new Date(newDateStr)
      newStart.setHours(new Date(original.startTime).getHours(), new Date(original.startTime).getMinutes())
      const newEnd = new Date(newStart.getTime() + durationMs)
      updateEventMutation.mutate({
        id: eventId,
        payload: { ...original, startTime: newStart.toISOString(), endTime: newEnd.toISOString() },
      })
      return
    }

    // Existing task-drag path
    const taskId = active.id
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    updateTaskMutation.mutate({ id: taskId, payload: { dueDate: new Date(newDateStr).toISOString() } })
  }

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd')
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(task)
      }
    })
    return map
  }, [tasks])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => {
      if (ev.startTime) {
        const dateKey = format(parseISO(ev.startTime), 'yyyy-MM-dd')
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(ev)
      }
    })
    return map
  }, [events])

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading calendar...</div>
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayTasks = tasksByDate[dateKey] || []
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            
            return (
              <CalendarDayCell 
                key={day.toISOString()} 
                day={day} 
                isCurrentMonth={isCurrentMonth}
                onAddClick={onAddClick}
              >
                {dayTasks.map(task => (
                  <CalendarTaskChip 
                    key={task.id} 
                    task={task} 
                    onClick={onTaskClick}
                  />
                ))}
                {dayEvents.map(ev => (
                  <CalendarEventChip 
                    key={ev.id} 
                    event={ev} 
                    onClick={onEventClick}
                  />
                ))}
              </CalendarDayCell>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}
