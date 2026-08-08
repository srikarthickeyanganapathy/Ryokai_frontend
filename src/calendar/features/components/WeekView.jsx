import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import React, { useMemo, useState, useCallback, useRef } from 'react'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, parseISO, isSameDay } from 'date-fns'
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import { useUpdateEvent } from '../hooks/useCalendar'
import { PRIORITY_COLORS } from '@/shared/lib/priority'
import { cn } from '@/shared/lib/cn'
import { Flag, Plus, CalendarClock } from '@/shared/ui/Icons'
import { toast } from 'sonner'

const HOUR_START = 7
const HOUR_END = 22
const HOUR_PX = 52
const SNAP_MINUTES = 15
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

/** Snap a total-minutes value to the nearest SNAP_MINUTES grid */
function snapMinutes(m) { return Math.round(m / SNAP_MINUTES) * SNAP_MINUTES }

/* ──────────────────────────────────────────────────────────
 * TimeBlock — draggable + resizable event block
 * ────────────────────────────────────────────────────────── */
function TimeBlock({ event, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `event-${event.id}`, data: { __type: 'event', id: event.id } })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50, opacity: 0.85 } : undefined

  const start = parseISO(event.startTime)
  const end = event.endTime ? parseISO(event.endTime) : null
  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMin = end ? end.getHours() * 60 + end.getMinutes() : startMin + 60
  const top = Math.max(0, (startMin - HOUR_START * 60) / 60) * HOUR_PX
  const height = Math.max(22, Math.min(((endMin - startMin) / 60) * HOUR_PX, (HOUR_END - HOUR_START) * HOUR_PX - top))

  // ── Resize state (pointer events, no re-render until commit) ──
  const [resizing, setResizing] = useState(null) // { startY, origEndMin } | null
  const resizeRef = useRef(null)

  const handleResizePointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation() // prevent dnd-kit drag
    setResizing({ startY: e.clientY, origEndMin: endMin, origTop: top, origHeight: height })
    const onMove = (me) => {
      if (!resizeRef.current) return
      const dy = me.clientY - resizeRef.current.startY
      const dMin = snapMinutes((dy / HOUR_PX) * 60)
      const newEndMin = Math.max(resizeRef.current.origEndMin + dMin, startMin + SNAP_MINUTES)
      const newHeight = Math.max(22, ((newEndMin - startMin) / 60) * HOUR_PX)
      const el = resizeRef.current.el
      if (el) el.style.height = `${newHeight}px`
    }
    const onUp = (me) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (!resizeRef.current) return
      const dy = me.clientY - resizeRef.current.startY
      const dMin = snapMinutes((dy / HOUR_PX) * 60)
      const newEndMin = Math.max(resizeRef.current.origEndMin + dMin, startMin + SNAP_MINUTES)
      setResizing(null)
      if (newEndMin !== resizeRef.current.origEndMin) {
        const newEndDate = new Date(start)
        newEndDate.setMinutes(newEndMin % 60, 0, 0)
        newEndDate.setHours(Math.floor(newEndMin / 60))
        // Dispatch custom event for WeekView to handle commit
        window.dispatchEvent(new CustomEvent('ryokai-event-resize', {
          detail: { eventId: event.id, newEndTime: newEndDate.toISOString() }
        }))
      }
      resizeRef.current = null
    }
    resizeRef.current = { startY: e.clientY, origEndMin: endMin, origTop: top, origHeight: height }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={(el) => {
        setNodeRef(el)
        if (el) {
          if (!resizeRef.current) resizeRef.current = {} // ensure .el slot exists
          resizeRef.current.el = el
        }
      }}
      style={{ ...style, top, height }}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); if (!isDragging && !resizing) onClick(event) }}
      className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] cursor-grab active:cursor-grabbing overflow-hidden hover:border-[var(--accent)] hover:shadow-md transition-all"
      title={`${event.title} — drag to reschedule, bottom edge to resize`}
    >
      <div className="font-semibold truncate leading-tight">{event.title}</div>
      {height > 34 && <div className="opacity-75 truncate leading-tight">{format(start, 'h:mm')}–{end ? format(end, 'h:mm a') : ''}</div>}
      {/* Resize handle — 6px hit zone at bottom */}
      <div
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-0 left-0 right-0 h-[6px] cursor-ns-resize hover:bg-[var(--accent)]/40 active:bg-[var(--accent)]/60 rounded-b-md transition-colors"
        title="Drag to resize"
      />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * DayColumn — droppable time column with hour gridlines
 * ────────────────────────────────────────────────────────── */
function DayColumn({ day, isToday: today, children, onSlotClick, heat }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${format(day, 'yyyy-MM-dd')}` })
  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        if (isOver) return
        if (!onSlotClick) return
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const minutes = HOUR_START * 60 + (y / HOUR_PX) * 60
        const rounded = Math.round(minutes / 30) * 30
        const d = new Date(day)
        d.setHours(Math.floor(rounded / 60), rounded % 60, 0, 0)
        onSlotClick(d)
      }}
      className={cn('relative border-r border-[var(--border-subtle)] last:border-r-0 transition-colors', isOver && 'bg-[var(--accent-soft)]/60')}
    >
      {heat > 0 && <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'var(--accent)', opacity: heat }} />}
      {HOURS.map(h => (
        <div key={h} className="absolute left-0 right-0 border-t border-[var(--border-subtle)]/70 pointer-events-none" style={{ top: (h - HOUR_START) * HOUR_PX }} />
      ))}
      {children}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
 * WeekView — Time Grid (07:00–22:00, 30-min precision,
 * current-time line, all-day lane, drag-to-move,
 * drag-to-resize, click-to-add)
 * ══════════════════════════════════════════════════════ */
export function WeekView({ tasks = [], events = [], currentDate, isLoading, onTaskClick, onEventClick, onAddClick, onSelectDay }) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const updateEventMutation = useUpdateEvent()
  const [eventDateOverrides, setEventDateOverrides] = useState({})
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  // Listen for resize commits from TimeBlock
  React.useEffect(() => {
    const handler = (e) => {
      const { eventId, newEndTime } = e.detail || {}
      if (!eventId || !newEndTime) return
      const original = events.find(ev => ev.id === eventId)
      if (!original) return
      updateEventMutation.mutate(
        { id: eventId, payload: { ...original, endTime: newEndTime } },
        { onError: () => toast.error('Failed to resize event') }
      )
    }
    window.addEventListener('ryokai-event-resize', handler)
    return () => window.removeEventListener('ryokai-event-resize', handler)
  }, [events, updateEventMutation])

  const effectiveEvents = useMemo(() => events.map(ev => eventDateOverrides[ev.id] ? { ...ev, startTime: eventDateOverrides[ev.id].startTime, endTime: eventDateOverrides[ev.id].endTime } : ev), [events, eventDateOverrides])

  const rollback = (eventId) => setEventDateOverrides(prev => { const c = { ...prev }; delete c[eventId]; return c })

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || !String(over.id).startsWith('day-')) return
    const dateKey = String(over.id).replace('day-', '')
    const dragged = active.data.current
    if (dragged?.__type !== 'event') return
    const original = events.find(e => e.id === dragged.id)
    if (!original || !original.startTime) return
    const durationMs = Math.max(30 * 60 * 1000, new Date(original.endTime) - new Date(original.startTime))
    const [y, m, d] = dateKey.split('-').map(Number)
    const newStart = new Date(y, m - 1, d)
    newStart.setHours(new Date(original.startTime).getHours(), new Date(original.startTime).getMinutes())
    const newEnd = new Date(newStart.getTime() + durationMs)
    setEventDateOverrides(prev => ({ ...prev, [original.id]: { startTime: newStart.toISOString(), endTime: newEnd.toISOString() } }))
    updateEventMutation.mutate(
      { id: original.id, payload: { ...original, startTime: newStart.toISOString(), endTime: newEnd.toISOString() } },
      { onError: () => { toast.error('Failed to move event'); rollback(original.id) } }
    )
  }

  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(task => { if (task.dueDate) { const k = format(parseISO(task.dueDate), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(task) } })
    return map
  }, [tasks])

  const eventsByDate = useMemo(() => {
    const map = {}
    effectiveEvents.forEach(ev => { if (ev.startTime) { const k = format(parseISO(ev.startTime), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(ev) } })
    return map
  }, [effectiveEvents])

  const weekHasItems = useMemo(() => {
    return tasks.some(t => t.dueDate && days.some(d => isSameDay(parseISO(t.dueDate), d))) ||
      events.some(e => e.startTime && days.some(d => isSameDay(parseISO(e.startTime), d)))
  }, [tasks, events, days])

  const maxCount = useMemo(() => {
    let max = 0
    days.forEach(d => { const k = format(d, 'yyyy-MM-dd'); max = Math.max(max, (tasksByDate[k]?.length || 0) + (eventsByDate[k]?.length || 0)) })
    return max || 1
  }, [days, tasksByDate, eventsByDate])

  const layoutEvents = (dayEvents) => {
    const sorted = [...dayEvents].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    const lanes = []
    const placed = sorted.map(ev => {
      const start = new Date(ev.startTime).getTime()
      const end = new Date(ev.endTime || ev.startTime).getTime() + 1
      let lane = lanes.findIndex(l => l.end <= start)
      if (lane === -1) { lane = lanes.length; lanes.push({ end }) } else lanes[lane].end = Math.max(lanes[lane].end, end)
      return { ev, lane }
    })
    const count = Math.max(1, lanes.length)
    return placed.map(p => ({ ...p, width: 100 / count, left: p.lane * (100 / count) }))
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[600px] gap-2 p-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="flex-1 min-h-[500px] w-full rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  const now = new Date()

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="relative flex flex-col h-full min-h-0">
        {/* Header row: day names + all-day lane */}
        <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-end justify-center pb-2"><span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">hrs</span></div>
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const allDayEvents = (eventsByDate[dateKey] || []).filter(ev => ev.isAllDay)
            const dayTasks = (tasksByDate[dateKey] || []).filter(t => t.status !== 'Done')
            const typeColors = { MILESTONE: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
            return (
              <div key={dateKey} className="px-1 pb-1.5 border-r border-[var(--border-subtle)] last:border-r-0">
                <div className="text-center relative group">
                  <div className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{format(day, 'EEE')}</div>
                  <button
                    onClick={() => onSelectDay && onSelectDay(day)}
                    className={cn('text-[13px] font-semibold w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-[var(--bg-hover)]', isToday(day) ? 'bg-[var(--accent)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-primary)]')}
                    title="Open day brief"
                  >
                    {format(day, 'd')}
                  </button>
                </div>
                {(allDayEvents.length > 0 || dayTasks.length > 0) && (
                  <div className="mt-1 space-y-0.5 max-h-14 overflow-y-auto custom-scrollbar">
                    {allDayEvents.map(ev => (
                      <div key={`allday-${ev.id}`} onClick={() => onEventClick && onEventClick(ev)} className="px-1.5 py-0.5 rounded border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] text-[9px] font-medium truncate cursor-pointer hover:border-[var(--accent)] transition-colors">
                        {ev.title} <span className="opacity-60 font-normal">· all day</span>
                      </div>
                    ))}
                    {dayTasks.map(task => {
                      const colorClass = task.type === 'MILESTONE' ? typeColors.MILESTONE : (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)
                      return (
                        <div key={`task-${task.id}`} onClick={() => onTaskClick && onTaskClick(task)} className={cn('px-1.5 py-0.5 rounded border text-[9px] font-medium truncate cursor-pointer hover:border-[var(--accent)] transition-colors', colorClass, task.status === 'Done' && 'opacity-50 line-through')}>
                          {task.type === 'MILESTONE' && <Flag className="w-2 h-2 inline mr-0.5 -mt-0.5 align-middle text-purple-500" />}
                          {task.title}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Scrollable time grid */}
        <div className="flex-1 overflow-y-auto min-h-0 relative">
          <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
            {/* Hour labels */}
            {HOURS.map(h => (
              <div key={h} className="absolute -left-0 w-10 text-right pr-2 text-[9px] font-mono text-[var(--text-tertiary)] pointer-events-none" style={{ top: (h - HOUR_START) * HOUR_PX - 5 }}>
                {format(new Date(2000, 0, 1, h, 0), 'ha')}
              </div>
            ))}

            {/* Day columns */}
            <div className="absolute left-11 right-0 top-0 bottom-0 grid grid-cols-7">
              {days.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const timedEvents = (eventsByDate[dateKey] || []).filter(ev => !ev.isAllDay)
                const laid = layoutEvents(timedEvents)
                const count = (tasksByDate[dateKey]?.length || 0) + (eventsByDate[dateKey]?.length || 0)
                const heat = count > 0 ? 0.03 + (count / maxCount) * 0.1 : 0
                return (
                  <DayColumn key={dateKey} day={day} isToday={isToday(day)} onSlotClick={onAddClick} heat={heat}>
                    {laid.map(({ ev, left, width }) => (
                      <div key={ev.id} className="absolute" style={{ left: `${left}%`, width: `${width}%`, top: 0, bottom: 0 }}>
                        <TimeBlock event={ev} onClick={onEventClick} />
                      </div>
                    ))}
                    {isToday(day) && (
                      <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: ((now.getHours() * 60 + now.getMinutes()) - HOUR_START * 60) / 60 * HOUR_PX }}>
                        <div className="relative">
                          <div className="h-[2px] bg-[var(--accent)] rounded-full" />
                          <span className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent)]/20" />
                          <span className="absolute left-3 -top-3 text-[9px] font-mono font-semibold text-[var(--accent)] bg-[var(--bg-card)] px-1 rounded border border-[var(--accent-border)]">
                            {format(now, 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    )}
                  </DayColumn>
                )
              })}
            </div>
          </div>
        </div>

        {!weekHasItems && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-center bg-[var(--bg-base)]/70 backdrop-blur-sm rounded-2xl border border-dashed border-[var(--border-subtle)] px-6 py-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <p className="text-[12px] font-semibold text-[var(--text-primary)]">Nothing scheduled this week</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Click any time slot to add an event, or drag tasks onto days.</p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}