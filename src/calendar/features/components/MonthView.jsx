import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import React, { useMemo, useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isWeekend, parseISO } from 'date-fns'
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useUpdateTask } from '@/task'
import { useUpdateEvent } from '../hooks/useCalendar'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { PRIORITY_COLORS } from '@/shared/lib/priority'
import { cn } from '@/shared/lib/cn'
import { Flag, Plus } from '@/shared/ui/Icons'
import { toast } from 'sonner'

function CalendarDayCell({ day, isCurrentMonth, heat = 0, children, onAddClick, onSelectDay }) {
  const { setNodeRef, isOver } = useDroppable({ id: format(day, 'yyyy-MM-dd') })
  const weekend = isWeekend(day)
  return (
    <div ref={setNodeRef} className={cn("h-full min-h-0 p-1.5 border-b border-r border-[var(--border-subtle)] bg-[var(--bg-base)] transition-colors group relative flex flex-col overflow-hidden", !isCurrentMonth && "bg-[var(--bg-subtle)]/30 opacity-50", weekend && isCurrentMonth && "bg-[var(--bg-subtle)]/20", isOver && "bg-[var(--accent-soft)] ring-2 ring-inset ring-[var(--accent)]/50")}>
      {/* Rhythm heat — intensity ∝ item count */}
      {heat > 0 && <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--accent)', opacity: heat }} />}
      <div className="flex items-center justify-between mb-1 shrink-0 relative">
        <button
          onClick={() => onSelectDay && onSelectDay(day)}
          className={cn("text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-[var(--bg-hover)]", isToday(day) ? "bg-[var(--accent)] text-[var(--text-primary)] ring-2 ring-[var(--accent)]/30" : "text-[var(--text-secondary)]")}
          title="Open day brief"
        >
          {format(day, 'd')}
        </button>
        {isToday(day) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />}
        <Button variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddClick(day) }} className="opacity-0 group-hover:opacity-100 p-0.5 w-5 h-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-all flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div className="relative flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-0.5">{children}</div>
    </div>
  )
}

function CalendarTaskChip({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: task })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50, opacity: 0.8 } : undefined
  const typeColors = { MILESTONE: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]' }
  const colorClass = task.type === 'MILESTONE' ? typeColors.MILESTONE : (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={(e) => { if (!isDragging) onClick(task) }} className={cn("px-1.5 py-0.5 text-[11px] rounded border truncate cursor-grab active:cursor-grabbing transition-colors", colorClass, task.status === 'Done' && "opacity-50 line-through")}>
      {task.type === 'MILESTONE' && <Flag className="w-2.5 h-2.5 inline mr-1 -mt-0.5 align-middle text-purple-500" />}{task.title}
    </div>
  )
}

function CalendarEventChip({ event, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `event-${event.id}`, data: { ...event, __type: 'event' } })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50, opacity: 0.8 } : undefined
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={(e) => { if (!isDragging) onClick(event) }} className="px-1.5 py-0.5 text-[11px] rounded border truncate cursor-grab active:cursor-grabbing bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />{event.title}
    </div>
  )
}

export function MonthView({ tasks = [], events = [], currentDate, isLoading, onTaskClick, onEventClick, onAddClick, onSelectDay }) {
  const updateTaskMutation = useUpdateTask()
  const updateEventMutation = useUpdateEvent()
  const [taskDateOverrides, setTaskDateOverrides] = useState({})
  const [eventDateOverrides, setEventDateOverrides] = useState({})

  const effectiveTasks = useMemo(() => tasks.map(t => taskDateOverrides[t.id] ? { ...t, dueDate: taskDateOverrides[t.id] } : t), [tasks, taskDateOverrides])
  const effectiveEvents = useMemo(() => events.map(e => eventDateOverrides[e.id] ? { ...e, startTime: eventDateOverrides[e.id].startTime, endTime: eventDateOverrides[e.id].endTime } : e), [events, eventDateOverrides])

  const rollbackTaskDate = (taskId) => setTaskDateOverrides(prev => { const c = { ...prev }; delete c[taskId]; return c })
  const rollbackEventDate = (eventId) => setEventDateOverrides(prev => { const c = { ...prev }; delete c[eventId]; return c })

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }))

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
      const [y, m, d] = newDateStr.split('-').map(Number)
      const newStart = new Date(y, m - 1, d)
      newStart.setHours(new Date(original.startTime).getHours(), new Date(original.startTime).getMinutes())
      const newEnd = new Date(newStart.getTime() + durationMs)

      setEventDateOverrides(prev => ({ ...prev, [eventId]: { startTime: newStart.toISOString(), endTime: newEnd.toISOString() } }))
      updateEventMutation.mutate({ id: eventId, payload: { ...original, startTime: newStart.toISOString(), endTime: newEnd.toISOString() } }, { onError: () => { toast.error('Failed to update event'); rollbackEventDate(eventId) } })
      return
    }

    const taskId = active.id
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const [y, m, d] = newDateStr.split('-').map(Number)
    const newDueDate = new Date(y, m - 1, d)
    if (task.dueDate) newDueDate.setHours(new Date(task.dueDate).getHours(), new Date(task.dueDate).getMinutes())
    const newDueDateIso = newDueDate.toISOString()

    setTaskDateOverrides(prev => ({ ...prev, [taskId]: newDueDateIso }))
    updateTaskMutation.mutate({ id: taskId, payload: { dueDate: newDueDateIso } }, { onError: () => { toast.error('Failed to update task deadline'); rollbackTaskDate(taskId) } })
  }

  const tasksByDate = useMemo(() => {
    const map = {}
    effectiveTasks.forEach(task => { if (task.dueDate) { const k = format(parseISO(task.dueDate), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(task) } })
    return map
  }, [effectiveTasks])

  const eventsByDate = useMemo(() => {
    const map = {}
    effectiveEvents.forEach(ev => { if (ev.startTime) { const k = format(parseISO(ev.startTime), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(ev) } })
    return map
  }, [effectiveEvents])

  /* per-day counts for the Rhythm Heat */
  const dayCounts = useMemo(() => {
    const counts = {}
    days.forEach(d => { const k = format(d, 'yyyy-MM-dd'); counts[k] = (tasksByDate[k]?.length || 0) + (eventsByDate[k]?.length || 0) })
    return counts
  }, [days, tasksByDate, eventsByDate])
  const maxCount = useMemo(() => Math.max(1, ...Object.values(dayCounts)), [dayCounts])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-2 p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr min-h-[400px]">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-full min-h-[80px] w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
          {weekDays.map(day => <div key={day} className="py-2 text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            return (
              <CalendarDayCell key={day.toISOString()} day={day} isCurrentMonth={isSameMonth(day, currentDate)} heat={dayCounts[dateKey] > 0 ? 0.04 + (dayCounts[dateKey] / maxCount) * 0.12 : 0} onAddClick={onAddClick} onSelectDay={onSelectDay}>
                {(tasksByDate[dateKey] || []).map(task => <CalendarTaskChip key={task.id} task={task} onClick={onTaskClick} />)}
                {(eventsByDate[dateKey] || []).map(ev => <CalendarEventChip key={ev.id} event={ev} onClick={onEventClick} />)}
              </CalendarDayCell>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}